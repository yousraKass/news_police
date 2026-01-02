from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from webdriver_manager.chrome import ChromeDriverManager
import requests, time, csv, os
from datetime import datetime, timezone

# --- Configuration ---
category = "culture"  # choose category (e.g., "sport", "national", "economy")
base_url = f"https://www.ennaharonline.com/{category}/"

# --- Date Range (YYYY-MM-DD) ---
start_date_str = "2025-11-20"   # older date
end_date_str   = "2025-11-21"   # newer date

# --- Convert to timezone-aware datetimes ---
start_date = datetime.strptime(start_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
end_date   = datetime.strptime(end_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)

# --- Setup Chrome ---
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

driver_path = "/Users/afnanekaraoui/.wdm/drivers/chromedriver/mac64/141.0.7390.122/chromedriver-mac-arm64/chromedriver"
driver = webdriver.Chrome(service=Service(driver_path), options=chrome_options)

# --- CSV setup ---
filename = f"ennahar_{category}_{start_date_str}_to_{end_date_str}.csv"
file_exists = os.path.exists(filename)

# Open file once, append mode
csv_file = open(filename, "a", newline="", encoding="utf-8")
fieldnames = ["category", "title", "author", "date", "link", "content"]
writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

# Write header if new file
if not file_exists:
    writer.writeheader()

page = 3
stop_scraping = False
total_articles = 0

print(f"📂 Scraping '{category}' category for articles between {start_date.date()} and {end_date.date()}...\n")

while not stop_scraping:
    url = f"{base_url}page/{page}/"
    print(f"\n🌍 Visiting page {page}: {url}")
    
    driver.get(url)
    time.sleep(3)
    soup = BeautifulSoup(driver.page_source, "html.parser")

    articles = soup.find_all("h2", class_="card__title")
    if not articles:
        print("⚠️ No more articles found, stopping.")
        break

    page_articles = []  # store for this page only

    for h2 in articles:
        a_tag = h2.find("a")
        if not a_tag:
            continue

        link = a_tag["href"]
        title = a_tag.get_text(strip=True)

        try:
            response = requests.get(link, timeout=15)
            html = response.text
            art_soup = BeautifulSoup(html, "html.parser")

            # --- Extract info ---
            category_tag = art_soup.find("a", class_="bunh")
            category_name = category_tag.get_text(strip=True) if category_tag else category

            author_tag = art_soup.find("div", class_="sgb1__aath")
            author = author_tag.get_text(strip=True).replace("بقلم", "").strip() if author_tag else "N/A"

            time_tag = art_soup.find("time")
            date_str = time_tag.get("datetime") if time_tag else None
            if not date_str:
                continue

            # --- Parse & normalize date ---
            article_date = datetime.fromisoformat(date_str.replace("Z", "+00:00")).astimezone(timezone.utc)

            # --- Date range filtering ---
            if article_date < start_date:
                print(f"🛑 Reached articles older than {start_date.date()}, stopping.")
                stop_scraping = True
                break
            elif article_date > end_date:
                print(f"⚠️ Article from {article_date.date()} is newer than {end_date.date()}, skipping.")
                continue

            # --- Extract content ---
            content_div = art_soup.find("div", class_="artx")
            content = " ".join(p.get_text(strip=True) for p in content_div.find_all("p")) if content_div else "N/A"

            # --- Add to current page ---
            page_articles.append({
                "category": category_name,
                "title": title,
                "author": author,
                "date": article_date.strftime("%Y-%m-%d %H:%M:%S"),
                "link": link,
                "content": content
            })

            print(f"✅ Collected ({article_date.date()}): {title[:70]}...")

        except requests.exceptions.Timeout:
            print(f"⚠️ Timeout while fetching {link}, skipping.")
            continue
        except Exception as e:
            print(f"❌ Error fetching {link}: {e}")

    # --- Append page results to CSV ---
    if page_articles:
        writer.writerows(page_articles)
        csv_file.flush()  # make sure data is written to disk immediately
        total_articles += len(page_articles)
        print(f"💾 Saved {len(page_articles)} articles from page {page} (total: {total_articles})")

    if not stop_scraping:
        page += 1
    else:
        break

driver.quit()
csv_file.close()

print(f"\n✅ Done! Saved {total_articles} articles to '{filename}'")