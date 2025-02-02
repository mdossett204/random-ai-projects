from dotenv import load_dotenv
from langchain_core.messages import AIMessage, HumanMessage
from langchain_ollama.llms import OllamaLLM
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, MessagesState, StateGraph

load_dotenv()

config = {"configurable": {"thread_id": "chatbot-test-0"}}

workflow = StateGraph(state_schema=MessagesState)

model = OllamaLLM(model="llama3.2:3b-instruct-fp16")


def call_model(state: MessagesState):
    response = model.invoke(state["messages"])
    return {"messages": response}


workflow.add_edge(START, "model")
workflow.add_node("model", call_model)

memory = MemorySaver()
app = workflow.compile(checkpointer=memory)

query = "H! My name is Cindy."

input_messages = [HumanMessage(query)]
output = app.invoke({"messages": input_messages}, config)
output["messages"][-1].pretty_print()
