from apscheduler.schedulers.blocking import BlockingScheduler
from daily_news import process_daily_news
from datetime import datetime

scheduler = BlockingScheduler()

scheduler.add_job(process_daily_news, 'cron', hour=13, minute=24)

print(f"[{datetime.now()}] Scheduler started. Will run daily at 08:00")

scheduler.start()