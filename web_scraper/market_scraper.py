# main_marketwatch.py
# A Python script to scrape all important data from MarketWatch.com.
# This version uses selenium-stealth to avoid bot detection.

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import pandas as pd
from selenium_stealth import stealth  # Import the stealth library


def scrape_marketwatch_data():
    """
    This function initializes a stealthy Selenium WebDriver, navigates to the
    MarketWatch homepage, and scrapes the main market data table, headlines,
    and latest news.
    """
    # --- 1. Setup Selenium WebDriver ---
    print("Setting up the Chrome WebDriver...")
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("start-maximized")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
    except Exception as e:
        print(f"Error setting up WebDriver: {e}")
        return None, None, None

    # --- Apply Stealth ---
    stealth(
        driver,
        languages=["en-US", "en"],
        vendor="Google Inc.",
        platform="Win32",
        webgl_vendor="Intel Inc.",
        renderer="Intel Iris OpenGL Engine",
        fix_hairline=True,
    )
    print("Selenium Stealth has been applied.")

    # --- 2. Navigate to the Website ---
    url = "https://www.marketwatch.com/"
    print(f"Navigating to {url}...")
    driver.get(url)

    # --- 3. Wait for Page Elements to Load ---
    print("Waiting for page elements to load...")
    try:
        wait = WebDriverWait(driver, 30)
        # Wait for a container that holds both market data and headlines
        wait.until(EC.presence_of_element_located((By.ID, "maincontent")))
        print("Page content found.")
        time.sleep(3)
    except Exception as e:
        print(f"Error waiting for page elements: {e}")
        driver.quit()
        return None, None, None

    # --- 4. Get Page Source and Parse with BeautifulSoup ---
    print("Extracting page source and parsing with BeautifulSoup...")
    html_source = driver.page_source
    soup = BeautifulSoup(html_source, "html.parser")

    # --- 5. Extract All Data ---
    market_df = extract_market_data(soup)
    headlines_df = extract_headlines(soup)
    latest_news_df = extract_latest_news(soup)

    # --- 6. Clean Up ---
    print("Closing the browser.")
    driver.quit()

    return market_df, headlines_df, latest_news_df


def extract_market_data(soup):
    """Extracts the main market data table from the soup."""
    print("Extracting market data...")
    market_data = []
    table = soup.find("table", class_="css-1q67esn")
    if not table:
        print("Market data table not found.")
        return pd.DataFrame()

    table_body = table.find("tbody")
    if not table_body:
        print("Market data table body not found.")
        return pd.DataFrame()

    rows = table_body.find_all("tr")
    for row in rows:
        cells = row.find_all("td")
        if len(cells) == 5:
            name = cells[1].text.strip()
            price = cells[2].text.strip()
            change = cells[3].text.strip()
            percent_change = cells[4].text.strip()
            market_data.append({"Name": name, "Price": price, "Change": change, "% Change": percent_change})

    return pd.DataFrame(market_data)


def extract_headlines(soup):
    """Extracts the top headlines from the soup."""
    print("Extracting top headlines...")
    headline_data = []
    # This selector targets the main curated content area for top headlines
    main_content = soup.find("div", id="primary-curated-content")
    if not main_content:
        print("Main headline content area not found.")
        return pd.DataFrame()

    headlines = main_content.select("a[href*='/story/']")
    for headline in headlines:
        title = headline.text.strip()
        link = headline["href"]
        if not link.startswith("http"):
            link = "https://www.marketwatch.com" + link
        if title and link:
            headline_data.append({"Headline": title, "Link": link})

    return pd.DataFrame(headline_data).drop_duplicates()


def extract_latest_news(soup):
    """Extracts the latest news ticker from the soup."""
    print("Extracting latest news...")
    latest_news_data = []
    # This selector targets the "Latest News" ticker section
    news_div = soup.find("div", id="marketoverview-news")
    if not news_div:
        print("Latest news ticker not found.")
        return pd.DataFrame()

    news_items = news_div.find_all("a")
    for item in news_items:
        try:
            time_stamp = item.find("p", class_="css-27mqcr").text.strip()
            title = item.find("p", class_="e1mm921i1").text.strip()
            link = item["href"]
            if not link.startswith("http"):
                link = "https://www.marketwatch.com" + link
            latest_news_data.append({"Time": time_stamp, "Headline": title, "Link": link})
        except AttributeError:
            continue

    return pd.DataFrame(latest_news_data).drop_duplicates()


if __name__ == "__main__":
    market_df, headlines_df, latest_news_df = scrape_marketwatch_data()

    if market_df is not None and not market_df.empty:
        print("\n--- Scraped MarketWatch Market Data ---")
        print(market_df.to_string(index=False))
        print("\n---------------------------------------")
        market_df.to_csv("market_data.csv", index=False)

    if headlines_df is not None and not headlines_df.empty:
        print("\n--- Scraped MarketWatch Top Headlines ---")
        pd.set_option("display.max_colwidth", None)
        print(headlines_df.to_string(index=False, header=True))
        print("\n-----------------------------------------")
        headlines_df.to_csv("headlines_df.csv", index=False)

    if latest_news_df is not None and not latest_news_df.empty:
        print("\n--- Scraped MarketWatch Latest News ---")
        pd.set_option("display.max_colwidth", None)
        print(latest_news_df.to_string(index=False, header=True))
        print("\n---------------------------------------")
        latest_news_df.to_csv("latest_news.csv", index=False)
