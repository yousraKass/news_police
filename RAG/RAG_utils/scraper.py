# RAG_utils/daily_data_generator.py
import csv, os, time, requests
from datetime import datetime, timedelta, timezone
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
def generate_daily_data():
  
    # --- Config ---
    categories = ["culture", "sport", "national","algeria","world"]
    base_url_template = "https://www.ennaharonline.com/{category}/"
    import os

    # Get folder of the current file (scraper)
    scraper_dir = os.path.dirname(os.path.abspath(__file__))

    # Go up one level to reach the RAG folder
    rag_dir = os.path.join(scraper_dir, "..")  

    # Path to the daily_data folder inside RAG
    csv_dir = os.path.join(rag_dir, "daily_data")
    os.makedirs(csv_dir, exist_ok=True)

    # Final CSV path
    csv_path = os.path.join(csv_dir, "daily_data.csv")

    # --- Chrome setup ---
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    # driver_path = "/Users/afnanekaraoui/.wdm/drivers/chromedriver/mac64/141.0.7390.122/chromedriver-mac-arm64/chromedriver"
    # driver = webdriver.Chrome(service=Service(driver_path), options=chrome_options)
    driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=chrome_options
    )
    # --- CSV setup ---
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)
    file_exists = os.path.exists(csv_path)
    csv_file = open(csv_path, "a", newline="", encoding="utf-8")
    fieldnames = ["category", "author", "date", "source", "title", "content", "label"]
    writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
    if not file_exists:
        writer.writeheader()

    # --- 24-hour window ---
    end_time = datetime.now(timezone.utc)
    start_time = end_time - timedelta(days=1)
    print(f"Scraping articles from {start_time} to {end_time}")

    total_articles = 0

    for category in categories:
        page = 1
        while True:
            url = base_url_template.format(category=category) + f"page/{page}/"
            print(f"\n🌍 Visiting {category} page {page}: {url}")

            driver.get(url)
            time.sleep(2)
            soup = BeautifulSoup(driver.page_source, "html.parser")
            articles = soup.find_all("h2", class_="card__title")

            if not articles:
                print(f"No more articles found on page {page}, moving to next category.")
                break

            # --- Check first article's date to possibly stop early ---
            first_link = articles[0].find("a")["href"]
            response = requests.get(first_link, timeout=10)
            art_soup = BeautifulSoup(response.text, "html.parser")
            time_tag = art_soup.find("time")
            first_date_str = time_tag.get("datetime") if time_tag else None
            if not first_date_str:
                break
            first_date = datetime.fromisoformat(first_date_str.replace("Z", "+00:00")).astimezone(timezone.utc)

            if first_date < start_time:
                print(f"First article on page {page} is older than start_time, stopping category {category}.")
                break

            # --- Scrape all articles on this page within the time window ---
            page_articles = []
            for h2 in articles:
                a_tag = h2.find("a")
                if not a_tag:
                    continue
                link = a_tag["href"]
                title = a_tag.get_text(strip=True)

                try:
                    response = requests.get(link, timeout=10)
                    art_soup = BeautifulSoup(response.text, "html.parser")

                    author_tag = art_soup.find("div", class_="sgb1__aath")
                    author = author_tag.get_text(strip=True).replace("بقلم", "").strip() if author_tag else "N/A"

                    time_tag = art_soup.find("time")
                    date_str = time_tag.get("datetime") if time_tag else None
                    article_date = datetime.fromisoformat(date_str.replace("Z", "+00:00")).astimezone(timezone.utc)

                    # --- Only include articles in the 24-hour window ---
                    if not (start_time <= article_date < end_time):
                        continue

                    content_div = art_soup.find("div", class_="artx")
                    content = " ".join(p.get_text(strip=True) for p in content_div.find_all("p")) if content_div else "N/A"

                    page_articles.append({
                        "category": category,
                        "author": author,
                        "date": article_date.strftime("%Y-%m-%d %H:%M:%S"),
                        "source": link,
                        "title": title,
                        "content": content,
                        "label": "1" # if we take 1 as Real and 0 as Fake 
                    })

                    print(f"Collected ({article_date}): {title[:70]}...")

                except Exception as e:
                    print(f"Error fetching {link}: {e}")
                    continue

            if page_articles:
                writer.writerows(page_articles)
                csv_file.flush()
                total_articles += len(page_articles)
                print(f"Saved {len(page_articles)} articles from {category} page {page}")

            page += 1
            time.sleep(1) #delay 

    driver.quit()
    csv_file.close()
    print(f"\nDone! Total articles collected: {total_articles}")


if __name__ == "__main__":
    generate_daily_data()