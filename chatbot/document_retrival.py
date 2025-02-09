from chatbot.utils.document_helper import load_web_pages, split_pages
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


async def get_documents():
    web_pages = await load_web_pages(
        urls=INVESTOPEDIA_URLS, soup_class=INVESTOPEDIA_CLASS, separator=SEPARATOR, replacer=REPLACER
    )
    split_chunks = split_pages(web_pages, CHUNK_SIZE, OVERLAP)
    return split_chunks


if __name__ == "__main__":
    asyncio.run(get_documents())
