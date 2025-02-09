from typing import Dict
from langgraph.graph import START, StateGraph
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.checkpoint.memory import MemorySaver

from chatbot.utils.message_config import State
from chatbot.utils.llama_model import model, trimmer
from chatbot.utils.message_config import prompt_template
from chatbot.document_retrival import get_relevant_documents

LANGUAGE: str = "English"
CONFIG: Dict[str, Dict[str, str]] = {"configurable": {"thread_id": "options-trading-chat"}}

workflow = StateGraph(state_schema=State)


def retrieve(state: State):
    trimmed_messages = trimmer.invoke(state["messages"])
    # prompt = prompt_template.invoke({"messages": trimmed_messages, "context": state["context"]})
    retrieved_docs = get_relevant_documents(trimmed_messages[-1].content)
    return {"context": retrieved_docs}


def call_model(state: State):
    trimmed_messages = trimmer.invoke(state["messages"])
    docs_content = "".join(doc.page_content for doc in state["context"])
    prompt = prompt_template.invoke({"messages": trimmed_messages, "context": docs_content})
    response = model.invoke(prompt)
    return {"messages": [AIMessage(content=response)]}


workflow.add_sequence([retrieve, call_model])
workflow.add_edge(START, "retrieve")
# workflow.add_node("model", call_model)

memory = MemorySaver()
app = workflow.compile(checkpointer=memory)


async def chat(input_text: str):
    input_messages = [HumanMessage(input_text)]
    # context = await get_relevant_documents(input_text)
    async for chunk, metadata in app.astream(
        {"messages": input_messages},
        CONFIG,
        stream_mode="messages",
    ):
        if isinstance(chunk, AIMessage):
            yield chunk.content
