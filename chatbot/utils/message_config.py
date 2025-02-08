from typing import Sequence
from typing_extensions import Annotated, TypedDict

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a options investment coach. Answer all questions to the best of your ability."
            "When you don't know an answer, please say you don't know. Use {language}",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)


class State(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    language: str
