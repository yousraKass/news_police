# News Police 

A comprehensive fake news detection system for Algerian Dialect (Darja) news articles, leveraging NLP, machine learning, and RAG (Retrieval-Augmented Generation) technology.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Components](#components)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## Overview

News Police is an end-to-end fake news detection system designed specifically for Algerian Dialect content. The system combines multiple AI techniques including:

- **Fine-tuned DziriBERT classifier** for fake news detection
- **RAG system** for fact-checking and verification
- **Web scraping** for data collection from Algerian news sources
- **Interactive web interface** for real-time news analysis
- **Database backend** for storing and querying news articles

## Features

- **AI-Powered Classification**: Fine-tuned transformer model (DziriBERT) for Algerian dialect
- **RAG-Based Verification**: Retrieval-Augmented Generation for fact-checking
- **News Scraping**: Automated collection from Ennahar and other sources
- **Analytics Dashboard**: Visualize fake news trends and statistics
- **Modern Web UI**: React-based interface with real-time analysis
- **Supabase Integration**: Cloud database for scalable data storage
- **Automated Scheduling**: Daily news collection and indexing

## Project Structure

```
news_police/
├── CLASSIFIER/              # Fake news classification model
│   ├── classifier.ipynb     # Training notebook
│   ├── inference.py         # Inference script
│   ├── requirements.txt     # Python dependencies
│   └── model/              # Trained model files
│
├── RAG/                    # Retrieval-Augmented Generation system
│   ├── server.py           # FastAPI server
│   ├── generate.py         # Text generation
│   ├── decision.py         # Decision logic
│   ├── RAG_utils/          # RAG utilities
│   ├── routers/            # API endpoints
│   └── daily_data/         # Daily news data
│
├── Data_collection/        # Web scraping scripts
│   ├── EnnaharScraper.py   # Ennahar news scraper
│   └── twitter.ipynb       # Twitter data collection
│
├── Data_processing/        # Data preprocessing
│   ├── categorize_api.py   # API-based categorization
│   ├── elkhabar_data_preprocessing.ipynb
│   └── translation_to_algerian_dialect.py
│
├── DB/                     # Database API
│   ├── server.js           # Express server
│   ├── routers/            # API routes
│   └── config/             # Database configuration
│
├── website-ui/             # Frontend application
│   └── frontend/
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── styles/         # CSS styles
│
├── EDA/                    # Exploratory Data Analysis
│   └── fake_news_analysis_notebook.ipynb
│
└── Dataset/                # Training and testing data
    └── data.csv
```

## Technology Stack

### Machine Learning & NLP
- **PyTorch** - Deep learning framework
- **Transformers (Hugging Face)** - DziriBERT model
- **LangChain** - RAG implementation
- **Sentence Transformers** - Embeddings
- **ChromaDB/Pinecone** - Vector databases

### Backend
- **FastAPI** - RAG API server (Python)
- **Express.js** - Database API server (Node.js)
- **Supabase** - Cloud database
- **APScheduler** - Task scheduling

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **Recharts** - Data visualization

### Data Collection
- **Selenium** - Web scraping
- **BeautifulSoup** - HTML parsing
- **Pandas** - Data manipulation

## Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Chrome/Chromium (for web scraping)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd news_police
```

### 2. Set Up the Classifier

```bash
cd CLASSIFIER
pip install -r requirements.txt
```

### 3. Set Up the RAG System

```bash
cd ../RAG
pip install -r requirements.txt
```

Create a `.env` file in the project root:
```env
GOOGLE_API_KEY=your_google_api_key
PINECONE_API_KEY=your_pinecone_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### 4. Set Up the Database API

```bash
cd ../DB
npm install
```

### 5. Set Up the Frontend

```bash
cd ../website-ui/frontend
npm install
```

## Usage

### Running the Classifier

#### Single Text Classification
```bash
cd CLASSIFIER
python inference.py --text "نص الخبر بالدارجة الجزائرية"
```

#### Batch Classification
```bash
python inference.py --csv input.csv --output predictions.csv
```

#### Interactive Mode
```bash
python inference.py --interactive
```

### Running the RAG Server

```bash
cd RAG
python server.py
```

The RAG API will be available at `http://localhost:8001`

### Running the Database API

```bash
cd DB
npm start
```

The Database API will be available at `http://localhost:5001`

### Running the Frontend

```bash
cd website-ui/frontend
npm run dev
```

The web application will be available at `http://localhost:5173`

### Web Scraping

```bash
cd Data_collection
python EnnaharScraper.py
```

Edit the configuration variables in the script:
- `category`: News category (sport, national, economy, culture, etc.)
- `start_date_str`: Start date (YYYY-MM-DD)
- `end_date_str`: End date (YYYY-MM-DD)

## Components

### 1. Classifier

Fine-tuned **DziriBERT** model for fake news detection with 4 classes:
- **Not_fake**: Real/Legitimate News
- **fake**: Fake News
- **satire**: Satirical Content
- **not_news**: Not News Content

### 2. RAG System

Retrieval-Augmented Generation for fact-checking:
- **Indexing**: Daily news articles indexed in vector database
- **Retrieval**: Semantic search for relevant context
- **Generation**: AI-powered analysis and verification
- **Decision**: Automated credibility assessment

### 3. Data Collection

Automated scrapers for:
- Ennahar Online (Arabic/Darja)

### 4. Web Interface

Modern React application with:
- **Home**: Landing page
- **Detection**: Real-time news analysis
- **Dashboard**: Analytics and statistics
- **History**: Previous analyses
- **Visualization**: Trends and insights
- **About**: Project information

### 5. Database Layer

Express.js API for:
- Storing news articles
- Querying historical data
- Managing classifications
- Supabase integration

## API Documentation

### RAG API Endpoints

**Base URL**: `http://localhost:8001`

#### Health Check
```http
GET /
```

#### Ask Question
```http
POST /ai/ask
Content-Type: application/json

{
  "question": "Your question here"
}
```

#### Retrieve Context
```http
POST /ai/retrieve
Content-Type: application/json

{
  "query": "Search query"
}
```

#### Analyze News
```http
POST /ai/analyze
Content-Type: application/json

{
  "text": "News article text"
}
```

#### Generate Response
```http
POST /ai/generate
Content-Type: application/json

{
  "prompt": "Generation prompt"
}
```

### Database API Endpoints

**Base URL**: `http://localhost:5001`

#### Health Check
```http
GET /
```

#### Data Routes
```http
GET /data
POST /data
```

#### Query Routes
```http
GET /query_data
POST /query_data
```


## Configuration

### Classifier Configuration
- Model: DziriBERT (fine-tuned)
- Max sequence length: 256 tokens
- Device: Auto-detect (CUDA/CPU)

### RAG Configuration
- Embedding model: Sentence Transformers
- Vector DB: ChromaDB/Pinecone
- LLM: Google Gemini
- Chunk size: Configurable

### Scraper Configuration
- Browser: Chrome (headless)
- Rate limiting: Configurable delays
- Output format: CSV
