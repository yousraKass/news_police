import pandas as pd
import google.generativeai as genai
import json
import os
import time
import re

# ===================== CONFIG =====================
GEMINI_API_KEY = "Api_key"
INPUT_CSV = "file.csv"
OUTPUT_CSV = "file.csv"
BATCH_SIZE = 20
TEXT_COLUMN = "text"
# ==================================================

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")


# ---------- SAFE JSON EXTRACT ----------
def extract_json(text):
    match = re.search(r"\[.*\]", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON array found")
    return json.loads(match.group())


# ---------- GEMINI CLASSIFICATION ----------
def process_batch(texts, retries=1):
    prompt = f"""
You are a news classification expert.

STRICT RULES:
- Output JSON ONLY
- NO explanations
- NO markdown
- NO extra text

For EACH text, assign ONE category from:
islam, economie, sport, nation, monde, hightech, culture, sante

Return EXACTLY this format:
[
  {{
    "category": "..."
  }}
]

Texts:
{texts}
"""

    for attempt in range(retries + 1):
        response = model.generate_content(prompt)
        raw = response.text.strip() if response.text else ""

        if not raw:
            print("⚠️ Empty Gemini response")
            time.sleep(2)
            continue

        try:
            return extract_json(raw)

        except Exception:
            print("⚠️ JSON parsing failed")
            print("🔎 RAW RESPONSE ↓↓↓")
            print(raw)
            print("🔎 END RAW RESPONSE ↑↑↑")

            if attempt < retries:
                print("🔁 Retrying...")
                time.sleep(2)
            else:
                raise


# ---------- MAIN PIPELINE ----------
def main():
    df = pd.read_csv(INPUT_CSV)

    # Create output file once
    if not os.path.exists(OUTPUT_CSV):
        df.head(0).assign(category_pred="").to_csv(
            OUTPUT_CSV, index=False, encoding="utf-8"
        )

    total = len(df)

    for start in range(0, total, BATCH_SIZE):
        end = min(start + BATCH_SIZE, total)
        batch = df.iloc[start:end].copy()

        texts = [
            f"{i}. {row[TEXT_COLUMN]}"
            for i, row in batch.iterrows()
        ]

        try:
            results = process_batch(texts)

            if len(results) != len(batch):
                raise ValueError("Result count mismatch")

            batch["category_pred"] = [r["category"] for r in results]

            batch.to_csv(
                OUTPUT_CSV,
                mode="a",
                header=False,
                index=False,
                encoding="utf-8"
            )

            print(f"✅ Saved batch {start} → {end}")
            time.sleep(1)

        except Exception as e:
            print(f"❌ Skipping batch {start}-{end}: {e}")
            continue


if __name__ == "__main__":
    main()