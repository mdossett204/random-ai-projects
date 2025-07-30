# main_marketwatch.py
# A Python script to scrape headlines from MarketWatch.com.
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


def scrape_marketwatch_headlines():
    """
    This function initializes a stealthy Selenium WebDriver, navigates to the
    MarketWatch homepage, scrapes the main headlines, and
    returns them as a pandas DataFrame.
    """
    # --- 1. Setup Selenium WebDriver ---
    print("Setting up the Chrome WebDriver...")
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    # These options can help avoid detection
    options.add_argument("start-maximized")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
    except Exception as e:
        print(f"Error setting up WebDriver: {e}")
        return None

    # --- Apply Stealth ---
    # This function modifies the browser properties to make it look like a regular user's browser.
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

    # --- 3. Wait for the Headlines to Load ---
    # We will wait for a headline link to be present. A reliable way is to look for
    # an 'a' tag with an href that contains '/story/'.
    print("Waiting for headlines to load...")
    try:
        wait = WebDriverWait(driver, 30)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a[href*='/story/']")))
        print("Headlines found.")
        time.sleep(3)  # A small extra delay for good measure
    except Exception as e:
        print(f"Error waiting for page elements: {e}")
        driver.quit()
        return None

    # --- 4. Get Page Source and Parse with BeautifulSoup ---
    print("Extracting page source and parsing with BeautifulSoup...")
    html_source = driver.page_source
    soup = BeautifulSoup(html_source, "html.parser")

    # --- 5. Find and Extract Data ---
    headline_data = []
    # Find all 'a' tags where the href contains '/story/' as this is a reliable
    # pattern for article links on MarketWatch.
    headlines = soup.select("a[href*='/story/']")
    print(f"Found {len(headlines)} potential headlines. Processing...")

    for headline in headlines:
        try:
            # The text of the headline is usually inside the link or a child element.
            # .text gets all the text, and .strip() cleans up whitespace.
            title = headline.text.strip()
            link = headline["href"]

            # Make sure the link is a full URL
            if not link.startswith("http"):
                link = "https://www.marketwatch.com" + link

            # We only want headlines with meaningful text, not empty links.
            if title and link:
                headline_data.append(
                    {
                        "Headline": title,
                        "Link": link,
                    }
                )
        except (AttributeError, KeyError):
            # Skip any elements that don't have the expected structure.
            continue

    # --- 6. Clean Up ---
    print("Closing the browser.")
    driver.quit()

    # --- 7. Display Data with Pandas ---
    if headline_data:
        df = pd.DataFrame(headline_data)
        # Remove duplicate headlines, keeping the first instance
        df.drop_duplicates(subset=["Headline"], keep="first", inplace=True)
        return df
    else:
        print("No headlines were scraped.")
        return pd.DataFrame()


if __name__ == "__main__":
    # --- How to Run This Script ---
    # 1. Make sure you have Python installed.
    # 2. Open your terminal or command prompt.
    # 3. Install the required libraries by running:
    #    pip install selenium beautifulsoup4 pandas webdriver-manager selenium-stealth
    # 4. Save this code as a Python file (e.g., marketwatch_scraper.py).
    # 5. Run the script from your terminal:
    #    python marketwatch_scraper.py

    scraped_df = scrape_marketwatch_headlines()
    scraped_df.to_csv("market_watch.csv", index=False)
    if scraped_df is not None and not scraped_df.empty:
        print("\n--- Scraped MarketWatch Headlines ---")
        # Set pandas to display the full link without truncating
        pd.set_option("display.max_colwidth", None)
        print(scraped_df.to_string(index=False))
        print("\n-------------------------------------")
