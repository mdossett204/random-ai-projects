import yfinance as yf
from langchain_core.tools import tool


@tool
def get_stock_info(ticker: str) -> str:
    """Get basic stock ticker information such as price, quotes, and more.

    Args:
        ticker (str): the ticker of a stock
    """
    data = yf.Ticker(ticker).fast_info
    if data.shares:
        return data.toJSON()
    return ""
