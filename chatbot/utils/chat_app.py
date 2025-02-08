from typing import Dict
from langgraph.graph import START, StateGraph
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.checkpoint.memory import MemorySaver

from chatbot.utils.message_config import State
from chatbot.utils.llama_model import model, trimmer
from chatbot.utils.message_config import prompt_template

LANGUAGE: str = "English"
CONFIG: Dict[str, Dict[str, str]] = {"configurable": {"thread_id": "options-trading-chat"}}


workflow = StateGraph(state_schema=State)


async def call_model(state: State):
    trimmed_messages = trimmer.invoke(state["messages"])
    prompt = prompt_template.invoke({"messages": trimmed_messages, "language": state["language"]})
    response = await model.ainvoke(prompt)
    return {"messages": [AIMessage(content=response)]}


workflow.add_edge(START, "model")
workflow.add_node("model", call_model)

memory = MemorySaver()
app = workflow.compile(checkpointer=memory)


async def chat(input_text: str):
    input_messages = [HumanMessage(input_text)]
    async for chunk, metadata in app.astream(
        {"messages": input_messages, "language": LANGUAGE},
        CONFIG,
        stream_mode="messages",
    ):
        if isinstance(chunk, AIMessage):
            yield chunk.content
