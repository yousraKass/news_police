# from apscheduler.schedulers.blocking import BlockingScheduler
# from daily_news import process_daily_news
# from datetime import datetime

# scheduler = BlockingScheduler()

# scheduler.add_job(process_daily_news, 'cron', hour=13, minute=24)

# print(f"[{datetime.now()}] Scheduler started. Will run daily at 08:00")

# scheduler.start()

from apscheduler.schedulers.blocking import BlockingScheduler
from datetime import datetime
from scraper import generate_daily_data  # your scraper function
from daily_news import process_daily_news  # your RAG indexing function

def daily_job():
    print(f"[{datetime.now()}] Starting daily job...")

    # Step 1: Generate daily CSV
    generate_daily_data() 
    print(f"[{datetime.now()}] Daily CSV generated.")

    # Step 2: Process the CSV and index new documents
    process_daily_news()
    print(f"[{datetime.now()}] Daily news processed and indexed.")

# --- Scheduler setup ---
scheduler = BlockingScheduler()
scheduler.add_job(daily_job, 'cron', hour=21, minute=32)  # adjust time as needed

print(f"[{datetime.now()}] Scheduler started. Will run daily at 21:29")
scheduler.start()