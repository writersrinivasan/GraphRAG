export type GlossaryCategory =
  | "Graph Basics"
  | "Semantic Web / RDF"
  | "Neo4j & Cypher"
  | "Graph Algorithms"
  | "RAG & Retrieval"
  | "Knowledge Extraction"
  | "LLM & Agents"
  | "This App's Stack";

export interface GlossaryTerm {
  id: string;
  term: string;
  aka?: string;
  category: GlossaryCategory;
  short: string; // one-line definition
  detail: string; // fuller explanation
  inApp: { text: string; href: string; where: string };
  example?: { lang: "cypher" | "python" | "text" | "json" | "typescript" | "bash"; code: string };
  related: string[]; // ids
}

export const CATEGORY_COLORS: Record<GlossaryCategory, string> = {
  "Graph Basics": "#c084fc",
  "Semantic Web / RDF": "#22d3ee",
  "Neo4j & Cypher": "#34d399",
  "Graph Algorithms": "#fbbf24",
  "RAG & Retrieval": "#fb923c",
  "Knowledge Extraction": "#f472b6",
  "LLM & Agents": "#818cf8",
  "This App's Stack": "#2dd4bf",
};

export const GLOSSARY: GlossaryTerm[] = [
  // ───────────── Graph Basics ─────────────
  {
    id: "knowledge-graph", term: "Knowledge Graph", aka: "KG", category: "Graph Basics",
    short: "A network of real-world entities and the named relationships between them.",
    detail: "A knowledge graph stores facts as connected data: things (nodes) linked by meaningful relationships (edges), each carrying properties. Because the connections are stored explicitly, you can follow them to answer questions that span many facts.",
    inApp: { text: "NovaTech Labs, the fictional company used in every demo, is a knowledge graph with 53 entities and 103 relationships.", href: "/explorer", where: "Graph Explorer" },
    related: ["node", "edge", "triple", "ontology", "lpg", "rdf"],
  },
  {
    id: "node", term: "Node", aka: "Entity · Vertex", category: "Graph Basics",
    short: "A single thing in the graph: a person, project, technology or concept.",
    detail: "Nodes are drawn as circles. In a labeled property graph a node has one or more labels (its type) and any number of key–value properties.",
    inApp: { text: "Every circle in the graph canvases is a node. Hover one to see its label and properties, and click it to focus on its neighbours.", href: "/explorer", where: "Graph Explorer" },
    example: { lang: "cypher", code: `(:Employee {name: "John Miller", role: "AI Engineer"})` },
    related: ["label", "property", "edge"],
  },
  {
    id: "edge", term: "Relationship", aka: "Edge · Predicate", category: "Graph Basics",
    short: "A named, directed connection between two nodes.",
    detail: "Relationships have a type (WORKS_ON), a direction (from → to) and optional properties. In Neo4j every relationship has exactly one start node and one end node, and you can still query it in either direction.",
    inApp: { text: "NovaTech uses 6 relationship types: WORKS_IN, WORKS_ON, KNOWS, MANAGES, USES and RELATED_TO. Arrows glow yellow when a query or the agent uses them.", href: "/learn/3#s-3.4", where: "Module 3.4 schema" },
    example: { lang: "cypher", code: `(:Employee)-[:KNOWS {level: "Expert"}]->(:Skill)` },
    related: ["node", "property", "directed-edge", "triple"],
  },
  {
    id: "property", term: "Property", aka: "Attribute", category: "Graph Basics",
    short: "A key–value fact stored on a node or relationship.",
    detail: "Properties hold the details: name, role, since, level. Labeled property graphs support properties on relationships too, which basic RDF cannot do without extra modelling.",
    inApp: { text: "Hover an Employee node to see role, since and location. KNOWS relationships carry a level property (Expert / Advanced / Intermediate).", href: "/labs/2", where: "Lab 2 query: Experts who joined before 2020" },
    related: ["node", "edge", "lpg"],
  },
  {
    id: "label", term: "Label", category: "Graph Basics",
    short: "The type or class of a node, such as Employee or Project.",
    detail: "Labels group nodes and let queries and indexes target them: MATCH (e:Employee). Each label has its own colour throughout this app.",
    inApp: { text: "The coloured legend chips on every graph are labels. Toggle them in the Explorer to filter the graph.", href: "/explorer", where: "Graph Explorer filters" },
    related: ["node", "schema", "taxonomy"],
  },
  {
    id: "directed-edge", term: "Directed vs Undirected", category: "Graph Basics",
    short: "Whether a relationship has a meaningful direction.",
    detail: "MANAGES is directed (Priya → John is not the same as John → Priya). Symmetric facts such as COLLEAGUE_OF are effectively undirected. In Cypher, -> follows direction and - ignores it.",
    inApp: { text: "The Lab 2 preset 'Connect John → Neo4j' uses the undirected pattern -[*1..2]-.", href: "/labs/2", where: "Lab 2" },
    related: ["edge", "traversal"],
  },
  {
    id: "triple", term: "Triple", aka: "Subject–Predicate–Object · SPO", category: "Graph Basics",
    short: "The smallest unit of knowledge: (subject) –predicate→ (object).",
    detail: "Any fact can be written as a triple, for example (John, WORKS_FOR, IBM). LLM extraction produces triples, RDF stores triples, and a property graph is built by merging triples into nodes and edges.",
    inApp: { text: "Lab 1 builds a graph from hand-written triples. Lab 3 makes Groq extract triples from text, and Lab 4 turns them into Cypher.", href: "/learn/1#s-1.2", where: "Module 1.2 triple anatomy" },
    example: { lang: "text", code: "John  ──WORKS_AT──▶  Microsoft\nJohn  ──USES──────▶  Python" },
    related: ["rdf", "relation-extraction", "edge"],
  },
  {
    id: "traversal", term: "Graph Traversal", aka: "Hop · Walk", category: "Graph Basics",
    short: "Moving from node to node along relationships to collect connected facts.",
    detail: "Each step across an edge is a hop. Traversal is how graphs answer questions such as 'which technologies does John's manager's team use?', which takes 4 hops.",
    inApp: { text: "Module 1.4's multi-hop demo animates a 4-hop traversal, and Lab 5 shows 1-hop and 2-hop expansion step by step.", href: "/learn/1#s-1.4", where: "Module 1.4" },
    related: ["multi-hop", "variable-length-path", "index-free-adjacency"],
  },
  {
    id: "multi-hop", term: "Multi-hop Reasoning", category: "Graph Basics",
    short: "Answering a question by chaining several relationships.",
    detail: "The answer is not stated in any single place; it emerges from a chain such as A→B→C. This is where vector RAG struggles and Graph RAG shines.",
    inApp: { text: "Module 6.1 decomposes a question into 4 chained sub-queries and runs them live.", href: "/learn/6#s-6.1", where: "Module 6.1 query decomposition" },
    related: ["traversal", "query-decomposition", "graph-rag"],
  },
  {
    id: "adjacency", term: "Adjacency List / Matrix", category: "Graph Basics",
    short: "Two ways to store a graph in memory: neighbour lists or an N×N grid.",
    detail: "An adjacency list stores, for each node, its neighbours (compact for sparse graphs). An adjacency matrix is an N×N grid of 0/1 (fast lookup, used by GNNs, but wasteful for sparse graphs).",
    inApp: { text: "Module 1.3 shows the same graph as a diagram, triples, adjacency list and matrix. Lab 1 has a live adjacency-list tab.", href: "/learn/1#s-1.3", where: "Module 1.3" },
    related: ["triple", "gnn"],
  },

  // ───────────── Semantic Web / RDF ─────────────
  {
    id: "rdf", term: "RDF", aka: "Resource Description Framework", category: "Semantic Web / RDF",
    short: "A W3C standard that represents all data as subject–predicate–object triples identified by URIs.",
    detail: "RDF is the data model of the Semantic Web. Every resource and predicate has a global identifier (a URI), and values are literals. It is designed for sharing and merging data across organisations. Properties on relationships need reification or RDF-star.",
    inApp: { text: "Module 2.3 draws the same fact, 'John works for IBM since 2021', in RDF and in a property graph side by side.", href: "/learn/2#s-2.3", where: "Module 2.3 RDF vs LPG" },
    example: { lang: "text", code: `@prefix ex: <http://novatech.example/> .\nex:JohnMiller  ex:worksOn  ex:KnowledgeGraphAssistant .\nex:JohnMiller  ex:role     "AI Engineer" .` },
    related: ["uri", "literal", "turtle", "sparql", "lpg", "rdf-star", "owl"],
  },
  {
    id: "uri", term: "URI / IRI", aka: "Uniform Resource Identifier · Internationalized Resource Identifier", category: "Semantic Web / RDF",
    short: "A globally unique identifier, written like a web address, used to name things in RDF.",
    detail: "In RDF, 'John' isn't a string. It is something like <http://novatech.example/employee/john-miller>. Using URIs lets two datasets refer to the same entity without ambiguity: if HR and Jira both use the same URI, their facts merge automatically. An IRI is the Unicode-friendly version. Prefixes (ex:) shorten them.",
    inApp: {
      text: "This app uses a Labeled Property Graph, so nodes are identified by a slug id (e.g. john-miller) plus a unique name property, which plays the role of a URI. In RDF, John Miller would be ex:john-miller → http://novatech.example/john-miller. The ex:John and ex:IBM nodes in Module 2.3 are URIs.",
      href: "/learn/2#s-2.3", where: "Module 2.3",
    },
    example: { lang: "text", code: `Full URI : <http://novatech.example/employee/john-miller>\nPrefixed : ex:john-miller      (with @prefix ex: <http://novatech.example/employee/>)\nThis app : node.id = "john-miller", node.name = "John Miller"` },
    related: ["rdf", "entity-resolution", "constraint"],
  },
  {
    id: "literal", term: "Literal", category: "Semantic Web / RDF",
    short: "A plain value in RDF, such as a string, number or date, as opposed to a URI.",
    detail: "In ex:John ex:role \"AI Engineer\", the object is a literal. Literals can carry datatypes (\"2021\"^^xsd:gYear) or language tags (\"Ingénieur\"@fr). Literals cannot be the subject of a triple.",
    inApp: { text: "In the property-graph world of this app, literals correspond to property values such as role: 'AI Engineer'.", href: "/learn/2#s-2.3", where: "Module 2.3 (dashed boxes)" },
    related: ["rdf", "property"],
  },
  {
    id: "turtle", term: "Turtle (.ttl)", aka: "Terse RDF Triple Language", category: "Semantic Web / RDF",
    short: "A human-readable text format for writing RDF triples.",
    detail: "Turtle uses prefixes, semicolons and commas to write triples compactly. Other RDF formats include RDF/XML, JSON-LD (popular on websites via schema.org) and N-Triples.",
    inApp: { text: "The RDF code sample in Module 2.3 is written in Turtle (with RDF-star syntax).", href: "/learn/2#s-2.3", where: "Module 2.3" },
    example: { lang: "text", code: `ex:JohnMiller a ex:Employee ;\n    ex:worksIn ex:AIResearch ;\n    ex:knows ex:Python , ex:AgenticAI .` },
    related: ["rdf", "uri"],
  },
  {
    id: "sparql", term: "SPARQL", category: "Semantic Web / RDF",
    short: "The query language for RDF graphs, which is what Cypher is to property graphs.",
    detail: "SPARQL matches triple patterns with variables (?e). It is a W3C standard supported by triple stores such as GraphDB, Stardog, Amazon Neptune and Apache Jena.",
    inApp: { text: "Compare it with the Cypher in Lab 2: both express 'employees who know Python'.", href: "/labs/2", where: "Lab 2" },
    example: { lang: "text", code: `PREFIX ex: <http://novatech.example/>\nSELECT ?name WHERE {\n  ?e a ex:Employee ; ex:name ?name ; ex:knows ex:Python .\n}` },
    related: ["rdf", "cypher"],
  },
  {
    id: "owl", term: "OWL / RDFS", aka: "Web Ontology Language · RDF Schema", category: "Semantic Web / RDF",
    short: "Vocabularies for defining classes, hierarchies and rules over RDF data.",
    detail: "RDFS adds subClassOf, domain and range. OWL adds richer logic (cardinality, inverse, transitive properties) so a reasoner can infer new facts automatically, e.g. if AIEngineer ⊑ Engineer then every AI Engineer is an Engineer.",
    inApp: { text: "The ontology panel in Module 2.2 uses OWL-style class and relation definitions plus a rule.", href: "/learn/2#s-2.2", where: "Module 2.2" },
    related: ["ontology", "inference", "rdf"],
  },
  {
    id: "rdf-star", term: "Reification / RDF-star", category: "Semantic Web / RDF",
    short: "Ways to attach facts to a triple itself, such as 'since 2021'.",
    detail: "Classic RDF can't put properties on an edge, so you reify: create a statement node that points to subject, predicate and object. RDF-star (RDF 1.2) lets you quote a triple directly: << ex:John ex:worksFor ex:IBM >> ex:since 2021.",
    inApp: { text: "Module 2.3's RDF diagram shows the extra _:stmt1 node needed for 'since 2021'. In the LPG version it is just a property on the edge.", href: "/learn/2#s-2.3", where: "Module 2.3" },
    related: ["rdf", "lpg", "property"],
  },
  {
    id: "lpg", term: "Labeled Property Graph", aka: "LPG · Property Graph", category: "Semantic Web / RDF",
    short: "The graph model used by Neo4j: labeled nodes and typed relationships, both with properties.",
    detail: "LPGs are application-oriented: fast traversal, properties everywhere and no global URIs required. They are queried with Cypher or ISO GQL. Most Graph RAG implementations use LPGs.",
    inApp: { text: "Everything in this app (the NovaTech graph, the labs and the agent) uses the LPG model.", href: "/learn/2#s-2.3", where: "Module 2.3" },
    related: ["rdf", "cypher", "neo4j", "property"],
  },

  // ───────────── Modelling ─────────────
  {
    id: "ontology", term: "Ontology", category: "Graph Basics",
    short: "A formal definition of the concepts, relationships and rules in a domain.",
    detail: "An ontology says what kinds of things exist (Employee, Project), how they may relate (Employee WORKS_ON Project) and what can be inferred. It is the shared vocabulary that keeps a KG consistent.",
    inApp: { text: "The NovaTech schema is a lightweight ontology. The agent receives it in its system prompt so it writes valid Cypher.", href: "/learn/2#s-2.2", where: "Module 2.2" },
    related: ["schema", "taxonomy", "owl"],
  },
  {
    id: "schema", term: "Schema", category: "Graph Basics",
    short: "The structure a graph database expects: labels, relationship types, properties and constraints.",
    detail: "Neo4j is schema-optional, but production graphs define one through constraints and conventions. In Graph RAG, giving the LLM the schema is essential for Text2Cypher.",
    inApp: { text: "See the NovaTech schema text at the bottom of the Graph Explorer. The same text is injected into the agent's prompt.", href: "/explorer", where: "Graph Explorer → schema.txt" },
    related: ["ontology", "constraint", "text2cypher"],
  },
  {
    id: "taxonomy", term: "Taxonomy", category: "Graph Basics",
    short: "A hierarchy of categories connected by IS-A relationships.",
    detail: "AI → Machine Learning → Deep Learning. A taxonomy is a special case of an ontology that contains only parent/child classification.",
    inApp: { text: "Module 2.2 draws the AI → ML → DL taxonomy tree.", href: "/learn/2#s-2.2", where: "Module 2.2" },
    related: ["ontology", "label"],
  },
  {
    id: "inference", term: "Inference", aka: "Rule-based reasoning", category: "Graph Basics",
    short: "Deriving new facts from existing ones using rules or logic.",
    detail: "If a MANAGES b and b WORKS_ON p, then a OVERSEES p. Inferred facts can be computed at query time or materialised into the graph.",
    inApp: { text: "Click 'Apply rule' in Module 2.5 to infer OVERSEES edges live.", href: "/learn/2#s-2.5", where: "Module 2.5" },
    related: ["owl", "ontology", "multi-hop"],
  },

  // ───────────── Neo4j & Cypher ─────────────
  {
    id: "neo4j", term: "Neo4j", category: "Neo4j & Cypher",
    short: "The most widely used native graph database (LPG model, Cypher, ACID transactions).",
    detail: "Neo4j offers AuraDB (managed cloud, free tier) and Desktop (local). It includes vector indexes, the Graph Data Science library and integrations with LangChain and LlamaIndex.",
    inApp: { text: "The browser labs mimic Neo4j. Each lab's 'Do it for real' code runs the same exercise on your AuraDB instance.", href: "/learn/3#s-3.2", where: "Module 3.2 setup" },
    related: ["cypher", "auradb", "bolt", "gds", "vector-index"],
  },
  {
    id: "cypher", term: "Cypher", aka: "openCypher · GQL", category: "Neo4j & Cypher",
    short: "Neo4j's declarative graph query language, written as ASCII art: (a)-[:REL]->(b).",
    detail: "You draw the pattern you want and the engine finds all matches. Core clauses are MATCH, WHERE, RETURN, CREATE, MERGE, SET and DELETE. Its core became the ISO GQL standard (2024).",
    inApp: { text: "Lab 2 runs a real Cypher subset in your browser, and the agent's run_cypher tool executes the Cypher the LLM writes.", href: "/labs/2", where: "Lab 2 Cypher playground" },
    example: { lang: "cypher", code: `MATCH (e:Employee)-[:WORKS_ON]->(p:Project)-[:USES]->(t:Technology)\nWHERE t.name = "Neo4j"\nRETURN e.name, p.name` },
    related: ["match", "merge", "variable-length-path", "text2cypher", "sparql"],
  },
  {
    id: "match", term: "MATCH / OPTIONAL MATCH", category: "Neo4j & Cypher",
    short: "Find every occurrence of a pattern; OPTIONAL returns nulls when nothing matches.",
    detail: "MATCH behaves like an inner join over patterns. OPTIONAL MATCH behaves like a LEFT OUTER JOIN, keeping the row with null values.",
    inApp: { text: "Every Lab 2 preset begins with MATCH. The in-browser engine supports comma-separated patterns such as (e)-[:KNOWS]->(a), (e)-[:KNOWS]->(b).", href: "/labs/2", where: "Lab 2" },
    related: ["cypher", "merge"],
  },
  {
    id: "merge", term: "MERGE vs CREATE", category: "Neo4j & Cypher",
    short: "CREATE always inserts; MERGE inserts only if the pattern doesn't already exist.",
    detail: "MERGE makes ingestion idempotent: re-running a pipeline won't duplicate nodes. Always back MERGE keys with a uniqueness constraint.",
    inApp: { text: "Lab 1's 'Export Cypher' tab and Lab 4's load.cypher generate MERGE statements from your triples.", href: "/labs/4", where: "Lab 4 → Store in Neo4j" },
    example: { lang: "cypher", code: `MERGE (e:Employee {name: "John Miller"})\nMERGE (s:Skill {name: "Python"})\nMERGE (e)-[:KNOWS]->(s);` },
    related: ["cypher", "constraint", "entity-resolution"],
  },
  {
    id: "variable-length-path", term: "Variable-length Path", aka: "*1..3", category: "Neo4j & Cypher",
    short: "A relationship pattern that matches between min and max hops.",
    detail: "-[:MANAGES*1..2]-> matches direct and indirect reports. It is powerful for hierarchies and 'how are X and Y connected?' questions, but keep the max low to avoid combinatorial blow-up.",
    inApp: { text: "Lab 2 preset 'Reporting chain (variable length)'.", href: "/labs/2", where: "Lab 2" },
    example: { lang: "cypher", code: `MATCH (m:Employee)-[:MANAGES*1..2]->(e:Employee)\nRETURN m.name, collect(e.name)` },
    related: ["traversal", "cypher", "shortest-path"],
  },
  {
    id: "index-free-adjacency", term: "Index-free Adjacency", category: "Neo4j & Cypher",
    short: "Each node physically points to its relationships, so a hop is a pointer chase rather than a JOIN.",
    detail: "This is why native graph databases stay fast as depth increases: traversal cost depends on the local neighbourhood, not on total data size.",
    inApp: { text: "Module 3.1's depth chart shows relational JOIN time exploding while graph traversal stays flat.", href: "/learn/3#s-3.1", where: "Module 3.1" },
    related: ["traversal", "neo4j"],
  },
  {
    id: "constraint", term: "Constraint & Index", category: "Neo4j & Cypher",
    short: "Constraints enforce data rules (uniqueness); indexes speed up lookups.",
    detail: "CREATE CONSTRAINT … REQUIRE e.name IS UNIQUE prevents duplicates and creates a backing index. Neo4j also has range, text, full-text and vector indexes.",
    inApp: { text: "The Cypher exported by Lab 1 and Lab 4 begins with uniqueness constraints for each label.", href: "/labs/1", where: "Lab 1 → Export Cypher" },
    related: ["merge", "vector-index", "schema"],
  },
  {
    id: "auradb", term: "AuraDB", category: "Neo4j & Cypher",
    short: "Neo4j's fully managed cloud service, with a free tier ideal for workshops.",
    detail: "Create an instance at console.neo4j.io and download the credentials. You connect with a neo4j+s:// URI. Neo4j Desktop is the local alternative.",
    inApp: { text: "The Trainer console's pre-flight checklist and Module 3.2 walk through the setup.", href: "/learn/3#s-3.2", where: "Module 3.2" },
    related: ["neo4j", "bolt"],
  },
  {
    id: "bolt", term: "Bolt Protocol", category: "Neo4j & Cypher",
    short: "Neo4j's binary network protocol (port 7687) used by all official drivers.",
    detail: "Connection URIs look like bolt://localhost:7687 or neo4j+s://xxx.databases.neo4j.io (encrypted, cluster-aware).",
    inApp: { text: "See the .env and connect.py samples in Module 3.2.", href: "/learn/3#s-3.2", where: "Module 3.2" },
    related: ["neo4j", "auradb"],
  },
  {
    id: "apoc", term: "APOC", aka: "Awesome Procedures On Cypher", category: "Neo4j & Cypher",
    short: "Neo4j's standard library of extra procedures and functions.",
    detail: "APOC handles imports, path expansion (apoc.path.subgraphAll), node merging (apoc.refactor.mergeNodes), text utilities and more.",
    inApp: { text: "Lab 4's 'Do it for real' code uses apoc.refactor.mergeNodes for deduplication, and Lab 5 uses apoc.path.subgraphAll.", href: "/labs/4", where: "Lab 4" },
    related: ["neo4j", "entity-resolution"],
  },

  // ───────────── Graph Algorithms ─────────────
  {
    id: "gds", term: "Graph Data Science (GDS)", category: "Graph Algorithms",
    short: "Neo4j's library of graph algorithms: centrality, communities, similarity, paths and embeddings.",
    detail: "GDS projects the graph into memory and runs algorithms such as PageRank, Louvain/Leiden, node similarity and FastRP. Results can be streamed or written back as properties.",
    inApp: { text: "Module 3.6 computes centrality live, and Module 4.7 colours communities.", href: "/learn/3#s-3.6", where: "Module 3.6" },
    related: ["pagerank", "community-detection", "shortest-path"],
  },
  {
    id: "pagerank", term: "PageRank & Centrality", category: "Graph Algorithms",
    short: "Scores that measure how important or central a node is.",
    detail: "Degree centrality counts connections. PageRank also weighs who you are connected to. Betweenness finds bridges. They are used for ranking retrieved context and for finding experts or hubs.",
    inApp: { text: "Module 3.6 ranks NovaTech's most-connected entities. Neo4j is the top technology hub.", href: "/learn/3#s-3.6", where: "Module 3.6" },
    related: ["gds", "community-detection"],
  },
  {
    id: "community-detection", term: "Community Detection", aka: "Leiden · Louvain · Label propagation", category: "Graph Algorithms",
    short: "Algorithms that find clusters of densely connected nodes.",
    detail: "Microsoft GraphRAG uses hierarchical Leiden communities and summarises each cluster. This app uses label propagation, a simpler algorithm, so it can run in your browser.",
    inApp: { text: "Toggle 'Colour by community' in the Explorer, or click a community report in Module 4.7.", href: "/learn/4#s-4.7", where: "Module 4.7" },
    related: ["ms-graphrag", "global-search", "gds"],
  },
  {
    id: "shortest-path", term: "Shortest Path", category: "Graph Algorithms",
    short: "The fewest-hops (or lowest-cost) route between two nodes.",
    detail: "BFS for unweighted graphs, Dijkstra or A* for weighted ones. In Graph RAG it answers 'how are X and Y connected?' and explains the answer.",
    inApp: { text: "The agent's find_paths tool returns shortest connection paths, e.g. John Miller → KG Assistant → Neo4j.", href: "/labs/6?q=Find%20the%20connection%20between%20John%20Miller%2C%20the%20Knowledge%20Graph%20Assistant%20project%20and%20Neo4j.", where: "Lab 6 sample question 5" },
    related: ["traversal", "variable-length-path", "tool-calling"],
  },
  {
    id: "gnn", term: "Graph Neural Network (GNN)", category: "Graph Algorithms",
    short: "Neural networks that learn from graph structure by passing messages between neighbours.",
    detail: "GNNs produce node and graph embeddings for classification, link prediction and fraud detection. Combining GNN and LLM approaches is an active research area.",
    inApp: { text: "NovaTech's Fraud Graph Detector project uses PyTorch GNNs. GNNs also appear in Module 6.6 (future).", href: "/learn/6#s-6.6", where: "Module 6.6" },
    related: ["embedding", "adjacency"],
  },

  // ───────────── RAG & Retrieval ─────────────
  {
    id: "rag", term: "RAG", aka: "Retrieval-Augmented Generation", category: "RAG & Retrieval",
    short: "Retrieve relevant context first, then let the LLM answer from it.",
    detail: "Classic RAG: chunk documents → embed → store in a vector index → retrieve top-k similar chunks → stuff them into the prompt. It grounds answers in your data and reduces hallucination.",
    inApp: { text: "Lab 5 side A is a vector-style RAG retriever over NovaTech's documents.", href: "/learn/4#s-4.1", where: "Module 4.1" },
    related: ["graph-rag", "embedding", "chunking", "vector-index"],
  },
  {
    id: "graph-rag", term: "Graph RAG", aka: "GraphRAG", category: "RAG & Retrieval",
    short: "RAG whose retrieval step uses entities, relationships and paths from a knowledge graph.",
    detail: "Find the entities in the question, link them to graph nodes, traverse the relationships, assemble the subgraph as context, then generate an answer with explainable paths. It is often combined with vector search (hybrid).",
    inApp: { text: "The Lab 6 assistant is a full Graph RAG agent, and Lab 5 side B shows graph retrieval step by step.", href: "/labs/6", where: "Lab 6" },
    related: ["rag", "entity-linking", "traversal", "hybrid-search", "ms-graphrag"],
  },
  {
    id: "chunking", term: "Chunking", category: "RAG & Retrieval",
    short: "Splitting documents into smaller passages for embedding and extraction.",
    detail: "There is a trade-off: small chunks give precise retrieval and find more entities but lose context, while large chunks keep context at higher cost. A common default is 512–1024 tokens with 10–20% overlap.",
    inApp: { text: "See the chunk-size trade-off chart in Module 5.2.", href: "/learn/5#s-5.2", where: "Module 5.2" },
    related: ["rag", "embedding"],
  },
  {
    id: "embedding", term: "Embedding", aka: "Vector representation", category: "RAG & Retrieval",
    short: "A list of numbers that captures the meaning of text; similar meanings give nearby vectors.",
    detail: "Embedding models (OpenAI, Sentence Transformers) map text to 384–3072 dimensions. Retrieval compares a query vector with stored vectors.",
    inApp: { text: "Module 4.1's embedding-space chart shows clusters and nearest neighbours in 2-D.", href: "/learn/4#s-4.1", where: "Module 4.1" },
    related: ["cosine-similarity", "vector-index", "tf-idf"],
  },
  {
    id: "cosine-similarity", term: "Cosine Similarity", category: "RAG & Retrieval",
    short: "A similarity score between two vectors based on the angle between them (1 = identical direction).",
    detail: "It is the standard metric for comparing embeddings, and it ignores vector length so it compares only direction (meaning).",
    inApp: { text: "Lab 5 shows a 'cos' score and bar for every retrieved chunk.", href: "/labs/5", where: "Lab 5 side A" },
    related: ["embedding", "tf-idf"],
  },
  {
    id: "tf-idf", term: "TF-IDF", aka: "Term Frequency – Inverse Document Frequency", category: "RAG & Retrieval",
    short: "A classic sparse vector that weights words by how distinctive they are.",
    detail: "Words that appear often in one document but rarely across all documents get high weight. It is a transparent, offline stand-in for neural embeddings.",
    inApp: { text: "Lab 5's 'vector' retriever uses TF-IDF + cosine so it runs without any API.", href: "/labs/5", where: "Lab 5" },
    related: ["cosine-similarity", "embedding"],
  },
  {
    id: "vector-index", term: "Vector Index", category: "RAG & Retrieval",
    short: "An index for fast approximate nearest-neighbour search over embeddings.",
    detail: "Neo4j has native vector indexes (HNSW), so one database can do both semantic search and graph traversal. Standalone alternatives include FAISS, Pinecone and pgvector.",
    inApp: { text: "See CREATE VECTOR INDEX in Module 3.6 and the Neo4jVector hybrid retriever in Module 5.5.", href: "/learn/5#s-5.5", where: "Module 5.5" },
    related: ["embedding", "hybrid-search", "neo4j"],
  },
  {
    id: "hybrid-search", term: "Hybrid Search", aka: "Vector + Graph retrieval", category: "RAG & Retrieval",
    short: "Combining vector, keyword and graph retrieval, then fusing and re-ranking the results.",
    detail: "Vector search finds semantically relevant entry points, and graph traversal expands their context. The results are fused with Reciprocal Rank Fusion. This is the most common production pattern.",
    inApp: { text: "See the hybrid retrieval pipeline diagram in Module 5.5.", href: "/learn/5#s-5.5", where: "Module 5.5" },
    related: ["rrf", "vector-index", "graph-rag"],
  },
  {
    id: "rrf", term: "Reciprocal Rank Fusion (RRF)", category: "RAG & Retrieval",
    short: "Merge ranked lists by summing 1/(k + rank) for each item.",
    detail: "RRF is simple and robust and needs no score calibration between retrievers. k is usually 60.",
    inApp: { text: "The formula Σ 1/(60 + rank) appears in Module 5.5's fusion box.", href: "/learn/5#s-5.5", where: "Module 5.5" },
    related: ["hybrid-search"],
  },
  {
    id: "local-search", term: "Local Search", category: "RAG & Retrieval",
    short: "Graph RAG retrieval around specific entities and their neighbourhood.",
    detail: "It is best for specific questions such as 'What does John work on?'. In Microsoft GraphRAG it gathers entities, relationships, text units and community reports.",
    inApp: { text: "Most Lab 6 questions use local search.", href: "/learn/4#s-4.5", where: "Module 4.5" },
    related: ["global-search", "graph-rag"],
  },
  {
    id: "global-search", term: "Global Search", category: "RAG & Retrieval",
    short: "Answering corpus-wide questions by map-reducing over community summaries.",
    detail: "MAP: each community report produces a partial answer with a score. REDUCE: the best partial answers are combined. It suits questions like 'What are the main themes?'.",
    inApp: { text: "Module 4.7 visualises the map-reduce over communities.", href: "/learn/4#s-4.7", where: "Module 4.7" },
    related: ["community-detection", "ms-graphrag", "local-search"],
  },
  {
    id: "ms-graphrag", term: "Microsoft GraphRAG", category: "RAG & Retrieval",
    short: "Microsoft Research's open-source pipeline: LLM-built graph → Leiden communities → community reports → local/global search.",
    detail: "Indexing is LLM-heavy (and costly) but enables strong holistic answers. CLI: graphrag init / index / query.",
    inApp: { text: "Module 4.7 covers the full indexing and query workflow plus CLI commands.", href: "/learn/4#s-4.7", where: "Module 4.7" },
    related: ["community-detection", "global-search", "local-search"],
  },
  {
    id: "hallucination", term: "Hallucination & Grounding", category: "RAG & Retrieval",
    short: "Hallucination is fluent but false output; grounding constrains answers to retrieved facts.",
    detail: "Graph RAG grounds answers in explicit facts and shows the paths it used, so answers can be audited.",
    inApp: { text: "The Lab 6 agent must answer only from tool results and ends with a 'Graph evidence' section.", href: "/labs/6", where: "Lab 6" },
    related: ["graph-rag", "rag"],
  },

  // ───────────── Knowledge Extraction ─────────────
  {
    id: "ner", term: "Named Entity Recognition (NER)", category: "Knowledge Extraction",
    short: "Finding and typing entity mentions (person, organisation, place…) in text.",
    detail: "Classic NER uses models like spaCy. LLMs handle custom types, context and pronouns much better.",
    inApp: { text: "Module 5.3's extraction demo highlights entity spans by type.", href: "/learn/5#s-5.3", where: "Module 5.3" },
    related: ["relation-extraction", "coreference"],
  },
  {
    id: "relation-extraction", term: "Relationship Extraction", category: "Knowledge Extraction",
    short: "Identifying how entities in text relate to each other, producing triples.",
    detail: "LLMs with structured output return (subject, relation, object) lists. Constraining the allowed types keeps the graph clean.",
    inApp: { text: "Lab 3 runs a LangGraph extract → normalize → validate pipeline on Groq.", href: "/labs/3", where: "Lab 3" },
    related: ["triple", "structured-output", "ner"],
  },
  {
    id: "coreference", term: "Coreference Resolution", category: "Knowledge Extraction",
    short: "Working out that 'He' or 'the company' refers to an entity named earlier.",
    detail: "Without it, extraction produces facts about 'He'. The extraction prompt explicitly asks the LLM to resolve pronouns.",
    inApp: { text: "Module 5.3: 'He' resolves to John.", href: "/learn/5#s-5.3", where: "Module 5.3" },
    related: ["ner", "entity-resolution"],
  },
  {
    id: "entity-resolution", term: "Entity Resolution", aka: "Deduplication · Normalization", category: "Knowledge Extraction",
    short: "Merging different names for the same real-world entity into one node.",
    detail: "'MSFT', 'Microsoft Corp.' and 'microsoft' should become Microsoft. Techniques include normalisation, alias tables, fuzzy matching, embeddings and LLM adjudication. Duplicate nodes break traversal.",
    inApp: { text: "Lab 4 detects duplicate candidates and lets you merge them, and the graph shrinks live.", href: "/labs/4", where: "Lab 4" },
    related: ["entity-linking", "merge", "uri"],
  },
  {
    id: "entity-linking", term: "Entity Linking", category: "Knowledge Extraction",
    short: "Connecting a mention in text or a question to the right existing graph node.",
    detail: "Entity linking is the first step of Graph RAG retrieval: 'Priya' becomes the node Priya Sharma (:Employee). It combines string matching, fuzzy search and LLM identification.",
    inApp: { text: "The agent's first LangGraph node is link_entities. Watch its output in the Lab 6 trace.", href: "/labs/6", where: "Lab 6 trace" },
    related: ["entity-resolution", "graph-rag", "langgraph"],
  },

  // ───────────── LLM & Agents ─────────────
  {
    id: "llm", term: "LLM", aka: "Large Language Model", category: "LLM & Agents",
    short: "A neural network trained on text to predict and generate language.",
    detail: "LLMs are strong at language but have a training cut-off and no access to your private data. RAG and tools fill those gaps.",
    inApp: { text: "This app uses LLMs served by Groq (e.g. llama-3.3-70b-versatile). You choose the model in Settings.", href: "/assistant", where: "AI Assistant" },
    related: ["groq", "tool-calling", "rag"],
  },
  {
    id: "structured-output", term: "Structured Output", category: "LLM & Agents",
    short: "Forcing an LLM to return JSON that matches a schema.",
    detail: "It works via function calling or native JSON Schema mode. Schemas are defined with zod (TypeScript) or Pydantic (Python).",
    inApp: { text: "Lab 3's extract node uses ChatGroq.withStructuredOutput(zodSchema).", href: "/labs/3", where: "Lab 3" },
    related: ["relation-extraction", "tool-calling"],
  },
  {
    id: "tool-calling", term: "Tool Calling", aka: "Function calling", category: "LLM & Agents",
    short: "The LLM requests that your code run a named function with JSON arguments.",
    detail: "The model chooses a tool, your code executes it, and the result goes back to the model, which repeats until it can answer.",
    inApp: { text: "The agent has 4–5 tools (search_entities, get_neighbors, find_paths, run_cypher, search_course). Each call appears in amber in the trace.", href: "/labs/6", where: "Lab 6 trace" },
    related: ["agent", "toolnode", "text2cypher"],
  },
  {
    id: "text2cypher", term: "Text2Cypher", aka: "LLM-driven Cypher generation", category: "LLM & Agents",
    short: "An LLM translates a natural-language question into a Cypher query.",
    detail: "Give the model the schema, validate the generated query (read-only), run it, and let the model answer from the rows. In Python, GraphCypherQAChain does this.",
    inApp: { text: "Ask Lab 6 'Which technologies are commonly used across multiple projects?' and watch the agent write and run an aggregation query.", href: "/labs/6", where: "Lab 6" },
    related: ["cypher", "schema", "tool-calling"],
  },
  {
    id: "agent", term: "AI Agent", category: "LLM & Agents",
    short: "An LLM running in a loop that decides which tools to call to reach a goal.",
    detail: "Agents plan, act, observe and repeat. Graph-powered agents query (and can update) knowledge graphs.",
    inApp: { text: "Both the AI Assistant (tutor) and Lab 6 (enterprise assistant) are agents.", href: "/learn/6#s-6.2", where: "Module 6.2" },
    related: ["react", "langgraph", "tool-calling"],
  },
  {
    id: "react", term: "ReAct", aka: "Reason + Act", category: "LLM & Agents",
    short: "An agent pattern that interleaves reasoning, tool actions and observations.",
    detail: "It is the loop behind most tool-using agents: think → call tool → read result → think again → answer.",
    inApp: { text: "Module 6.2's agent-loop diagram walks through Reason → Act → Observe → Repeat.", href: "/learn/6#s-6.2", where: "Module 6.2" },
    related: ["agent", "langgraph"],
  },
  {
    id: "query-decomposition", term: "Query Decomposition", category: "LLM & Agents",
    short: "Splitting a complex question into simpler sub-questions answered in sequence.",
    detail: "Each sub-question maps to a focused retrieval, and later steps use earlier answers.",
    inApp: { text: "Module 6.1 runs 4 chained sub-queries live, each feeding the next.", href: "/learn/6#s-6.1", where: "Module 6.1" },
    related: ["multi-hop", "agent"],
  },
  {
    id: "langchain", term: "LangChain", category: "LLM & Agents",
    short: "A framework of building blocks for LLM apps: models, prompts, tools, retrievers and integrations.",
    detail: "langchain-neo4j provides Neo4jGraph, GraphCypherQAChain and Neo4jVector. This app uses LangChain.js core and the ChatGroq integration.",
    inApp: { text: "@langchain/core and @langchain/groq power every LLM call in this app.", href: "/learn/5#s-5.1", where: "Module 5.1" },
    related: ["langgraph", "groq"],
  },
  {
    id: "langgraph", term: "LangGraph", category: "LLM & Agents",
    short: "A framework for building stateful agent workflows as graphs of nodes and edges.",
    detail: "You define a State, add nodes (functions), connect them with edges and conditional edges, then compile. It supports loops, checkpoints, human-in-the-loop and streaming, which makes agents inspectable.",
    inApp: { text: "This app has two LangGraph graphs: the Q&A agent (link_entities → agent ⇄ tools) and the extraction pipeline (extract → normalize → validate).", href: "/learn/6#s-6.2", where: "Module 6.2" },
    example: { lang: "typescript", code: `new StateGraph(AgentState)\n  .addNode("link_entities", linkEntities)\n  .addNode("agent", callModel)\n  .addNode("tools", new ToolNode(tools))\n  .addEdge(START, "link_entities")\n  .addEdge("link_entities", "agent")\n  .addConditionalEdges("agent", toolsCondition, ["tools", END])\n  .addEdge("tools", "agent")\n  .compile();` },
    related: ["stategraph", "conditional-edge", "toolnode", "agent"],
  },
  {
    id: "stategraph", term: "StateGraph & State", category: "LLM & Agents",
    short: "LangGraph's graph class and the shared state object that every node reads and updates.",
    detail: "State is defined with Annotation (JS) or TypedDict (Python). Reducers decide how updates merge; for example, messages are appended.",
    inApp: { text: "The agent state holds messages + linked entities. The extraction state holds text, raw triples, triples, issues and attempts.", href: "/labs/3", where: "Lab 3 pipeline trace" },
    related: ["langgraph", "checkpoint"],
  },
  {
    id: "conditional-edge", term: "Conditional Edge", category: "LLM & Agents",
    short: "A LangGraph edge whose destination is decided by a function of the state.",
    detail: "toolsCondition routes to 'tools' if the last AI message contains tool calls, otherwise to END. Lab 3 loops back to extract when validation finds 0 triples.",
    inApp: { text: "Both of this app's graphs use conditional edges.", href: "/learn/6#s-6.2", where: "Module 6.2" },
    related: ["langgraph", "toolnode"],
  },
  {
    id: "toolnode", term: "ToolNode", category: "LLM & Agents",
    short: "A prebuilt LangGraph node that executes the tool calls requested by the LLM.",
    detail: "It runs each tool and returns ToolMessages to the state, and it handles errors gracefully.",
    inApp: { text: "Green 'result' entries in the agent trace come from the ToolNode.", href: "/labs/6", where: "Lab 6 trace" },
    related: ["tool-calling", "langgraph"],
  },
  {
    id: "checkpoint", term: "Checkpointer", aka: "Memory · Persistence", category: "LLM & Agents",
    short: "Saves graph state after each step so you can resume, time-travel or add human approval.",
    detail: "It enables multi-turn memory and human-in-the-loop interrupts, for example approving a write to the KG. This app keeps memory client-side by resending recent turns.",
    inApp: { text: "Module 6.2 explains write-back with human approval via interrupts.", href: "/learn/6#s-6.2", where: "Module 6.2" },
    related: ["stategraph", "langgraph"],
  },

  // ───────────── This App's Stack ─────────────
  {
    id: "groq", term: "Groq", category: "This App's Stack",
    short: "An inference provider running open models (Llama, GPT-OSS…) on custom LPU hardware at very high speed.",
    detail: "Groq exposes an OpenAI-compatible API and has a free tier, so it works well for live classroom demos. Get a key at console.groq.com/keys.",
    inApp: { text: "Every AI feature in this app (Labs 3, 5 (optional) and 6, and the tutor) calls Groq through @langchain/groq.", href: "/assistant", where: "Settings → Add Groq key" },
    related: ["byok", "llm", "langchain"],
  },
  {
    id: "byok", term: "BYOK", aka: "Bring Your Own Key", category: "This App's Stack",
    short: "Each user supplies their own API key instead of the app owner paying for everyone.",
    detail: "Your key stays in your browser (tab session or localStorage) and is sent per request in the x-groq-key header. Server routes pass it to Groq and never store or log it.",
    inApp: { text: "Click the key button in the top-right navigation.", href: "/", where: "Top-right navigation" },
    related: ["groq"],
  },
  {
    id: "ndjson", term: "NDJSON Streaming", aka: "Newline-delimited JSON", category: "This App's Stack",
    short: "Sending one JSON object per line over a single HTTP response, as events happen.",
    detail: "The /api/agent route streams LangGraph updates (step, tool_call, tool_result, highlight, final) so the UI can show the agent thinking in real time.",
    inApp: { text: "The live agent trace and the graph highlights that build up as the agent works are powered by NDJSON streaming.", href: "/labs/6", where: "Lab 6" },
    related: ["langgraph", "agent"],
  },
  {
    id: "temporal-kg", term: "Temporal Knowledge Graph", category: "This App's Stack",
    short: "A KG where facts carry validity time, such as valid_from and valid_to.",
    detail: "It enables 'as of' questions (who managed John in 2023?) and agent memory that changes over time. Graphiti/Zep are examples.",
    inApp: { text: "Covered in Module 6.6 (future of graph-based AI).", href: "/learn/6#s-6.6", where: "Module 6.6" },
    related: ["knowledge-graph", "agent"],
  },
];

export function glossaryPassages() {
  return GLOSSARY.map((g) => ({
    ref: `Glossary · ${g.term}`,
    title: `${g.term}${g.aka ? ` (${g.aka})` : ""}`,
    text: `${g.short}\n${g.detail}\nIn this app: ${g.inApp.text}`,
  }));
}
