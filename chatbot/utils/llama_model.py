from typing import List, Callable
from langchain_ollama import ChatOllama
from langchain_core.messages import trim_messages
from chatbot.utils.tool_calls.yahoo_finance import get_stock_info

MODEL_NAME: str = "llama3.1"
MAX_TOKEN: int = 500
tools: List[Callable] = [get_stock_info]
model = ChatOllama(model=MODEL_NAME, temperature=0).bind_tools(tools)

trimmer = trim_messages(
    max_tokens=MAX_TOKEN, strategy="last", token_counter=model, include_system=True, allow_partial=False
)
