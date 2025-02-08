from chatbot.utils.web_loader import load_web_pages
import asyncio

INVESTOPEDIA_URLS = [
    "https://www.investopedia.com/terms/o/optionscontract.asp",
    "https://www.investopedia.com/terms/c/coveredcall.asp",
]
INVESTOPEDIA_CLASS = "loc article-content"
SEPARATOR = "\n"


async def get_documents():
    result = await load_web_pages(urls=INVESTOPEDIA_URLS, soup_class=INVESTOPEDIA_CLASS, separator=SEPARATOR)
    for doc in result:
        print(doc.metadata)
        print(len(doc.page_content))
    return result


if __name__ == "__main__":
    asyncio.run(get_documents())
