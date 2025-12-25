import csv, os, time, random, requests
from datetime import datetime, timedelta, timezone
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from requests.exceptions import RequestException


# -----------------------------
#  SAFE REQUESTS WITH RETRIES
# -----------------------------
def safe_request(url, retries=4, sleep=2):
    for attempt in range(1, retries + 1):
        try:
            return requests.get(url, timeout=10)
        except RequestException:
            print(f"[requests] Error loading {url}, retry {attempt}/{retries}")
            time.sleep(sleep * attempt)
    return None


# -----------------------------
# SAFE SELENIUM PAGE LOADING
# -----------------------------
def safe_selenium_get(driver, url, retries=4):
    for attempt in range(1, retries + 1):
        try:
            driver.get(url)
            return True
        except Exception as e:
            print(f"[selenium] Error loading {url}: {e} (retry {attempt}/{retries})")
            time.sleep(2 * attempt)
    return False


# -----------------------------
# MAIN SCRAPER
# -----------------------------
def generate_daily_data():

    print("🚀 Starting daily scraper with safe settings...")

    # Categories to scrape
    categories = ["culture", "sport", "national", "algeria", "world"]
    base_url_template = "https://www.ennaharonline.com/{category}/"

    # Correct CSV location inside RAG/daily_data/
    scraper_dir = os.path.dirname(os.path.abspath(__file__))
    rag_dir = os.path.join(scraper_dir, "..")
    csv_dir = os.path.join(rag_dir, "daily_data")
    os.makedirs(csv_dir, exist_ok=True)
    csv_path = os.path.join(csv_dir, "daily_data.csv")

    # -----------------------------
    # Chrome settings
    # -----------------------------
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--window-size=1920,1080")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )

    # -----------------------------
    # CSV
    # -----------------------------
    file_exists = os.path.exists(csv_path)
    csv_file = open(csv_path, "a", newline="", encoding="utf-8")
    fieldnames = ["category", "author", "date", "source", "title", "content", "label"]
    writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

    if not file_exists:
        writer.writeheader()

    # -----------------------------
    # 24 HOUR WINDOW
    # -----------------------------
    end_time = datetime.now(timezone.utc)
    start_time = end_time - timedelta(days=1)

    total_articles = 0

    # -----------------------------
    # SCRAPING LOOP
    # -----------------------------
    for category in categories:
        page = 1

        while True:
            url = base_url_template.format(category=category) + f"page/{page}/"
            print(f"\nVisiting {category} page {page}: {url}")

            if not safe_selenium_get(driver, url):
                print("❌ Could not load page. Moving on.")
                break

            time.sleep(random.uniform(1.5, 3.0))

            soup = BeautifulSoup(driver.page_source, "html.parser")
            articles = soup.find_all("h2", class_="card__title")

            if not articles:
                print(f"No articles found on page {page}. Next category.")
                break

            # Check newest article on page
            first_link = articles[0].find("a")["href"]
            resp = safe_request(first_link)
            if not resp:
                print("Could not read first article. Skipping page.")
                break

            art_soup = BeautifulSoup(resp.text, "html.parser")
            time_tag = art_soup.find("time")
            first_date_str = time_tag.get("datetime") if time_tag else None

            if not first_date_str:
                print("Missing date tag. Skipping page.")
                break

            first_date = datetime.fromisoformat(first_date_str.replace("Z", "+00:00")).astimezone(timezone.utc)

            # Stop category if too old
            if first_date < start_time:
                print("First article older than 24h → stop this category.")
                break

            # -----------------------------
            # PROCESS ALL ARTICLES
            # -----------------------------
            collected_page_articles = []

            for h2 in articles:
                a_tag = h2.find("a")
                if not a_tag:
                    continue

                link = a_tag["href"]
                title = a_tag.get_text(strip=True)

                resp = safe_request(link)
                if not resp:
                    print(f"❌ Failed to load article {link}")
                    continue

                art_soup = BeautifulSoup(resp.text, "html.parser")

                # Extract metadata
                author_tag = art_soup.find("div", class_="sgb1__aath")
                author = author_tag.get_text(strip=True).replace("بقلم", "").strip() if author_tag else "N/A"

                time_tag = art_soup.find("time")
                if not time_tag:
                    continue

                date_str = time_tag.get("datetime")
                article_date = datetime.fromisoformat(date_str.replace("Z", "+00:00")).astimezone(timezone.utc)

                # Only keep articles in 24h window
                if not (start_time <= article_date < end_time):
                    continue

                content_div = art_soup.find("div", class_="artx")
                content = " ".join(p.get_text(strip=True) for p in content_div.find_all("p")) if content_div else "N/A"

                collected_page_articles.append({
                    "category": category,
                    "author": author,
                    "date": article_date.strftime("%Y-%m-%d %H:%M:%S"),
                    "source": link,
                    "title": title,
                    "content": content,
                    "label": "1"
                })

                print(f"   ✔ {title[:60]}...")

                time.sleep(random.uniform(0.6, 1.4))

            # Save results
            if collected_page_articles:
                writer.writerows(collected_page_articles)
                csv_file.flush()
                total_articles += len(collected_page_articles)
                print(f"💾 Saved {len(collected_page_articles)} from {category} page {page}")

            page += 1
            time.sleep(random.uniform(1.0, 2.0))

    driver.quit()
    csv_file.close()

    print(f"\n🎉 DONE! Total articles collected: {total_articles}\n")


if __name__ == "__main__":
    generate_daily_data()