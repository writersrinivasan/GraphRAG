import { Module } from "./types";

export const module1: Module = {
  id: 1,
  title: "Introduction to Knowledge Graphs and Graph-Based AI",
  short: "Knowledge Graphs & Graph AI",
  minutes: 35,
  gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
  accent: "#c084fc",
  icon: "Sparkles",
  tagline: "Why connected knowledge beats isolated facts, and why LLMs need it.",
  objectives: [
    "Trace how knowledge systems evolved from files and tables to knowledge graphs",
    "Define entities, relationships, properties, labels and triples",
    "Explain why LLMs hallucinate and how graphs ground them",
    "Contrast traditional (vector) RAG with Graph RAG at a high level",
  ],
  sections: [
    {
      id: "1.1",
      title: "Understanding the Evolution of AI Knowledge Systems",
      intro:
        "Every generation of data technology answered a new kind of question. Files stored records, relational databases joined them, search engines ranked text, and vector databases matched meaning. Knowledge graphs store the relationships between things directly, which is what reasoning needs. LLMs speak fluently but don't know your private facts, so the current generation pairs a language model with a knowledge store.",
      visuals: [
        {
          kind: "timeline",
          items: [
            { year: "1960s", title: "Flat files & hierarchies", desc: "Records on tape; navigation hard-coded in programs.", icon: "FileText" },
            { year: "1970s", title: "Relational databases", desc: "Codd's tables, SQL and JOINs. Great for transactions.", icon: "Table" },
            { year: "1990s", title: "Search engines", desc: "Keyword indexes & PageRank — itself a graph algorithm!", icon: "Search" },
            { year: "2001", title: "Semantic Web / RDF", desc: "Linked data with URIs and ontologies (OWL).", icon: "Globe" },
            { year: "2012", title: "Google Knowledge Graph", desc: "“Things, not strings.” Entities power search panels.", icon: "Network" },
            { year: "2020", title: "Vector DBs + LLMs", desc: "Embeddings capture meaning; RAG grounds LLM answers.", icon: "Brain" },
            { year: "2024+", title: "Graph RAG & Agents", desc: "LLMs reason over connected knowledge; agents query & update it.", icon: "Bot" },
          ],
        },
        {
          kind: "compare",
          left: {
            title: "Structured data",
            icon: "Table",
            items: ["Fixed schema (rows/columns)", "Easy to query with SQL", "ERP, CRM, HR systems", "~20% of enterprise data"],
          },
          right: {
            title: "Unstructured data",
            icon: "FileText",
            items: ["No predefined schema", "PDFs, emails, chats, wikis", "Needs NLP/LLMs to understand", "~80% of enterprise data"],
          },
        },
        { kind: "custom", key: "rdbms-vs-graph" },
      ],
      points: [
        { t: "Relational vs graph", d: "In an RDBMS, relationships are computed at query time via JOINs across foreign keys. In a graph database, relationships are stored as first-class records, so following one is a pointer hop (index-free adjacency)." },
        { t: "Knowledge representation", d: "AI needs a machine-readable model of the world: entities (things), relations (how they connect) and attributes (facts about them). Graphs are the most natural fit for this." },
        { t: "Limits of plain LLM retrieval", d: "LLMs have a training cut-off, no access to private data, and generate plausible but unverified text. Chunk-based retrieval helps, but it loses the links between facts." },
        { t: "Why relationships matter", d: "Questions like “who can help with this project?” are about connections (person → skill → technology → project), not about any single document." },
      ],
      callout: { kind: "insight", text: "PageRank, the algorithm behind early Google search, ranks pages by how they link to each other, so web search was built on a graph algorithm from the start." },
    },
    {
      id: "1.2",
      title: "What is a Knowledge Graph?",
      intro:
        "A knowledge graph (KG) is a network of real-world entities and the relationships between them, stored so that both humans and machines can query and reason over it. Every fact is a small sentence: subject → predicate → object.",
      visuals: [{ kind: "custom", key: "triple-anatomy" }, { kind: "custom", key: "mini-kg" }],
      points: [
        { t: "Entity / Node", d: "A thing: a person, company, product, concept. Drawn as a circle." },
        { t: "Relationship / Edge", d: "A named, directed connection: (John)-[:WORKS_FOR]->(IBM). Drawn as an arrow." },
        { t: "Property / Attribute", d: "Key–value facts on nodes or edges: {role: 'AI Engineer'}, {since: 2021}." },
        { t: "Label", d: "The type/class of a node: Person, Company, Skill. A node may have several labels." },
        { t: "Directed vs undirected", d: "WORKS_FOR has direction (John → IBM). FRIENDS_WITH is symmetric; graph DBs still store a direction but you can query it either way." },
        { t: "Traversal & connectivity", d: "Answering questions by walking edges from node to node. Two entities are connected if a path exists between them." },
      ],
    },
    {
      id: "1.3",
      title: "Understanding Graph Representation",
      intro:
        "The same graph can be written down in several ways. Each representation has trade-offs for storage, computation and readability, and you will meet all of them when building Graph RAG systems.",
      visuals: [{ kind: "custom", key: "representations" }],
      points: [
        { t: "Visual diagram", d: "Circles and arrows — best for humans, whiteboards and Neo4j Browser." },
        { t: "Triples list", d: "(subject, predicate, object) rows. This is what LLM extraction produces and what RDF stores." },
        { t: "Adjacency list", d: "For each node, the list of its neighbours. Memory-efficient for sparse graphs (most real KGs)." },
        { t: "Adjacency matrix", d: "N×N grid of 0/1. Fast lookups, used by GNNs and linear algebra, but wasteful for sparse graphs." },
      ],
    },
    {
      id: "1.4",
      title: "Why Knowledge Graphs Matter for GenAI",
      intro:
        "LLMs are good at language and unreliable at facts. Knowledge graphs are reliable at facts and can't produce language. Putting them together gives fluent answers that are grounded in your data and can be explained.",
      visuals: [
        { kind: "custom", key: "multihop-demo" },
        {
          kind: "cards",
          cols: 3,
          items: [
            { title: "Contextual knowledge", desc: "Entities arrive with their neighbourhood, not as isolated text.", icon: "Layers" },
            { title: "Connect the disconnected", desc: "Facts from HR, Jira and Git meet at shared entities.", icon: "Link" },
            { title: "Multi-hop reasoning", desc: "Follow A→B→C chains that no single document states.", icon: "Route" },
            { title: "Relationship discovery", desc: "Find hidden paths, communities and influencers.", icon: "Telescope" },
            { title: "Explainable answers", desc: "Show the exact path used: provenance you can audit.", icon: "Eye" },
            { title: "Less hallucination", desc: "The LLM answers from retrieved facts, not from memory.", icon: "ShieldCheck" },
          ],
        },
      ],
      callout: { kind: "trainer", text: "Ask the room: “Which employees could mentor a new LangGraph project?” Then show that no single document answers it, but a 3-hop graph walk does." },
    },
    {
      id: "1.5",
      title: "Introduction to Graph-Based RAG",
      intro:
        "Retrieval-Augmented Generation (RAG) retrieves relevant context and hands it to an LLM. Traditional RAG retrieves text chunks by vector similarity. Graph RAG retrieves entities, relationships and paths, often combined with vectors.",
      visuals: [{ kind: "custom", key: "rag-vs-graphrag-flow" }],
      points: [
        { t: "Vector similarity", d: "“Find text that sounds like the question.” Great for fuzzy semantic lookups and single-hop facts." },
        { t: "Relationship-based retrieval", d: "“Find entities in the question, then walk their connections.” Great for multi-hop, aggregation and ‘how are X and Y related?’." },
        { t: "When to use Graph RAG", d: "Highly connected domains, questions that span documents, need for explainability, or global ‘what are the themes?’ questions." },
        { t: "Enterprise fit", d: "Org charts, IT dependencies, supply chains, fraud rings, compliance: data that is mostly about relationships." },
      ],
    },
  ],
  trainer: [
    { minute: "0–5", note: "Hook: ask ChatGPT about your company's org chart and watch it fail. That's the motivation." },
    { minute: "5–12", note: "Evolution timeline. Emphasise ‘things, not strings’." },
    { minute: "12–20", note: "Triple anatomy + mini graph. Have learners name 3 triples about themselves." },
    { minute: "20–28", note: "Multi-hop demo: click through the hops live." },
    { minute: "28–35", note: "RAG vs Graph RAG flow; set up the rest of the day." },
  ],
  quiz: [
    { q: "In the triple (John)-[:WORKS_FOR]->(IBM), what is WORKS_FOR?", options: ["Subject", "Predicate / relationship", "Object", "Label"], answer: 1, why: "Triples are subject–predicate–object; the predicate is the relationship." },
    { q: "Why are graph databases fast at following relationships?", options: ["They cache SQL JOINs", "Index-free adjacency: edges are stored as direct pointers", "They store everything in memory only", "They use vector embeddings"], answer: 1, why: "Each node physically references its relationships, so traversal cost depends on the local neighbourhood, not total table size." },
    { q: "Which question most clearly needs multi-hop reasoning?", options: ["What is John's job title?", "Which skills do people on projects that use Neo4j have?", "When was Neo4j founded?", "Define a knowledge graph"], answer: 1, why: "It chains Project → Technology, Project ← Employee, Employee → Skill." },
    { q: "Main way knowledge graphs reduce LLM hallucination:", options: ["They fine-tune the model", "They make the model bigger", "They supply grounded, verifiable facts as context", "They lower the temperature"], answer: 2, why: "Grounded retrieval gives the LLM explicit facts and paths it can cite." },
  ],
};

export const module2: Module = {
  id: 2,
  title: "Knowledge Graph Architecture and Fundamentals",
  short: "KG Architecture",
  minutes: 45,
  gradient: "from-cyan-400 via-sky-500 to-blue-600",
  accent: "#38bdf8",
  icon: "Layers",
  tagline: "From raw documents to a queryable, reasoning-ready graph.",
  objectives: [
    "Describe the 8 layers of a production knowledge graph architecture",
    "Master core vocabulary: node, edge, property, label, triple, ontology, schema, taxonomy",
    "Choose between RDF and Labeled Property Graphs",
    "Walk through the end-to-end KG construction pipeline",
  ],
  sections: [
    {
      id: "2.1",
      title: "Knowledge Graph Architecture",
      intro:
        "A production knowledge graph is a pipeline. Raw data comes in at the bottom, gets turned into entities and relationships, is deduplicated and stored, and is then served to applications and LLMs at the top.",
      visuals: [
        {
          kind: "stack",
          layers: [
            { title: "LLM integration layer", desc: "Prompts, context assembly, answer generation, citations", tech: "Groq · OpenAI · Claude", icon: "Brain" },
            { title: "Query & retrieval layer", desc: "Cypher, graph traversal, vector + graph hybrid search", tech: "Cypher · LangChain", icon: "Search" },
            { title: "Graph storage & indexing", desc: "Nodes, relationships, property & vector indexes", tech: "Neo4j", icon: "HardDrive" },
            { title: "Knowledge graph construction", desc: "MERGE nodes/edges, apply schema & constraints", tech: "Python driver", icon: "Network" },
            { title: "Entity resolution & dedup", desc: "‘IBM’, ‘I.B.M.’, ‘IBM Corp’ → one node", tech: "Fuzzy match · embeddings", icon: "Merge" },
            { title: "Relationship extraction", desc: "Who did what to whom", tech: "LLM · rules", icon: "Share2" },
            { title: "Entity extraction", desc: "People, orgs, products, concepts", tech: "NER · LLM", icon: "Tags" },
            { title: "Data ingestion", desc: "PDFs, wikis, DBs, APIs, tickets", tech: "LangChain loaders", icon: "Download" },
          ],
        },
      ],
    },
    {
      id: "2.2",
      title: "Core Knowledge Graph Concepts",
      intro: "This vocabulary comes up in every later module.",
      table: {
        headers: ["Concept", "Description", "Example"],
        rows: [
          ["Node", "Represents an entity", "Employee"],
          ["Edge", "Represents a relationship", "WORKS_FOR"],
          ["Property", "Attribute of a node or edge", "Employee_Name"],
          ["Label", "Node classification", "Person"],
          ["Triple", "Subject-predicate-object", "John-WORKS_FOR-IBM"],
          ["Ontology", "Formal definition of concepts and relationships", "HR Ontology"],
          ["Schema", "Defines graph structure", "Employee-Department"],
          ["Taxonomy", "Hierarchical classification", "AI → ML → DL"],
        ],
      },
      visuals: [{ kind: "custom", key: "taxonomy-ontology" }],
      callout: { kind: "tip", text: "Taxonomy = IS-A hierarchy only. Ontology = taxonomy + any relationships + rules/constraints. Schema = the practical structure your database enforces." },
    },
    {
      id: "2.3",
      title: "RDF vs Property Graph Models",
      intro:
        "There are two main ways to model graphs. RDF comes from the Semantic Web: everything is a triple and identified by a URI. Labeled Property Graphs (LPG), used by Neo4j, put properties directly on nodes and relationships.",
      visuals: [{ kind: "custom", key: "rdf-vs-lpg" }],
      table: {
        headers: ["Aspect", "RDF", "Labeled Property Graph"],
        rows: [
          ["Unit of data", "Triple (s, p, o)", "Node / relationship with properties"],
          ["Identity", "Global URIs", "Internal IDs + unique properties"],
          ["Edge properties", "Needs reification / RDF-star", "Native"],
          ["Query language", "SPARQL", "Cypher / GQL (ISO standard)"],
          ["Reasoning", "OWL/RDFS inference built-in", "Rules via queries / GDS"],
          ["Best for", "Open data, interoperability, ontologies", "Application KGs, analytics, Graph RAG"],
        ],
      },
      callout: { kind: "insight", text: "For most Graph RAG projects an LPG (Neo4j) is the pragmatic choice. Use RDF when you must interoperate with public ontologies such as schema.org, SNOMED or FIBO." },
    },
    {
      id: "2.4",
      title: "Knowledge Graph Construction Pipeline",
      intro: "This is how unstructured text becomes a trustworthy graph. Every step is a place where quality can be won or lost.",
      visuals: [
        {
          kind: "flow",
          wrap: true,
          steps: [
            { title: "Collect", desc: "Gather source docs", icon: "FolderKanban" },
            { title: "Preprocess", desc: "Clean, split, normalise", icon: "Scissors" },
            { title: "NER", desc: "Spot entity mentions", icon: "Tags" },
            { title: "LLM extraction", desc: "Typed entities via prompts", icon: "Brain" },
            { title: "Relations", desc: "Extract (s,p,o) triples", icon: "Share2" },
            { title: "Normalise", desc: "Canonical names & types", icon: "Wand2" },
            { title: "Link", desc: "Match to existing nodes", icon: "Link" },
            { title: "Validate", desc: "Schema & sanity checks", icon: "CheckCircle2" },
            { title: "Store", desc: "MERGE into Neo4j", icon: "HardDrive" },
          ],
        },
      ],
      lab: 3,
    },
    {
      id: "2.5",
      title: "Knowledge Graph Reasoning",
      intro:
        "A graph lets you derive facts that were never stated explicitly. Reasoning ranges from simple path-following to formal logical inference.",
      visuals: [
        {
          kind: "cards",
          cols: 3,
          items: [
            { title: "Relationship-based", desc: "Direct lookups: who WORKS_ON Project X?", icon: "Share2" },
            { title: "Multi-hop", desc: "Chains: Employee → Project → Technology", icon: "Route" },
            { title: "Rule-based inference", desc: "IF a MANAGES b AND b WORKS_ON p THEN a OVERSEES p", icon: "GitBranch" },
            { title: "Semantic", desc: "Use meaning: ‘LLM apps’ ≈ ‘Generative AI’ domain", icon: "Brain" },
            { title: "Ontology-driven", desc: "Every AI Engineer IS-A Engineer → inherits rules", icon: "ListTree" },
            { title: "Traversal discovery", desc: "Explore neighbourhoods to find unexpected links", icon: "Compass" },
          ],
        },
        { kind: "custom", key: "inference-demo" },
      ],
    },
    {
      id: "2.6",
      title: "Practical Example — Enterprise Knowledge Graph",
      intro:
        "The worked example for the whole course is NovaTech Labs, a company with employees, departments, projects, technologies, skills and domains. Explore it below: drag nodes, hover for details, and click a node to see its neighbourhood.",
      visuals: [{ kind: "custom", key: "enterprise-kg" }, { kind: "custom", key: "keyword-vs-graph" }],
      lab: 1,
    },
  ],
  trainer: [
    { minute: "0–10", note: "Architecture stack: walk bottom-up, then show where the LLM sits on top." },
    { minute: "10–18", note: "Vocabulary table; quick verbal quiz." },
    { minute: "18–26", note: "RDF vs LPG: draw the same fact both ways." },
    { minute: "26–35", note: "Construction pipeline. Preview Lab 3 (LLM extraction)." },
    { minute: "35–45", note: "Hands-on Lab 1: build a KG by adding triples." },
  ],
  quiz: [
    { q: "Which layer turns ‘IBM Corp’ and ‘I.B.M.’ into one node?", options: ["Ingestion", "Entity resolution & deduplication", "LLM integration", "Indexing"], answer: 1, why: "Entity resolution merges different surface forms of the same real-world entity." },
    { q: "A key advantage of LPG over basic RDF:", options: ["Global URIs", "Native properties on relationships", "OWL reasoning", "SPARQL support"], answer: 1, why: "LPGs store properties on edges natively; RDF needs reification or RDF-star." },
    { q: "AI → ML → DL is an example of a…", options: ["Schema", "Triple", "Taxonomy", "Property"], answer: 2, why: "It's an IS-A hierarchy, which is a taxonomy." },
    { q: "‘IF a MANAGES b AND b WORKS_ON p THEN a OVERSEES p’ is:", options: ["Vector search", "Rule-based inference", "Community detection", "Chunking"], answer: 1, why: "It derives a new fact from a logical rule over existing relationships." },
  ],
};

export const module3: Module = {
  id: 3,
  title: "Graph Databases and Neo4j Hands-on",
  short: "Neo4j & Cypher",
  minutes: 50,
  gradient: "from-emerald-400 via-teal-500 to-cyan-600",
  accent: "#34d399",
  icon: "Database",
  tagline: "Store, query and analyse connected data with Cypher.",
  objectives: [
    "Compare graph, relational and vector databases",
    "Set up Neo4j (AuraDB or Desktop) and connect from Python",
    "Write Cypher: CREATE, MERGE, MATCH, WHERE, RETURN, variable-length paths",
    "Know Neo4j's advanced features: constraints, indexes, GDS, vector indexes",
  ],
  sections: [
    {
      id: "3.1",
      title: "Introduction to Graph Databases",
      intro:
        "A graph database stores nodes and relationships natively and is optimised for traversal. Neo4j is the most widely used one. It is a native graph engine with ACID transactions, the Cypher query language, a browser UI, the Graph Data Science library and built-in vector indexes.",
      visuals: [
        {
          kind: "radar",
          axes: ["Relationship traversal", "Transactions", "Semantic similarity", "Aggregations", "Schema flexibility", "Explainability"],
          series: [
            { name: "Graph DB", values: [10, 8, 6, 6, 9, 9] },
            { name: "Relational DB", values: [4, 10, 2, 10, 4, 6] },
            { name: "Vector DB", values: [1, 5, 10, 3, 7, 3] },
          ],
          note: "Illustrative strengths (0–10), not benchmarks.",
        },
        {
          kind: "bars",
          title: "Friends-of-friends query time vs depth (illustrative, 1M people)",
          series: ["Relational (JOINs)", "Graph (traversal)"],
          data: [
            { label: "Depth 2", values: [0.02, 0.01] },
            { label: "Depth 3", values: [30, 0.17] },
            { label: "Depth 4", values: [1543, 1.36] },
            { label: "Depth 5", values: [3600, 2.13] },
          ],
          note: "Seconds; adapted from the classic ‘Neo4j in Action’ experiment. Depth 5 RDBMS did not finish within an hour.",
        },
        { kind: "custom", key: "neo4j-architecture" },
      ],
      points: [
        { t: "Use cases", d: "Fraud rings, recommendations, network/IT topology, identity & access, supply chain, knowledge graphs for RAG." },
        { t: "Graph vs vector DB", d: "Vector DBs answer ‘what is similar?’; graph DBs answer ‘what is connected and how?’. Neo4j does both, because it has vector indexes too." },
      ],
    },
    {
      id: "3.2",
      title: "Neo4j Environment Setup",
      intro: "Two options: Neo4j AuraDB, a free managed cloud instance that needs nothing installed, or Neo4j Desktop, which runs locally and works offline with plugins like APOC and GDS.",
      visuals: [
        {
          kind: "compare",
          left: { title: "Neo4j AuraDB (cloud)", icon: "Cloud", items: ["Free tier, ready in ~2 min", "neo4j+s:// secure URI", "No install — ideal for workshops", "GDS on paid tiers"] },
          right: { title: "Neo4j Desktop (local)", icon: "Server", items: ["Full control & offline", "bolt://localhost:7687", "Easy APOC / GDS plugins", "Needs local install"] },
        },
        {
          kind: "flow",
          steps: [
            { title: "Create DB", desc: "console.neo4j.io → New instance", icon: "Rocket" },
            { title: "Save creds", desc: "Download URI + password", icon: "KeyRound" },
            { title: "Open Browser", desc: "Run :play movies to test", icon: "Globe" },
            { title: "pip install", desc: "neo4j python-dotenv", icon: "Package" },
            { title: "Connect", desc: "driver.verify_connectivity()", icon: "Plug" },
          ],
        },
      ],
      code: [
        { title: ".env", lang: "bash", code: `NEO4J_URI=neo4j+s://<your-id>.databases.neo4j.io\nNEO4J_USERNAME=neo4j\nNEO4J_PASSWORD=<your-password>\nGROQ_API_KEY=gsk_...` },
        {
          title: "connect.py",
          lang: "python",
          code: `import os\nfrom dotenv import load_dotenv\nfrom neo4j import GraphDatabase\n\nload_dotenv()\ndriver = GraphDatabase.driver(\n    os.environ["NEO4J_URI"],\n    auth=(os.environ["NEO4J_USERNAME"], os.environ["NEO4J_PASSWORD"]),\n)\ndriver.verify_connectivity()\nprint("✅ Connected to Neo4j")\n\nrecords, summary, keys = driver.execute_query(\n    "MATCH (n) RETURN count(n) AS nodes", database_="neo4j"\n)\nprint(records[0]["nodes"], "nodes")`,
        },
      ],
      lab: 2,
    },
    {
      id: "3.3",
      title: "Introduction to Cypher Query Language",
      intro:
        "Cypher is ASCII-art for graphs. You draw the pattern you're looking for, (node)-[:REL]->(node), and Neo4j finds every place that pattern occurs. Its core is being standardised as ISO GQL.",
      visuals: [{ kind: "custom", key: "cypher-anatomy" }],
      table: {
        headers: ["Clause", "Purpose", "Example"],
        rows: [
          ["CREATE", "Always create new data", "CREATE (:Skill {name:'Rust'})"],
          ["MERGE", "Create only if not exists (idempotent)", "MERGE (s:Skill {name:'Python'})"],
          ["MATCH", "Find a pattern", "MATCH (e:Employee)-[:KNOWS]->(s)"],
          ["OPTIONAL MATCH", "Like LEFT JOIN — nulls if missing", "OPTIONAL MATCH (e)-[:MANAGES]->(r)"],
          ["WHERE", "Filter", "WHERE e.since < 2020"],
          ["RETURN / ORDER BY", "Project & sort", "RETURN e.name ORDER BY e.name"],
          ["SET / DELETE", "Update / remove", "SET e.role='Lead'  ·  DETACH DELETE n"],
          ["Variable-length", "1 to N hops", "MATCH (a)-[:MANAGES*1..3]->(b)"],
        ],
      },
      callout: { kind: "tip", text: "Use MERGE in ingestion pipelines so re-running them never duplicates nodes. Put a uniqueness constraint on the MERGE key." },
    },
    {
      id: "3.4",
      title: "Hands-on: Building a Knowledge Graph",
      intro: "Practical scenario: the Corporate Employee Knowledge Graph. You create five node types (Employee, Department, Project, Technology, Skill) and five relationship types (WORKS_IN, WORKS_ON, KNOWS, MANAGES, USES).",
      visuals: [{ kind: "custom", key: "schema-diagram" }],
      code: [
        {
          title: "create.cypher",
          lang: "cypher",
          code: `CREATE (e:Employee {name: "John", role: "AI Engineer"})\nCREATE (s:Skill {name: "Python"})\nCREATE (e)-[:KNOWS]->(s)\nRETURN e, s;\n\n// Idempotent version for pipelines\nMERGE (e:Employee {name: "John"}) SET e.role = "AI Engineer"\nMERGE (d:Department {name: "AI Research"})\nMERGE (p:Project {name: "Knowledge Graph Assistant"})\nMERGE (t:Technology {name: "Neo4j"})\nMERGE (e)-[:WORKS_IN]->(d)\nMERGE (e)-[:WORKS_ON]->(p)\nMERGE (p)-[:USES]->(t);`,
        },
        {
          title: "load_kg.py",
          lang: "python",
          code: `employees = [\n    {"name": "John Miller", "role": "AI Engineer", "dept": "AI Research",\n     "skills": ["Python", "Agentic AI"], "projects": ["Enterprise Copilot"]},\n    # ...\n]\n\nQUERY = """\nUNWIND $rows AS row\nMERGE (e:Employee {name: row.name}) SET e.role = row.role\nMERGE (d:Department {name: row.dept})\nMERGE (e)-[:WORKS_IN]->(d)\nWITH e, row\nUNWIND row.skills AS skill\n  MERGE (s:Skill {name: skill})\n  MERGE (e)-[:KNOWS]->(s)\n"""\ndriver.execute_query(QUERY, rows=employees, database_="neo4j")`,
        },
      ],
      lab: 2,
    },
    {
      id: "3.5",
      title: "Querying the Knowledge Graph",
      intro: "Try it live. These queries run against the in-browser NovaTech graph, and the matched subgraph lights up as you run them.",
      visuals: [{ kind: "custom", key: "query-runner" }],
      code: [
        { title: "basic.cypher", lang: "cypher", code: `MATCH (e:Employee)-[:KNOWS]->(s:Skill)\nRETURN e.name, s.name` },
        { title: "multi-hop.cypher", lang: "cypher", code: `MATCH (e:Employee)-[:WORKS_ON]->(p:Project)\n      -[:USES]->(t:Technology)\nRETURN e.name, p.name, t.name` },
      ],
      lab: 2,
    },
    {
      id: "3.6",
      title: "Neo4j Advanced Capabilities",
      intro: "Production graphs need integrity (constraints), speed (indexes), insight (algorithms) and semantic search (vector indexes).",
      visuals: [
        { kind: "custom", key: "gds-centrality" },
        {
          kind: "cards",
          cols: 4,
          items: [
            { title: "Indexes", desc: "Range / text / full-text indexes for fast lookups", icon: "Hash" },
            { title: "Constraints", desc: "Uniqueness & existence keep data clean", icon: "Lock" },
            { title: "Shortest path", desc: "Dijkstra, A*, BFS between entities", icon: "Route" },
            { title: "Centrality", desc: "PageRank, betweenness: who matters most", icon: "Target" },
            { title: "Communities", desc: "Louvain / Leiden clusters", icon: "Boxes" },
            { title: "Similarity", desc: "Node similarity, KNN", icon: "Shuffle" },
            { title: "Embeddings", desc: "FastRP, node2vec graph embeddings", icon: "Atom" },
            { title: "Vector index", desc: "ANN search over text embeddings", icon: "Sparkles" },
          ],
        },
      ],
      code: [
        {
          title: "advanced.cypher",
          lang: "cypher",
          code: `CREATE CONSTRAINT emp_name IF NOT EXISTS\nFOR (e:Employee) REQUIRE e.name IS UNIQUE;\n\n// Shortest path between two people\nMATCH p = shortestPath(\n  (a:Employee {name:"John Miller"})-[*..6]-(b:Employee {name:"Zara Ali"}))\nRETURN p;\n\n// Vector index on project descriptions\nCREATE VECTOR INDEX project_embeddings IF NOT EXISTS\nFOR (p:Project) ON p.embedding\nOPTIONS {indexConfig: {\n  \`vector.dimensions\`: 1536,\n  \`vector.similarity_function\`: 'cosine'}};\n\n// PageRank with GDS\nCALL gds.graph.project('org', ['Employee','Project'], '*');\nCALL gds.pageRank.stream('org')\nYIELD nodeId, score\nRETURN gds.util.asNode(nodeId).name AS name, score\nORDER BY score DESC LIMIT 5;`,
        },
      ],
    },
  ],
  trainer: [
    { minute: "0–8", note: "Radar + depth chart: why graph DBs exist." },
    { minute: "8–15", note: "Everyone creates an AuraDB Free instance. Do this while explaining." },
    { minute: "15–28", note: "Cypher anatomy + cheat sheet, live in Neo4j Browser." },
    { minute: "28–45", note: "Lab 2: Cypher playground; learners write 5 queries." },
    { minute: "45–50", note: "Advanced capabilities: show PageRank visual and vector index." },
  ],
  quiz: [
    { q: "Which clause should an ingestion pipeline use to avoid duplicates?", options: ["CREATE", "MERGE", "MATCH", "SET"], answer: 1, why: "MERGE matches an existing pattern or creates it, which makes re-runs idempotent." },
    { q: "MATCH (a)-[:MANAGES*1..3]->(b) means:", options: ["Exactly 3 hops", "1 to 3 MANAGES hops", "3 relationships of any type", "Up to 13 hops"], answer: 1, why: "*min..max is a variable-length pattern." },
    { q: "Which Neo4j feature enables semantic similarity search?", options: ["Uniqueness constraint", "Vector index", "APOC", "OPTIONAL MATCH"], answer: 1, why: "Vector indexes support approximate nearest-neighbour search over embeddings." },
    { q: "OPTIONAL MATCH is closest to which SQL concept?", options: ["INNER JOIN", "LEFT OUTER JOIN", "UNION", "GROUP BY"], answer: 1, why: "Missing matches return nulls instead of dropping the row." },
  ],
};
