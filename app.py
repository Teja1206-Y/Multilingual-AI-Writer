import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.memory import ConversationBufferMemory
from langchain import hub
from langchain_core.messages import HumanMessage
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="Logistics AI Agent")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_credentials=True,
    allow_headers=["*"],
)

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.3
)

logistics_knowledge = """
Shipment statuses: PENDING, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, FAILED, RETURNED.
Failed delivery reasons: wrong address, customer unavailable, damaged package, refused delivery.
RCA for delays: weather disruption, customs hold, hub congestion, last mile failure.
SLA breach: if shipment not delivered within promised date, auto-escalate to carrier.
NDR workflow: Non Delivery Report triggered after failed attempt, retry window is 24-48 hours.
Reverse logistics: return shipments follow same tracking but reversed origin-destination.
"""

print("Loading embeddings model...")
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True}
)
print("Embeddings model loaded!")

splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=20)
chunks = splitter.create_documents([logistics_knowledge])

print("Building vector store...")
vectorstore = FAISS.from_documents(
    documents=chunks,
    embedding=embeddings
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
print("Vector store ready!")

def search_knowledge_base(query: str) -> str:
    docs = retriever.get_relevant_documents(query)
    if not docs:
        return "No relevant logistics information found."
    return "\n".join([doc.page_content for doc in docs])

def analyze_shipment_status(status_info: str) -> str:
    statuses = ["PENDING", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED"]
    for status in statuses:
        if status in status_info.upper():
            return f"Status '{status}' detected. Workflow triggered for {status}."
    return "Unknown shipment status. Please verify shipment ID with carrier."

tools = [
    Tool(
        name="LogisticsKnowledgeBase",
        func=search_knowledge_base,
        description="Search logistics workflows, SLA rules, NDR process, delay RCA and shipment operations."
    ),
    Tool(
        name="ShipmentStatusAnalyzer",
        func=analyze_shipment_status,
        description="Analyze shipment status string and determine the next workflow action."
    )
]

print("Setting up agent...")
prompt = hub.pull("hwchase17/react")
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
agent = create_react_agent(llm=llm, tools=tools, prompt=prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    memory=memory,
    verbose=True,
    handle_parsing_errors=True,
    max_iterations=10,
    max_execution_time=30,
    return_intermediate_steps=False
)
print("Agent ready!")

# ── Models ────────────────────────────────────────────────────
class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    response: str
    status: str

class DirectQueryRequest(BaseModel):
    query: str

# ── Endpoints ─────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Logistics AI Agent is running", "status": "healthy"}

@app.post("/agent/query", response_model=QueryResponse)
def query_agent(request: QueryRequest):
    try:
        result = agent_executor.invoke({"input": request.query})
        return QueryResponse(response=result["output"], status="success")
    except Exception as e:
        return QueryResponse(response=str(e), status="error")

@app.post("/llm/query")
def direct_llm(request: DirectQueryRequest):
    try:
        result = llm.invoke([HumanMessage(content=request.query)])
        return {"response": result.content, "status": "success"}
    except Exception as e:
        return {"response": str(e), "status": "error"}

@app.get("/health")
def health():
    return {"status": "healthy", "model": "llama-3.3-70b-versatile", "embeddings": "HuggingFace-MiniLM"}
