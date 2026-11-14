import "server-only";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";

export interface Triple {
  subject: string;
  subject_type: string;
  relation: string;
  object: string;
  object_type: string;
}

const KGSchema = z.object({
  triples: z
    .array(
      z.object({
        subject: z.string().describe("Canonical entity name, e.g. 'John Miller'"),
        subject_type: z.string().describe("Entity type, e.g. Person, Organization, Role, Technology, Concept, Location, Product, Project, Skill"),
        relation: z.string().describe("Relationship in UPPER_SNAKE_CASE, e.g. WORKS_AT, USES, HAS_ROLE, DEVELOPS"),
        object: z.string(),
        object_type: z.string(),
      }),
    )
    .describe("All factual subject-relation-object triples in the text"),
});

const PipelineState = Annotation.Root({
  text: Annotation<string>(),
  allowedTypes: Annotation<string>(),
  raw: Annotation<Triple[]>({ reducer: (_a, b) => b, default: () => [] }),
  triples: Annotation<Triple[]>({ reducer: (_a, b) => b, default: () => [] }),
  issues: Annotation<string[]>({ reducer: (_a, b) => b, default: () => [] }),
  attempts: Annotation<number>({ reducer: (_a, b) => b, default: () => 0 }),
});

const toType = (s: string) =>
  (s || "Entity")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join("") || "Entity";

const toRel = (s: string) =>
  (s || "RELATED_TO")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .toUpperCase() || "RELATED_TO";

const cleanName = (s: string) =>
  s
    .trim()
    .replace(/^(the|a|an)\s+/i, "")
    .replace(/\s+(inc\.?|corp\.?|corporation|ltd\.?|llc)$/i, "")
    .replace(/\s+/g, " ")
    .replace(/[.,;:]+$/, "");

export function buildExtractionPipeline(apiKey: string, model: string) {
  const llm = new ChatGroq({ apiKey, model, temperature: 0, maxRetries: 1 });
  const extractor = llm.withStructuredOutput(KGSchema, { name: "knowledge_graph" });

  /** Node 1 — LLM extraction with a schema-constrained prompt. */
  async function extract(s: typeof PipelineState.State) {
    const hint = s.allowedTypes?.trim() ? `Prefer these entity types: ${s.allowedTypes}.` : "";
    const retry = s.attempts > 0 ? "Your previous attempt returned no valid triples. Be thorough and extract every explicit fact." : "";
    const out = await extractor.invoke([
      new SystemMessage(
        `You are a knowledge-graph extraction engine. Extract factual triples (subject, relation, object) from the text.
Rules: use full canonical names (resolve pronouns like "he"/"she"/"it" to the entity), relation in UPPER_SNAKE_CASE verbs,
types as single PascalCase words. Do not invent facts. ${hint} ${retry}`,
      ),
      new HumanMessage(s.text),
    ]);
    return { raw: out.triples ?? [], attempts: s.attempts + 1 };
  }

  /** Node 2 — deterministic normalisation & entity resolution. */
  async function normalize(s: typeof PipelineState.State) {
    const canon = new Map<string, string>();
    const key = (n: string) => n.toLowerCase().replace(/[^a-z0-9]/g, "");
    const canonical = (n: string) => {
      const c = cleanName(n);
      const k = key(c);
      for (const [ek, ev] of canon) {
        // "John" → "John Miller" when the longer form is known
        if (ek === k || (k.length > 2 && ek.startsWith(k)) || (ek.length > 2 && k.startsWith(ek))) {
          const longer = ev.length >= c.length ? ev : c;
          canon.set(ek, longer);
          canon.set(k, longer);
          return longer;
        }
      }
      canon.set(k, c);
      return c;
    };
    // first pass registers long names first
    [...s.raw].sort((a, b) => b.subject.length - a.subject.length).forEach((t) => canonical(t.subject));
    const triples = s.raw.map((t) => ({
      subject: canonical(t.subject),
      subject_type: toType(t.subject_type),
      relation: toRel(t.relation),
      object: canonical(t.object),
      object_type: toType(t.object_type),
    }));
    return { triples };
  }

  /** Node 3 — validation: drop invalid / duplicate triples and record issues. */
  async function validate(s: typeof PipelineState.State) {
    const issues: string[] = [];
    const seen = new Set<string>();
    const valid: Triple[] = [];
    for (const t of s.triples) {
      const k = `${t.subject}|${t.relation}|${t.object}`.toLowerCase();
      if (!t.subject || !t.object) {
        issues.push(`Dropped triple with empty endpoint: ${JSON.stringify(t)}`);
        continue;
      }
      if (t.subject.toLowerCase() === t.object.toLowerCase()) {
        issues.push(`Dropped self-loop: ${t.subject} -${t.relation}-> ${t.object}`);
        continue;
      }
      if (seen.has(k)) {
        issues.push(`Removed duplicate: ${t.subject} -${t.relation}-> ${t.object}`);
        continue;
      }
      if (t.subject.length > 60 || t.object.length > 60) issues.push(`Long entity name (check): ${t.subject.length > 60 ? t.subject : t.object}`);
      seen.add(k);
      valid.push(t);
    }
    return { triples: valid, issues };
  }

  const route = (s: typeof PipelineState.State) => (s.triples.length === 0 && s.attempts < 2 ? "extract" : END);

  return new StateGraph(PipelineState)
    .addNode("extract", extract)
    .addNode("normalize", normalize)
    .addNode("validate", validate)
    .addEdge(START, "extract")
    .addEdge("extract", "normalize")
    .addEdge("normalize", "validate")
    .addConditionalEdges("validate", route, ["extract", END])
    .compile();
}
