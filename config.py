"""
Configuration file for the Algerian Dialect Fake News Detection Pipeline
"""

import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# OpenAI API Configuration (via OpenRouter)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
OPENAI_MODEL = "openai/chatgpt-4o-latest"
OPENAI_BASE_URL = "https://openrouter.ai/api/v1"  # OpenRouter base URL  

# Label Categories
VALID_LABELS: List[str] = ['fake', 'not fake', 'satire', 'others']

# CSV Column Names
REQUIRED_COLUMNS = ['category', 'author', 'date', 'source', 'content']
OPTIONAL_COLUMNS = ['title', 'label']

# Processing Settings
BATCH_SIZE = 10  # Number of items to process before saving checkpoint
MAX_RETRIES = 3  # Number of retries for API calls
RETRY_DELAY = 2  # Delay between retries in seconds

# Temperature settings for different tasks
TEMPERATURE_CODE_SWITCHING = 0.3  # Lower for more deterministic detection
TEMPERATURE_TRANSLATION = 0.5  # Moderate for natural translation
TEMPERATURE_LABELING = 0.2  # Lower for consistent labeling

# Search Settings
ENABLE_SEARCH = False  # Enable search for fact-checking
MAX_SEARCH_RESULTS = 3  # Maximum number of search results to use

# Output Settings
OUTPUT_DIR = './processed_data'
CHECKPOINT_DIR = './checkpoints'
LOG_FILE = './pipeline.log'

# Create necessary directories
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(CHECKPOINT_DIR, exist_ok=True)
