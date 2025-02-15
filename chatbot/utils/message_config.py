from typing import Sequence
from typing import List
from typing_extensions import Annotated, TypedDict

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from langchain_core.documents.base import Document

prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a options investment coach. Answer all questions to the best of your ability. "
            "When you don't know an answer, please say you don't know. Before you start, make sure"
            "you greet the user first with a quick introduction "
            "{context}",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)


class State(TypedDict):
    question: str
    messages: Annotated[Sequence[BaseMessage], add_messages]
    context: List[Document]
