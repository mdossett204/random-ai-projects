from typing import Dict
from langgraph.graph import START, StateGraph
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.checkpoint.memory import MemorySaver

from chatbot.utils.message_config import State
from chatbot.utils.llama_model import model, trimmer
from chatbot.utils.message_config import prompt_template
from chatbot.utils.document_helper import query_relevant_text

LANGUAGE: str = "English"
CONFIG: Dict[str, Dict[str, str]] = {"configurable": {"thread_id": "options-trading-chat"}}
TOP_N = 3

workflow = StateGraph(state_schema=State)


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
    return {"messages": [AIMessage(content=response)]}


workflow.add_sequence([retrieve, call_model])
workflow.add_edge(START, "retrieve")

memory = MemorySaver()
app = workflow.compile(checkpointer=memory)


async def chat(input_text: str):
    input_messages = [HumanMessage(input_text)]
    async for chunk, metadata in app.astream(
        {"messages": input_messages, "question": input_text},
        CONFIG,
        stream_mode="messages",
    ):
        if isinstance(chunk, AIMessage):
            yield chunk.content
