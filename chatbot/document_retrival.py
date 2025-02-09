from chatbot.utils.document_helper import load_web_pages, split_pages, query_relevant_text
import asyncio

INVESTOPEDIA_URLS = [
    "https://www.investopedia.com/terms/o/optionscontract.asp",
    "https://www.investopedia.com/terms/c/coveredcall.asp",
]
INVESTOPEDIA_CLASS = "loc article-content"
SEPARATOR = " "
REPLACER = ["\xa0"]
CHUNK_SIZE = 500
OVERLAP = 0


async def get_relevant_documents(query: str):
    web_pages = await load_web_pages(
        urls=INVESTOPEDIA_URLS, soup_class=INVESTOPEDIA_CLASS, separator=SEPARATOR, replacer=REPLACER
    )
    split_chunks = split_pages(web_pages, CHUNK_SIZE, OVERLAP)
    relevant_docs = await query_relevant_text(docs=split_chunks, query=query, top_n=1)
    print(relevant_docs)
    return relevant_docs


if __name__ == "__main__":
    asyncio.run(get_relevant_documents("what is a put option"))
