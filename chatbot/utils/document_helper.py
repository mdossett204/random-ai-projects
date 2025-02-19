from typing import List
import bs4
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.documents.base import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

MODEL_NAME = "sentence-transformers/all-mpnet-base-v2"
EMBEDDINGS_MODEL = HuggingFaceEmbeddings(model_name=MODEL_NAME)
INVESTOPEDIA_URLS = [
    "https://www.investopedia.com/terms/o/optionscontract.asp",
    "https://www.investopedia.com/terms/c/coveredcall.asp",
    "https://www.investopedia.com/terms/m/marriedput.asp",
    "https://www.investopedia.com/trading/getting-to-know-the-greeks/",
    "https://www.investopedia.com/terms/v/verticalspread.asp",
    "https://www.investopedia.com/terms/i/ironcondor.asp",
    "https://www.investopedia.com/terms/l/leaps.asp",
    "https://www.investopedia.com/articles/optioninvestor/10/sell-puts-benefit-any-market.asp",
    "https://www.investopedia.com/terms/c/calendarspread.asp",
    "https://www.investopedia.com/trading/options-strategies/",
    "https://www.investopedia.com/articles/optioninvestor/07/options_beat_market.asp",
    "https://www.investopedia.com/trading/options-trading-volume-and-open-interest/",
    "https://www.investopedia.com/terms/v/volatility.asp",
]
INVESTOPEDIA_CLASS = "loc article-content"
SEPARATOR = " "
REPLACER = ["\xa0"]
CHUNK_SIZE = 500
OVERLAP = 0
SCORE_THRESHOLD: float = 0.5


def load_web_pages(urls: List[str], soup_class: str, separator: str, replacer: List[str]) -> List[str]:
    web_loader = WebBaseLoader(
        web_paths=urls,
        bs_kwargs={"parse_only": bs4.SoupStrainer(class_=soup_class)},
        bs_get_text_kwargs={"separator": separator, "strip": True},
    )
    docs = []
    for doc in web_loader.lazy_load():
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


web_pages = load_web_pages(
    urls=INVESTOPEDIA_URLS, soup_class=INVESTOPEDIA_CLASS, separator=SEPARATOR, replacer=REPLACER
)
split_chunks = split_pages(web_pages, CHUNK_SIZE, OVERLAP)
VECTOR_DATABASE = Chroma.from_documents(split_chunks, EMBEDDINGS_MODEL)


def query_relevant_text(query: str, top_n: int) -> List[Document]:
    query_results = VECTOR_DATABASE.similarity_search_with_relevance_scores(query=query, k=top_n)
    return [doc for doc, score in query_results if score >= SCORE_THRESHOLD]
