import { Module } from "./types";

export const module4: Module = {
  id: 4,
  title: "Introduction to Graph RAG and Architecture",
  short: "Graph RAG Architecture",
  minutes: 45,
  gradient: "from-amber-400 via-orange-500 to-red-500",
  accent: "#fb923c",
  icon: "Workflow",
  tagline: "Where vector RAG breaks, and how graphs fix it.",
  objectives: [
    "Explain the traditional RAG pipeline end to end",
    "Identify six failure modes of chunk-based RAG",
    "Draw the Graph RAG reference architecture",
    "Pick the right retrieval strategy: local, global, hybrid…",
    "Understand Microsoft GraphRAG's indexing & query workflow",
  ],
  sections: [
    {
      id: "4.1",
      title: "Understanding Traditional RAG",
      intro:
        "Retrieval-Augmented Generation gives an LLM an open-book exam. Before answering, the system retrieves relevant passages from your documents and puts them in the prompt. The model answers from that evidence and doesn't have to rely on its training memory.",
      visuals: [
        {
          kind: "flow",
          wrap: true,
          steps: [
            { title: "Ingest", desc: "Load PDFs, pages, DB rows", icon: "Download" },
            { title: "Chunk", desc: "Split ~500–1000 tokens", icon: "Scissors" },
            { title: "Embed", desc: "Text → vector", icon: "Atom" },
            { title: "Store", desc: "Vector DB / index", icon: "HardDrive" },
            { title: "Similarity search", desc: "Top-k nearest chunks", icon: "Search" },
            { title: "Augment", desc: "Stuff chunks into prompt", icon: "Layers" },
            { title: "Generate", desc: "LLM writes the answer", icon: "Brain" },
          ],
          caption: "Indexing (offline) → Retrieval & generation (online)",
        },
        { kind: "custom", key: "embedding-space" },
      ],
    },
    {
      id: "4.2",
      title: "Limitations of Traditional RAG",
      intro: "Chunking cuts knowledge into pieces, and similarity search returns pieces that sound like the question. That fails when the answer is spread across several documents or depends on how facts relate.",
      visuals: [
        { kind: "custom", key: "rag-limitations" },
        {
          kind: "cards",
          cols: 3,
          items: [
            { title: "Fragmented context", desc: "Each chunk is an island; links between them are lost.", icon: "Puzzle" },
            { title: "Blind to relationships", desc: "‘Who manages people who know Python?’ isn't a similarity question.", icon: "Unlink" },
            { title: "Multi-hop failure", desc: "Hop 2 needs an entity only discovered in hop 1.", icon: "Route" },
            { title: "Lost document context", desc: "A chunk saying ‘he leads it’ — who? what?", icon: "FileX" },
            { title: "Weak structured reasoning", desc: "Counting, ranking, ‘most common’ need aggregation.", icon: "Calculator" },
            { title: "Cross-document gaps", desc: "Top-k may miss the 2nd document entirely.", icon: "Files" },
          ],
        },
      ],
    },
    {
      id: "4.3",
      title: "What is Graph RAG?",
      intro:
        "Graph RAG adds a knowledge graph to retrieval. The system finds the entities in the question, walks their relationships to collect connected facts, optionally adds vector-retrieved text, and gives the LLM a structured, explainable context.",
      visuals: [{ kind: "custom", key: "graphrag-concept" }],
      points: [
        { t: "Entity-based retrieval", d: "Start from the nodes mentioned in the question (entity linking)." },
        { t: "Relationship-based retrieval", d: "Expand along typed edges: WORKS_ON, USES, MANAGES…" },
        { t: "Traversal & contextual retrieval", d: "k-hop neighbourhoods and paths form the context." },
        { t: "Community detection & summarisation", d: "Cluster the graph, pre-summarise each cluster, and use the summaries for big-picture questions." },
      ],
    },
    {
      id: "4.4",
      title: "Graph RAG Architecture",
      intro: "This is the reference architecture. The top row runs offline (indexing) and the bottom row runs online (query).",
      visuals: [{ kind: "custom", key: "graphrag-architecture" }],
      table: {
        headers: ["Component", "Function"],
        rows: [
          ["Data Sources", "PDFs, websites, databases and documents"],
          ["Document Processing", "Cleaning, chunking and preprocessing"],
          ["Entity Extraction", "Extracting people, organizations and concepts"],
          ["Relationship Extraction", "Identifying connections between entities"],
          ["Graph Construction", "Creating nodes and relationships"],
          ["Embedding Generation", "Generating semantic vector representations"],
          ["Graph Storage", "Storing connected information"],
          ["Retrieval Engine", "Retrieving relevant graph context"],
          ["LLM", "Generating contextual responses"],
        ],
      },
    },
    {
      id: "4.5",
      title: "Types of Graph RAG Retrieval",
      intro: "Different questions need different retrieval strategies, and production systems usually route between several of them.",
      visuals: [
        {
          kind: "cards",
          cols: 4,
          items: [
            { title: "Local search", desc: "Entity + its neighbourhood. “What does John work on?”", icon: "Crosshair", tag: "specific" },
            { title: "Global search", desc: "Map-reduce over community summaries. “Main themes?”", icon: "Globe", tag: "holistic" },
            { title: "Hybrid search", desc: "Vector + keyword + graph, fused & re-ranked.", icon: "Combine", tag: "robust" },
            { title: "Entity-centric", desc: "Build an entity profile from all its relations.", icon: "UserCircle", tag: "profiles" },
            { title: "Community-based", desc: "Retrieve the cluster an entity belongs to.", icon: "Boxes", tag: "themes" },
            { title: "Graph traversal", desc: "Cypher paths / k-hop expansion.", icon: "Route", tag: "multi-hop" },
            { title: "Vector + Graph", desc: "Vector finds entry nodes, graph expands context.", icon: "Sparkles", tag: "most common" },
          ],
        },
      ],
    },
    {
      id: "4.6",
      title: "Traditional RAG vs Graph RAG",
      intro: "This is a side-by-side comparison of the two approaches.",
      table: {
        headers: ["Parameter", "Traditional RAG", "Graph RAG"],
        rows: [
          ["Retrieval", "Vector similarity", "Graph + semantic retrieval"],
          ["Data structure", "Document chunks", "Entities and relationships"],
          ["Context", "Local document context", "Connected contextual information"],
          ["Multi-hop reasoning", "Limited", "Relationship-driven"],
          ["Global insights", "Challenging", "Community-based approaches"],
          ["Explainability", "Retrieved chunks", "Entity and relationship paths"],
          ["Complexity", "Relatively simpler", "More complex"],
        ],
      },
      visuals: [
        {
          kind: "radar",
          axes: ["Multi-hop", "Global insights", "Explainability", "Setup simplicity", "Fuzzy semantic match", "Cost efficiency"],
          series: [
            { name: "Traditional RAG", values: [3, 2, 4, 9, 9, 8] },
            { name: "Graph RAG", values: [9, 8, 9, 4, 6, 5] },
          ],
          note: "Illustrative. Hybrid systems aim for the union of both shapes.",
        },
      ],
      callout: { kind: "trainer", text: "Run the same question in Lab 5 with both retrievers and let the room vote on which answer is better." },
    },
    {
      id: "4.7",
      title: "Understanding Microsoft GraphRAG",
      intro:
        "Microsoft Research's GraphRAG (2024) uses an LLM to build an entity graph from a corpus, partitions it into hierarchical communities with the Leiden algorithm, and pre-generates a summary report for every community. At query time, local search answers entity questions and global search map-reduces over community summaries to answer “what are the main themes?”.",
      visuals: [{ kind: "custom", key: "ms-graphrag" }, { kind: "custom", key: "communities" }],
      code: [
        { title: "graphrag CLI", lang: "bash", code: `pip install graphrag\ngraphrag init --root ./ragtest        # creates settings.yaml & prompts\n# put .txt files in ./ragtest/input\ngraphrag index --root ./ragtest       # extract → communities → reports\ngraphrag query --root ./ragtest --method global \\\n  --query "What are the top themes in this dataset?"\ngraphrag query --root ./ragtest --method local \\\n  --query "Who is Priya Sharma and what does she lead?"` },
      ],
    },
  ],
  trainer: [
    { minute: "0–8", note: "Classic RAG flow; show the embedding-space visual." },
    { minute: "8–15", note: "Limitations: tell the ‘he leads it’ chunk story." },
    { minute: "15–28", note: "Graph RAG concept + architecture diagram." },
    { minute: "28–36", note: "Retrieval types and comparison table." },
    { minute: "36–45", note: "Microsoft GraphRAG: communities & global search." },
  ],
  quiz: [
    { q: "Best retrieval for “What are the main themes across all documents?”", options: ["Top-k vector search", "Local entity search", "Global search over community summaries", "Keyword BM25"], answer: 2, why: "Global questions need a corpus-wide view; community summaries provide it." },
    { q: "Main reason vector RAG fails at multi-hop questions:", options: ["Embeddings are too small", "The second hop depends on an entity discovered in the first", "LLMs can't read", "Chunks are too long"], answer: 1, why: "Similarity to the original question doesn't surface the intermediate facts." },
    { q: "In MS GraphRAG, which algorithm partitions the graph into communities?", options: ["PageRank", "Dijkstra", "Leiden", "k-means"], answer: 2, why: "GraphRAG uses hierarchical Leiden community detection." },
    { q: "In ‘Vector + Graph’ retrieval, the vector index is typically used to…", options: ["Store relationships", "Find entry-point nodes/chunks", "Generate Cypher", "Summarise communities"], answer: 1, why: "Vector search finds semantically relevant starting points; the graph expands context around them." },
  ],
};

export const module5: Module = {
  id: 5,
  title: "Building Graph RAG Applications with Python",
  short: "Build Graph RAG",
  minutes: 65,
  gradient: "from-pink-500 via-rose-500 to-orange-400",
  accent: "#f472b6",
  icon: "Code2",
  tagline: "Core hands-on: from raw text to a grounded Q&A assistant.",
  objectives: [
    "Set up Python, Neo4j, LangChain/LlamaIndex and an LLM provider",
    "Build an ingestion pipeline with LLM entity & relationship extraction",
    "Construct and deduplicate the graph in Neo4j",
    "Implement graph + vector retrieval and an end-to-end Q&A system",
  ],
  sections: [
    {
      id: "5.1",
      title: "Development Environment and Architecture",
      intro: "The project has three pieces: a Python app that orchestrates the work, Neo4j to store the graph and vectors, and an LLM API to extract and answer. This app uses Groq because its fast inference makes demos feel instant.",
      visuals: [{ kind: "custom", key: "dev-architecture" }],
      code: [
        { title: "install.sh", lang: "bash", code: `python -m venv .venv && source .venv/bin/activate\npip install neo4j\npip install langchain\npip install langchain-community\npip install langchain-openai\npip install langchain-neo4j\npip install langchain-groq        # used in this course app\npip install langgraph\npip install llama-index\npip install python-dotenv` },
        { title: "config.py", lang: "python", code: `import os\nfrom dotenv import load_dotenv\nfrom langchain_groq import ChatGroq\nfrom langchain_neo4j import Neo4jGraph\n\nload_dotenv()\nllm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)\ngraph = Neo4jGraph(\n    url=os.environ["NEO4J_URI"],\n    username=os.environ["NEO4J_USERNAME"],\n    password=os.environ["NEO4J_PASSWORD"],\n)\nprint(graph.schema)` },
      ],
    },
    {
      id: "5.2",
      title: "Building the Data Ingestion Pipeline",
      intro: "Ingestion turns raw files into clean, chunked, metadata-rich documents that the extractor can read.",
      visuals: [
        {
          kind: "flow",
          wrap: true,
          steps: [
            { title: "Load", desc: "PyPDFLoader / TextLoader", icon: "FileText" },
            { title: "Clean", desc: "Strip headers, fix whitespace", icon: "Wand2" },
            { title: "Chunk", desc: "Recursive splitter, overlap", icon: "Scissors" },
            { title: "Metadata", desc: "source, page, date", icon: "Tags" },
            { title: "Extract entities", desc: "LLM → typed nodes", icon: "Users" },
            { title: "Extract relations", desc: "LLM → typed edges", icon: "Share2" },
            { title: "Structured output", desc: "GraphDocument / JSON", icon: "Braces" },
          ],
        },
        {
          kind: "bars",
          title: "Chunk size trade-offs",
          series: ["Extraction recall", "Context coherence", "Cost per doc"],
          data: [
            { label: "256 tok", values: [9, 4, 9] },
            { label: "512 tok", values: [8, 6, 7] },
            { label: "1024 tok", values: [6, 8, 5] },
            { label: "2048 tok", values: [4, 9, 3] },
          ],
          max: 10,
          note: "Illustrative: smaller chunks find more entities but break context. ~512–1024 with 10–20% overlap is a good default.",
        },
      ],
      code: [
        { title: "ingest.py", lang: "python", code: `from langchain_community.document_loaders import PyPDFLoader\nfrom langchain_text_splitters import RecursiveCharacterTextSplitter\n\ndocs = PyPDFLoader("handbook.pdf").load()\nsplitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)\nchunks = splitter.split_documents(docs)\nfor i, c in enumerate(chunks):\n    c.metadata.update({"chunk_id": i, "source": "handbook.pdf"})\nprint(len(chunks), "chunks")` },
      ],
    },
    {
      id: "5.3",
      title: "Extracting Entities and Relationships Using LLMs",
      intro:
        "The LLM reads each chunk and returns structured triples. A good prompt fixes the allowed node labels and relationship types (the schema), asks for canonical names, and requires JSON output.",
      visuals: [{ kind: "custom", key: "extraction-demo" }],
      table: {
        headers: ["Subject", "Relationship", "Object"],
        rows: [
          ["John", "WORKS_AT", "Microsoft"],
          ["John", "HAS_ROLE", "AI Engineer"],
          ["John", "USES", "Python"],
          ["John", "USES", "LangChain"],
          ["John", "DEVELOPS", "Intelligent Applications"],
        ],
      },
      code: [
        { title: "extract.py (LangChain)", lang: "python", code: `from langchain_experimental.graph_transformers import LLMGraphTransformer\n\ntransformer = LLMGraphTransformer(\n    llm=llm,\n    allowed_nodes=["Person", "Organization", "Role", "Technology", "Concept"],\n    allowed_relationships=["WORKS_AT", "HAS_ROLE", "USES", "DEVELOPS"],\n)\ngraph_docs = transformer.convert_to_graph_documents(chunks)\nprint(graph_docs[0].nodes, graph_docs[0].relationships)` },
        { title: "extract_raw.py (structured output)", lang: "python", code: `from pydantic import BaseModel\n\nclass Triple(BaseModel):\n    subject: str; subject_type: str\n    relation: str\n    object: str; object_type: str\n\nclass KG(BaseModel):\n    triples: list[Triple]\n\nextractor = llm.with_structured_output(KG)\nkg = extractor.invoke(f"Extract a knowledge graph from:\\n{text}")` },
      ],
      lab: 3,
    },
    {
      id: "5.4",
      title: "Constructing the Knowledge Graph",
      intro: "Extracted triples become Cypher MERGE statements. Before writing them, normalise names and deduplicate so that ‘MSFT’ and ‘Microsoft’ become one node.",
      visuals: [{ kind: "custom", key: "dedupe" }],
      code: [
        { title: "store.py", lang: "python", code: `# Option A — LangChain helper\ngraph.add_graph_documents(graph_docs, include_source=True, baseEntityLabel=True)\n\n# Option B — explicit Cypher (full control)\nfor t in kg.triples:\n    driver.execute_query(f"""\n      MERGE (a:{t.subject_type} {{name: $s}})\n      MERGE (b:{t.object_type} {{name: $o}})\n      MERGE (a)-[:{t.relation}]->(b)""",\n      s=normalize(t.subject), o=normalize(t.object))` },
        { title: "validate.cypher", lang: "cypher", code: `// orphan nodes\nMATCH (n) WHERE NOT (n)--() RETURN labels(n), n.name;\n// possible duplicates\nMATCH (a), (b) WHERE id(a) < id(b)\n  AND toLower(a.name) = toLower(b.name)\nRETURN a.name, b.name;` },
      ],
      lab: 4,
    },
    {
      id: "5.5",
      title: "Implementing Graph-Based Retrieval",
      intro: "At query time you find the entities in the question, fetch their connected context with Cypher (written by hand or generated by the LLM), optionally fuse it with vector hits, and format the result for the LLM.",
      visuals: [{ kind: "custom", key: "hybrid-retrieval" }],
      code: [
        { title: "text2cypher.py", lang: "python", code: `from langchain_neo4j import GraphCypherQAChain\n\nchain = GraphCypherQAChain.from_llm(\n    llm=llm, graph=graph, verbose=True,\n    validate_cypher=True, allow_dangerous_requests=True,\n)\nchain.invoke({"query": "Which projects use LangChain and Neo4j?"})` },
        { title: "hybrid.py", lang: "python", code: `from langchain_neo4j import Neo4jVector\n\nretrieval_query = """\nWITH node, score\nOPTIONAL MATCH (node)<-[:WORKS_ON]-(e:Employee)\nOPTIONAL MATCH (node)-[:USES]->(t:Technology)\nRETURN node.description + '\\nTeam: ' + apoc.text.join(collect(DISTINCT e.name), ', ')\n       + '\\nTech: ' + apoc.text.join(collect(DISTINCT t.name), ', ') AS text,\n       score, {project: node.name} AS metadata\n"""\nstore = Neo4jVector.from_existing_index(\n    embeddings, index_name="project_embeddings",\n    retrieval_query=retrieval_query)\nstore.similarity_search("graph-based fraud detection", k=3)` },
      ],
      lab: 5,
    },
    {
      id: "5.6",
      title: "Building the Graph RAG Question Answering System",
      intro: "Here is the full loop as implemented by the AI Assistant in this app, built with LangGraph.",
      visuals: [
        {
          kind: "flow",
          wrap: true,
          steps: [
            { title: "1 · Ask", desc: "Natural-language question", icon: "MessageSquare" },
            { title: "2 · Identify", desc: "LLM finds entities", icon: "Tags" },
            { title: "3 · Link", desc: "Match graph nodes", icon: "Link" },
            { title: "4 · Traverse", desc: "Walk relationships", icon: "Route" },
            { title: "5 · Retrieve", desc: "Collect context", icon: "Layers" },
            { title: "6 · Augment", desc: "Context → LLM", icon: "Brain" },
            { title: "7 · Generate", desc: "Grounded answer", icon: "Sparkles" },
            { title: "8 · Cite", desc: "Sources & graph paths", icon: "Eye" },
          ],
        },
      ],
      lab: 6,
    },
    {
      id: "5.7",
      title: "Hands-on Demonstration: Enterprise Knowledge Graph Assistant",
      intro:
        "Business scenario: an AI assistant that understands the organisation's employees, projects, technologies, skills and how they relate. Open Lab 6 or the AI Assistant and try the sample questions. You'll see the agent's reasoning, its Cypher, and the graph path behind every answer.",
      visuals: [{ kind: "custom", key: "sample-questions" }],
      lab: 6,
    },
  ],
  trainer: [
    { minute: "0–8", note: "Environment: everyone pastes their Groq key in Settings." },
    { minute: "8–18", note: "Ingestion + chunking trade-off chart." },
    { minute: "18–30", note: "Lab 3: live LLM extraction on learners' own sentences." },
    { minute: "30–42", note: "Lab 4: build the graph, show dedup, export Cypher." },
    { minute: "42–52", note: "Lab 5: vector vs graph retrieval, side by side." },
    { minute: "52–65", note: "Lab 6: Q&A assistant: run all 5 sample questions." },
  ],
  quiz: [
    { q: "Why constrain allowed node/relationship types during extraction?", options: ["To make the LLM faster", "To keep the graph schema consistent and queryable", "Because Neo4j requires it", "To reduce embeddings"], answer: 1, why: "Free-form extraction produces dozens of near-synonym relation types that are hard to query." },
    { q: "GraphCypherQAChain primarily does:", options: ["Vector search", "Text-to-Cypher then answer from results", "Community detection", "PDF loading"], answer: 1, why: "It asks the LLM to write Cypher, runs it, then asks the LLM to answer from the rows." },
    { q: "Entity deduplication should happen…", options: ["After answering", "Before/while writing to the graph", "Only in the UI", "Never"], answer: 1, why: "Duplicates fragment the graph and break traversal, so normalise before MERGE." },
    { q: "In the 8-step QA flow, step 8 is important because it…", options: ["Speeds up the model", "Provides explainability via sources & paths", "Reduces tokens", "Trains the model"], answer: 1, why: "Showing the path makes answers auditable." },
  ],
};

export const module6: Module = {
  id: 6,
  title: "Advanced Graph RAG, Agentic AI and Enterprise Use Cases",
  short: "Agentic Graph RAG",
  minutes: 40,
  gradient: "from-indigo-500 via-purple-500 to-sky-400",
  accent: "#818cf8",
  icon: "Bot",
  tagline: "Agents that plan, query and update knowledge graphs.",
  objectives: [
    "Apply hybrid retrieval, query decomposition and context expansion",
    "Build graph-powered agents with LangGraph and tool calling",
    "Map the ecosystem and enterprise use cases",
    "Recognise challenges, best practices and future directions",
  ],
  sections: [
    {
      id: "6.1",
      title: "Advanced Graph RAG Techniques",
      intro: "Production systems go past a single retrieval step. They break questions into parts, expand context selectively, rank and filter, and keep the graph up to date.",
      visuals: [
        { kind: "custom", key: "query-decomposition" },
        {
          kind: "cards",
          cols: 4,
          items: [
            { title: "Hybrid graph+vector", desc: "Reciprocal-rank fusion of both retrievers", icon: "Combine" },
            { title: "Dynamic traversal", desc: "LLM decides which edge to follow next", icon: "Compass" },
            { title: "Context expansion", desc: "Grow k-hop until token budget", icon: "Expand" },
            { title: "Filtering & ranking", desc: "PageRank / recency / relevance scores", icon: "Filter" },
            { title: "Query decomposition", desc: "Split into sub-questions", icon: "Split" },
            { title: "Multi-hop QA", desc: "Chain sub-answers", icon: "Route" },
            { title: "KG updates", desc: "MERGE new facts as they arrive", icon: "RefreshCw" },
            { title: "Incremental indexing", desc: "Only re-extract changed docs", icon: "Clock" },
          ],
        },
      ],
    },
    {
      id: "6.2",
      title: "Graph RAG with Agentic AI",
      intro:
        "An agent is an LLM in a loop with tools. Given a knowledge graph as a tool, it can look up entities, write and run Cypher, follow paths, and decide when it has enough information to answer. LangGraph models this loop as a state machine you can inspect, with nodes, edges, persistent state and checkpoints.",
      visuals: [{ kind: "custom", key: "agent-loop" }],
      points: [
        { t: "LLM-driven Cypher", d: "The agent writes Cypher from the schema, and the tool validates it as read-only before running." },
        { t: "Tool calling", d: "search_entities, get_neighbors, find_paths, run_cypher: small composable tools beat one giant tool." },
        { t: "Planning & reasoning", d: "Decompose → act → observe → reflect, repeated until it can answer." },
        { t: "Multi-agent retrieval", d: "A router agent dispatches to graph, vector and SQL specialists." },
        { t: "Write-back", d: "Agents can MERGE newly learned facts behind human approval (interrupts in LangGraph)." },
      ],
      code: [
        { title: "agent.py (LangGraph)", lang: "python", code: `from langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode, tools_condition\nfrom langchain_core.tools import tool\n\n@tool\ndef run_cypher(query: str) -> str:\n    """Run a READ-ONLY Cypher query against the company graph."""\n    return str(graph.query(query)[:25])\n\ntools = [run_cypher, search_entities, find_paths]\nllm_t = llm.bind_tools(tools)\n\ndef agent(state: MessagesState):\n    return {"messages": [llm_t.invoke([SYSTEM] + state["messages"])]}\n\nb = StateGraph(MessagesState)\nb.add_node("agent", agent)\nb.add_node("tools", ToolNode(tools))\nb.add_edge(START, "agent")\nb.add_conditional_edges("agent", tools_condition)  # → tools | END\nb.add_edge("tools", "agent")\napp = b.compile()\n\napp.invoke({"messages": [("user", "Who knows Python and Agentic AI?")]})` },
        { title: "agent.ts (this app, LangGraph.js)", lang: "typescript", code: `const graph = new StateGraph(AgentState)\n  .addNode("link_entities", linkEntities)   // LLM + fuzzy match\n  .addNode("agent", callModel)              // ChatGroq.bindTools(tools)\n  .addNode("tools", new ToolNode(tools))\n  .addEdge(START, "link_entities")\n  .addEdge("link_entities", "agent")\n  .addConditionalEdges("agent", toolsCondition, ["tools", END])\n  .addEdge("tools", "agent")\n  .compile();` },
      ],
      lab: 6,
    },
    {
      id: "6.3",
      title: "Advanced Frameworks and Ecosystem",
      intro: "These are the main tools in the Graph RAG ecosystem and what each one is used for.",
      visuals: [
        {
          kind: "cards",
          cols: 4,
          items: [
            { title: "Neo4j", desc: "Graph database and graph retrieval", icon: "Database" },
            { title: "Microsoft GraphRAG", desc: "Graph-based RAG implementation", icon: "Network" },
            { title: "LangChain", desc: "LLM and graph integration", icon: "Link" },
            { title: "LangGraph", desc: "Stateful agent workflows", icon: "Workflow" },
            { title: "LlamaIndex", desc: "Knowledge ingestion and retrieval (PropertyGraphIndex)", icon: "BookOpen" },
            { title: "Graph Data Science", desc: "Graph algorithms and analytics", icon: "FlaskConical" },
            { title: "RDFLib", desc: "RDF knowledge graph development", icon: "Globe" },
            { title: "NetworkX", desc: "Graph analysis using Python", icon: "Share2" },
          ],
        },
      ],
    },
    {
      id: "6.4",
      title: "Enterprise Applications of Graph RAG",
      intro: "Graph RAG pays off most in domains where the value lies in the connections between things.",
      visuals: [{ kind: "custom", key: "use-cases" }],
    },
    {
      id: "6.5",
      title: "Challenges and Best Practices",
      intro: "Graph RAG is powerful but it adds moving parts. Each challenge below has a known mitigation.",
      visuals: [{ kind: "custom", key: "challenges" }],
    },
    {
      id: "6.6",
      title: "Future of Graph-Based AI",
      intro: "Several directions are converging: graphs that change over time, graphs that include images and audio, foundation models trained on graphs, and agents that maintain their own knowledge.",
      visuals: [
        {
          kind: "timeline",
          items: [
            { year: "Now", title: "Graph-powered agents", desc: "Agents with KG tools & memory (LangGraph, MCP)", icon: "Bot" },
            { year: "Now", title: "Temporal KGs", desc: "Facts with valid-from/to (e.g. Graphiti, Zep)", icon: "CalendarClock" },
            { year: "Next", title: "Dynamic KGs", desc: "Self-updating graphs from event streams", icon: "RefreshCw" },
            { year: "Next", title: "Multimodal KGs", desc: "Images, audio, video as nodes & evidence", icon: "Image" },
            { year: "Next", title: "GNNs + LLMs", desc: "Graph neural nets encode structure for LLMs", icon: "Atom" },
            { year: "Future", title: "Graph foundation models", desc: "Pre-trained across many graphs, zero-shot tasks", icon: "Rocket" },
            { year: "Future", title: "Enterprise intelligence", desc: "The company KG as the shared memory of every agent", icon: "Building2" },
          ],
        },
      ],
    },
  ],
  trainer: [
    { minute: "0–8", note: "Query decomposition visual: walk one complex question." },
    { minute: "8–20", note: "Agent loop + LangGraph code; open the AI Assistant and show the trace." },
    { minute: "20–28", note: "Ecosystem + use cases: ask each learner to pick one for their org." },
    { minute: "28–36", note: "Challenges & best practices." },
    { minute: "36–40", note: "Future, wrap-up, final quiz." },
  ],
  quiz: [
    { q: "In LangGraph, what decides whether the agent calls tools or finishes?", options: ["A cron job", "A conditional edge (e.g. toolsCondition)", "The vector DB", "Neo4j triggers"], answer: 1, why: "Conditional edges route on state, e.g. whether the last AI message has tool calls." },
    { q: "Best safeguard for LLM-generated Cypher:", options: ["Run as admin", "Validate read-only & use a restricted DB user", "Disable logging", "Increase temperature"], answer: 1, why: "Never let generated queries write or delete unchecked; enforce least privilege." },
    { q: "Temporal knowledge graphs add…", options: ["Colours to nodes", "Validity time ranges to facts", "Vector indexes", "More labels"], answer: 1, why: "They track when facts were true, which enables ‘as of’ reasoning." },
    { q: "Query decomposition helps because…", options: ["It reduces the graph size", "Complex questions become simpler, independently answerable sub-questions", "It removes the LLM", "It caches answers"], answer: 1, why: "Each sub-question maps to a focused retrieval; answers are then combined." },
  ],
};
