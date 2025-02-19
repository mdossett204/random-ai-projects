from typing import Dict
from langsmith import traceable
from langgraph.graph import START, StateGraph, END
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode

from chatbot.utils.message_config import State
from chatbot.utils.llama_model import model, trimmer, tools
from chatbot.utils.message_config import prompt_template
from chatbot.utils.document_helper import query_relevant_text

LANGUAGE: str = "English"
CONFIG: Dict[str, Dict[str, str]] = {"configurable": {"thread_id": "options-trading-chat"}}
TOP_N = 3

workflow = StateGraph(state_schema=State)

tool_node = ToolNode(tools)


def retrieve(state: State):
    retrieved_docs = query_relevant_text(query=state["question"], top_n=TOP_N)
    return {"context": retrieved_docs}


def call_model(state: State):
    trimmed_messages = trimmer.invoke(state["messages"])
    docs_content = "".join(doc.page_content for doc in state["context"])
    prompt = prompt_template.invoke(
        {"messages": trimmed_messages, "context": docs_content, "question": state["question"]}
    )
    response = model.invoke(prompt)
    return {"messages": [response]}


def should_continue(state: State):
    last_message = state["messages"][-1]
    question = state["question"]
    if last_message.tool_calls:
        if "ticker" in question or "stock" in question:
            return "tools"
        return "llm"
    return END


# workflow.add_sequence([retrieve, call_model])
workflow.add_node("llm", call_model)
workflow.add_node("tools", tool_node)
workflow.add_node("retrieve", retrieve)

workflow.add_edge(START, "retrieve")
workflow.add_edge("retrieve", "llm")
workflow.add_conditional_edges("llm", should_continue, ["tools", END, "llm"])
workflow.add_edge("tools", "llm")

memory = MemorySaver()
app = workflow.compile(checkpointer=memory)


@traceable(run_type="chain", name="ollama chat bot", project_name="chatbot for options")
def chat(input_text: str):
    input_messages = [HumanMessage(input_text)]
    output_message = app.invoke({"messages": input_messages, "question": input_text}, CONFIG)["messages"][-1]
    if isinstance(output_message, AIMessage):
        return output_message.content
