from typing import List
import bs4
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.documents.base import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


async def load_web_pages(urls: List[str], soup_class: str, separator: str, replacer: List[str]) -> List[str]:
    web_loader = WebBaseLoader(
        web_paths=urls,
        bs_kwargs={"parse_only": bs4.SoupStrainer(class_=soup_class)},
        bs_get_text_kwargs={"separator": separator, "strip": True},
    )
    docs = []
    async for doc in web_loader.alazy_load():
        content = doc.page_content
        for replace in replacer:
            content.replace(replace, "")
        docs.append(content)
    return docs


def split_pages(
    docs: List[str],
    chunk_size: int,
    chunk_overlap: int,
) -> List[Document]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )
    return text_splitter.create_documents(docs)
