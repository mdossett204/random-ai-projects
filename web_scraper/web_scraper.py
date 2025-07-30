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


def scrape_crypto_data():
    """
    This function initializes a stealthy Selenium WebDriver, navigates to the
    cryptocurrency page on investing.com, scrapes the data, and
    returns it as a pandas DataFrame.
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
    url = "https://www.investing.com/crypto"
    print(f"Navigating to {url}...")
    driver.get(url)

    # --- 3. Wait for the Data Table to Load ---
    # We'll go back to waiting for the specific element, as it's more reliable.
    print("Waiting for the cryptocurrency data table to load...")
    try:
        wait = WebDriverWait(driver, 30)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "tbody tr")))
        print("Data table found.")
        time.sleep(3)  # A small extra delay for good measure
    except Exception as e:
        print(f"Error waiting for page elements: {e}")
        # Let's save the page source on error to see what we got
        with open("error_page.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print("Saved the page source to error_page.html for debugging.")
        driver.quit()
        return None

    # --- 4. Get Page Source and Parse with BeautifulSoup ---
    print("Extracting page source and parsing with BeautifulSoup...")
    html_source = driver.page_source
    soup = BeautifulSoup(html_source, "html.parser")

    # --- 5. Find and Extract Data ---
    crypto_data = []
    table_body = soup.find("tbody")

    if not table_body:
        print("Could not find the table body. The website structure may have changed.")
        driver.quit()
        return None

    rows = table_body.find_all("tr")
    print(f"Found {len(rows)} rows of data. Processing...")

    for row in rows:
        cells = row.find_all("td")
        if len(cells) > 4:
            try:
                name = cells[2].text.strip()
                symbol = cells[3].text.strip()
                price = cells[4].text.strip()

                crypto_data.append({"Name": name, "Symbol": symbol, "Price (USD)": price})
            except (AttributeError, IndexError):
                continue

    # --- 6. Clean Up ---
    print("Closing the browser.")
    driver.quit()

    # --- 7. Display Data with Pandas ---
    if crypto_data:
        df = pd.DataFrame(crypto_data)
        return df
    else:
        print("No data was scraped.")
        return pd.DataFrame()


if __name__ == "__main__":
    # --- How to Run This Script ---
    # 1. Make sure you have Python installed.
    # 2. Open your terminal or command prompt.
    # 3. Install the required libraries by running:
    #    pip install selenium beautifulsoup4 pandas webdriver-manager selenium-stealth
    # 4. Save this code as a Python file (e.g., crypto_scraper.py).
    # 5. Run the script from your terminal:
    #    python crypto_scraper.py

    scraped_df = scrape_crypto_data()
    if scraped_df is not None and not scraped_df.empty:
        print("\n--- Scraped Cryptocurrency Data ---")
        print(scraped_df.to_string())
        print("\n---------------------------------")
