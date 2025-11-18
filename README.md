# News Police - Algerian Dialect Fake News Detection Pipeline

An intelligent NLP pipeline for detecting fake news in Algerian Arabic dialect (Darja) using LangChain and LangGraph. This system handles code-switching, dialect translation, and automated content labeling with optional fact-checking capabilities.

## 🚀 Features

- **Code-Switching Detection & Resolution**: Automatically detects and handles mixed languages (Arabic, French, English)
- **Dialect Translation**: Converts text to natural Algerian Arabic dialect (Darja)
- **Automated Content Labeling**: Classifies content into four categories: fake, not fake, satire, others
- **Web Search Integration**: Optional fact-checking using DuckDuckGo search
- **State Machine Pipeline**: Built with LangGraph for robust workflow management
- **Batch Processing**: Efficient processing with checkpointing and error recovery

## 📋 Content Categories

The system classifies content into four distinct categories:

1. **fake**: Intentionally false, misleading, or fabricated content
2. **not fake**: Legitimate, factual content from credible sources
3. **satire**: Humorous or satirical content using exaggeration or irony
4. **others**: Opinion pieces, promotional content, or unclear content

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd news_police
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

## ⚙️ Configuration

The system uses OpenRouter as a proxy for OpenAI API calls. Update your `.env` file:

```bash
OPENAI_API_KEY=your-openai-api-key-here
```

### Key Configuration Options

Edit `config.py` to customize:

- **Temperature Settings**: Control randomness for different tasks
- **Search Settings**: Enable/disable web search fact-checking
- **Batch Processing**: Adjust batch size and retry settings
- **Output Directories**: Configure where processed data is saved

## 🏗️ Architecture

### Core Components

1. **LangChainCodeSwitchingHandler**: Detects and resolves language mixing
2. **LangChainDialectTranslator**: Converts text to Algerian dialect
3. **LangChainAutoLabeler**: Classifies content with optional fact-checking
4. **LangGraphPipeline**: Orchestrates the entire processing workflow

### Data Flow

```
Input Text → Code-Switching Detection → Dialect Translation → Content Labeling → Output
```

Each step is optional and configurable based on the input data characteristics.

## 📊 Data Format

### Input CSV Requirements

Your CSV file must contain these columns:
- `category`: Content category
- `author`: Author name
- `date`: Publication date
- `source`: Content source
- `content`: Main text content

Optional columns:
- `title`: Article title
- `label`: Existing label (if available)

### Output Format

The pipeline generates processed CSV files with additional columns:
- `final_label`: Assigned label (fake/not fake/satire/others)
- `label_confidence`: Confidence score (0.0-1.0)
- `label_reasoning`: Explanation for the classification
- Processing metadata and statistics

## 🚀 Usage

### Basic Usage

```python
from pipeline_langgraph import LangGraphPipeline

# Initialize pipeline
pipeline = LangGraphPipeline()

# Process a CSV file
pipeline.process_csv("input_data.csv", "output_data.csv")
```

### Advanced Usage

```python
from langchain_handlers import LangChainAutoLabeler

# Initialize with search enabled
labeler = LangChainAutoLabeler(enable_search=True)

# Label content with fact-checking
result = labeler.label_content(
    content="Your content here",
    title="Optional title",
    source="Optional source",
    date="2025-01-01"  # Optional publication date
)

print(f"Label: {result.label}")
print(f"Confidence: {result.confidence}")
print(f"Reasoning: {result.reasoning}")
```

### Testing Individual Components

```python
# Test code-switching detection
python test_langchain.py

# Test search-enabled labeling
python test_search_labeling.py
```

## 🧪 Testing

The project includes comprehensive test scripts:

- `test_langchain.py`: Tests all core handlers with sample Arabic text
- `test_search_labeling.py`: Tests search-enabled labeling functionality

Test results are saved to `test_results.txt` for proper Arabic text display.

## 📁 Project Structure

```
news_police/
├── config.py                 # Configuration settings
├── schemas.py                # Pydantic data models
├── langchain_handlers.py     # Core processing handlers
├── pipeline_langgraph.py     # Main pipeline orchestrator
├── test_langchain.py         # Handler testing script
├── test_search_labeling.py   # Search functionality tests
├── requirements.txt          # Python dependencies
├── .env.example             # Environment variables template
└── README.md                # This file
```

## 🔧 Dependencies

### Core Dependencies
- **LangChain & LangGraph**: Pipeline orchestration and LLM integration
- **OpenAI API**: Language model access via OpenRouter
- **Pydantic**: Structured data validation
- **Pandas & NumPy**: Data processing

### Optional Dependencies
- **duckduckgo-search**: Web search for fact-checking
- **python-dotenv**: Environment variable management

## 🎯 Use Cases

- **Media Organizations**: Automated content verification
- **Research**: Fake news detection in Arabic dialects
- **Content Moderation**: Social media platform integration
- **Educational**: Training datasets for NLP research

## 🌍 Language Support

Primarily designed for **Algerian Arabic dialect (Darja)** with support for:
- Code-switching with French and English
- Translation from Modern Standard Arabic (MSA)
- Recognition of other Arabic dialects

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

[Add your license information here]

## 🐛 Known Issues

- Search functionality requires stable internet connection
- API rate limits may affect batch processing speed
- Large datasets may require chunked processing

## 📞 Support

For questions, issues, or contributions, please [create an issue](link-to-issues) or contact the development team.

---

**Note**: This project is designed for academic and research purposes. Ensure you have proper API keys and follow rate limiting guidelines when processing large datasets.