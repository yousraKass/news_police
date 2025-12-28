"""
Script to translate news content from Arabic to Algerian dialect using OpenRouter API with Gemini.
Processes CSV file with batch processing and progress tracking.
Uses LangChain for better abstraction and error handling.

OPTIMIZED VERSION: Translates multiple rows in a single API call to save credits.
Sends N rows at once and parses the response to extract individual translations.
"""

import os
import pandas as pd
import json
import time
import re
from typing import List, Dict, Optional
from pathlib import Path
import logging

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class AlgerianDialectTranslator:
    """Translator class using LangChain with OpenRouter API and Gemini model."""
    
    def __init__(self, api_key: str, model: str = "google/gemini-2.5-flash"):
        """
        Initialize the translator with LangChain.
        
        Args:
            api_key: OpenRouter API key
            model: Model to use (default: gemini-2.0-flash-exp:free)
        """
        self.api_key = api_key
        self.model = model
        
        # Initialize LangChain ChatOpenAI with OpenRouter
        self.llm = ChatOpenAI(
            model=model,
            openai_api_key=api_key,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.3,
            max_tokens=4000,
            default_headers={
                "HTTP-Referer": "http://localhost",
                "X-Title": "Algerian Dialect Translator"
            }
        )
        
        # Create prompt template for batch translation
        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", "You are an expert translator specializing in translating Modern Standard Arabic to Algerian dialect (الدارجة الجزائرية). Maintain the meaning and context while using natural Algerian expressions and vocabulary."),
            ("user", """Translate the following Modern Standard Arabic news articles into Algerian dialect (الدارجة الجزائرية).
Keep the meaning and context intact, but use natural Algerian dialect expressions and vocabulary.

I will provide multiple texts numbered from 1 to N. Please translate each one and return them in the EXACT same format:
[1] <translation of text 1>
[2] <translation of text 2>
...and so on.

IMPORTANT: Return ONLY the numbered translations, nothing else. Each translation on its own line starting with [number].

{texts}

Translated to Algerian dialect:""")
        ])
        
        # Create the translation chain
        self.translation_chain = (
            self.prompt_template 
            | self.llm 
            | StrOutputParser()
        )
        
    def translate_text(self, text: str, retry_count: int = 3) -> Optional[str]:
        """
        Translate text to Algerian dialect using LangChain.
        
        Args:
            text: Text to translate
            retry_count: Number of retries on failure
            
        Returns:
            Translated text or None on failure
        """
        if not text or pd.isna(text):
            return text
        
        for attempt in range(retry_count):
            try:
                # Use LangChain to invoke the translation
                translated = self.translation_chain.invoke({"text": text})
                logger.info(f"Successfully translated text (length: {len(text)} chars)")
                return translated.strip()
                
            except Exception as e:
                error_msg = str(e).lower()
                
                # Handle rate limiting
                if "429" in error_msg or "rate limit" in error_msg:
                    wait_time = (attempt + 1) * 10
                    logger.warning(f"Rate limit hit. Waiting {wait_time} seconds...")
                    time.sleep(wait_time)
                    
                # Handle timeout
                elif "timeout" in error_msg:
                    logger.warning(f"Timeout on attempt {attempt + 1}")
                    if attempt < retry_count - 1:
                        time.sleep(2 ** attempt)
                        
                # Handle other errors
                else:
                    logger.error(f"Error translating text (attempt {attempt + 1}): {e}")
                    if attempt < retry_count - 1:
                        time.sleep(2 ** attempt)
        
        logger.error(f"Failed to translate text after {retry_count} attempts")
        return None
    
    def translate_batch(self, texts: List[str], delay: float = 1.0) -> List[Optional[str]]:
        """
        Translate a batch of texts in a single API call.
        
        Args:
            texts: List of texts to translate
            delay: Delay in seconds between API calls (not used in batch mode but kept for compatibility)
            
        Returns:
            List of translated texts
        """
        if not texts:
            return []
        
        # Filter out empty/None texts but remember their positions
        valid_indices = []
        valid_texts = []
        for i, text in enumerate(texts):
            if text and not pd.isna(text):
                valid_indices.append(i)
                valid_texts.append(text)
        
        # If no valid texts, return original list
        if not valid_texts:
            return texts
        
        # Format texts for batch translation
        formatted_texts = "\n\n".join([f"[{i+1}] {text}" for i, text in enumerate(valid_texts)])
        
        logger.info(f"Translating {len(valid_texts)} texts in a single request")
        
        # Translate all texts in one call
        retry_count = 3
        for attempt in range(retry_count):
            try:
                response = self.translation_chain.invoke({"texts": formatted_texts})
                logger.info(f"Successfully received batch translation response")
                
                # Parse the response to extract individual translations
                translations = self._parse_batch_response(response, len(valid_texts))
                
                # Reconstruct the full results list with None for invalid entries
                results = [None] * len(texts)
                for i, valid_idx in enumerate(valid_indices):
                    if i < len(translations):
                        results[valid_idx] = translations[i]
                    else:
                        logger.warning(f"Missing translation for text {i+1}")
                        results[valid_idx] = valid_texts[i]  # Fallback to original
                
                return results
                
            except Exception as e:
                error_msg = str(e).lower()
                
                # Handle rate limiting
                if "429" in error_msg or "rate limit" in error_msg:
                    wait_time = (attempt + 1) * 10
                    logger.warning(f"Rate limit hit. Waiting {wait_time} seconds...")
                    time.sleep(wait_time)
                    
                # Handle timeout
                elif "timeout" in error_msg:
                    logger.warning(f"Timeout on attempt {attempt + 1}")
                    if attempt < retry_count - 1:
                        time.sleep(2 ** attempt)
                        
                # Handle other errors
                else:
                    logger.error(f"Error in batch translation (attempt {attempt + 1}): {e}")
                    if attempt < retry_count - 1:
                        time.sleep(2 ** attempt)
        
        logger.error(f"Failed to translate batch after {retry_count} attempts")
        # Return original texts as fallback
        return texts
    
    def _parse_batch_response(self, response: str, expected_count: int) -> List[str]:
        """
        Parse the batch translation response to extract individual translations.
        
        Args:
            response: The raw response from the API
            expected_count: Expected number of translations
            
        Returns:
            List of individual translations
        """
        translations = []
        
        # Split by numbered markers [1], [2], etc.
        # Pattern matches [number] followed by text until next [number] or end
        pattern = r'\[(\d+)\]\s*(.+?)(?=\[\d+\]|$)'
        matches = re.findall(pattern, response, re.DOTALL)
        
        # Sort by number to ensure correct order
        matches.sort(key=lambda x: int(x[0]))
        
        for num, text in matches:
            translations.append(text.strip())
        
        # Validate we got the expected number of translations
        if len(translations) != expected_count:
            logger.warning(f"Expected {expected_count} translations but got {len(translations)}")
            logger.debug(f"Response: {response[:500]}...")  # Log first 500 chars for debugging
        
        return translations


class TranslationProgress:
    """Manages translation progress tracking."""
    
    def __init__(self, progress_file: str = "translation_progress.json"):
        self.progress_file = progress_file
        self.progress = self.load_progress()
    
    def load_progress(self) -> Dict:
        """Load progress from file."""
        if os.path.exists(self.progress_file):
            with open(self.progress_file, 'r') as f:
                return json.load(f)
        return {"last_index": -1, "translated_count": 0}
    
    def save_progress(self, last_index: int, translated_count: int):
        """Save progress to file."""
        self.progress = {
            "last_index": last_index,
            "translated_count": translated_count,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        with open(self.progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2)
        logger.info(f"Progress saved: {translated_count} translations completed")
    
    def get_last_index(self) -> int:
        """Get the last processed index."""
        return self.progress.get("last_index", -1)


def main():
    """Main translation workflow."""
    
    # Configuration
    INPUT_FILE = "/home/yousra/2cs/S1/NLP/project/code/data_collection/hakim_data/youtube_preprocessed.csv"
    OUTPUT_FILE = "final.csv"
    BATCH_SIZE = 10  # Process 10 rows at a time in a single API call (optimized for credits)
    DELAY_BETWEEN_REQUESTS = 3.0  # Seconds between API calls
    
    # Get API key from environment variable 
    api_key = os.getenv("OPENROUTER_API_KEY", "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")
    if not api_key:
        logger.error("OPENROUTER_API_KEY environment variable not set!")
        logger.info("Please set it with: export OPENROUTER_API_KEY='your-api-key'")
        return
    
    # Initialize translator and progress tracker
    translator = AlgerianDialectTranslator(api_key)
    progress_tracker = TranslationProgress()
    
    # Load CSV file - use checkpoint if exists, otherwise use original
    if os.path.exists(OUTPUT_FILE) and progress_tracker.get_last_index() >= 0:
        logger.info(f"Resuming from checkpoint file: {OUTPUT_FILE}")
        try:
            df = pd.read_csv(OUTPUT_FILE)
            logger.info(f"Loaded {len(df)} rows from checkpoint")
        except Exception as e:
            logger.error(f"Failed to load checkpoint CSV: {e}")
            logger.info(f"Falling back to original file: {INPUT_FILE}")
            df = pd.read_csv(INPUT_FILE)
    else:
        logger.info(f"Loading CSV file: {INPUT_FILE}")
        try:
            df = pd.read_csv(INPUT_FILE)
            logger.info(f"Loaded {len(df)} rows")
        except Exception as e:
            logger.error(f"Failed to load CSV: {e}")
            return
    
    # Check if content column exists
    if 'text' not in df.columns:
        logger.error("'text' column not found in CSV!")
        return
    
    # Create algerian_content column if it doesn't exist
    if 'algerian_text' not in df.columns:
        df['algerian_text'] = None
    
    # Resume from last checkpoint
    start_index = progress_tracker.get_last_index() + 1
    logger.info(f"Starting from index {start_index} (Total rows: {len(df)})")
    
    # Process in batches
    total_rows = len(df)
    
    try:
        for i in range(start_index, total_rows, BATCH_SIZE):
            batch_end = min(i + BATCH_SIZE, total_rows)
            batch_texts = df.loc[i:batch_end-1, 'text'].tolist()
            
            logger.info(f"\n{'='*60}")
            logger.info(f"Processing batch: rows {i} to {batch_end-1} ({batch_end}/{total_rows})")
            logger.info(f"Batch size: {len(batch_texts)} texts in ONE API call")
            logger.info(f"{'='*60}")
            
            # Translate batch in a single API call
            translations = translator.translate_batch(batch_texts, delay=DELAY_BETWEEN_REQUESTS)
            
            # Update dataframe
            for j, translation in enumerate(translations):
                row_idx = i + j
                if translation:
                    df.at[row_idx, 'algerian_text'] = translation
                else:
                    logger.warning(f"Failed to translate row {row_idx}")
                    df.at[row_idx, 'algerian_text'] = df.at[row_idx, 'text']  # Keep original
            
            # Save progress after each batch
            progress_tracker.save_progress(batch_end - 1, batch_end)
            
            # Save checkpoint CSV
            df.to_csv(OUTPUT_FILE, index=False)
            logger.info(f"Checkpoint saved to {OUTPUT_FILE}")
            
            # Progress percentage
            progress_pct = (batch_end / total_rows) * 100
            logger.info(f"Overall progress: {progress_pct:.1f}%")
            
    except KeyboardInterrupt:
        logger.info("\n\nInterrupted by user. Progress has been saved.")
        logger.info(f"Resume by running the script again.")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
    finally:
        # Final save
        df.to_csv(OUTPUT_FILE, index=False)
        logger.info(f"\nFinal output saved to {OUTPUT_FILE}")
        logger.info(f"Translation completed!")


if __name__ == "__main__":
    main()
