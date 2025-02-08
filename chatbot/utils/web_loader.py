from typing import List
import bs4
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.documents.base import Document


async def load_web_pages(urls: List[str], soup_class, separator) -> List[Document]:
    web_loader = WebBaseLoader(
        web_paths=urls,
        bs_kwargs={"parse_only": bs4.SoupStrainer(class_=soup_class)},
        bs_get_text_kwargs={"separator": separator, "strip": True},
    )
    docs = []
    async for doc in web_loader.alazy_load():
        docs.append(doc)
    return docs
