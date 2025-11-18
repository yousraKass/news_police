# check line 186 in the csv, everything after it was not procecessed 
import logging
from typing import Tuple, Optional, List, Dict
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import Literal

from config import (
    OPENAI_API_KEY, OPENAI_MODEL, 
    TEMPERATURE_CODE_SWITCHING,
    MAX_SEARCH_RESULTS
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_llm(temperature: float) -> ChatOpenAI:
    """Create a ChatOpenAI instance with consistent configuration"""
    from config import OPENAI_BASE_URL
    
    return ChatOpenAI(
        model=OPENAI_MODEL,
        temperature=temperature,
        api_key=OPENAI_API_KEY,
        base_url=OPENAI_BASE_URL,
        max_tokens=2000  # Reduced from default 16384 to save tokens
    )


class ProcessingResult(BaseModel):
    
    # Simplified schema to reduce token usage
    processed_text: str = Field(description="Processed text in Algerian dialect")
    
    code_switching_action: Literal["no_action", "translated", "kept_original"] = Field(
        description="Code-switching handling"
    )
    dialect_action: Literal["no_action", "translated", "already_algerian"] = Field(
        description="Dialect conversion"
    )
    
    label: Literal["fake", "not fake", "satire", "others"] = Field(description="Classification")
    label_confidence: float = Field(ge=0.0, le=1.0, description="Confidence score")
    label_reasoning: str = Field(description="Brief reasoning")
    
    # Optional fields (kept for compatibility but not required in output)
    has_code_switching: bool = Field(default=False, description="Code-switching detected")
    languages_detected: List[str] = Field(default_factory=lambda: ["arabic"], description="Languages")
    is_algerian_dialect: bool = Field(default=True, description="Is Algerian")
    detected_dialect: Literal["algerian", "msa", "egyptian", "levantine", "moroccan", "tunisian", "other"] = Field(
        default="algerian", description="Detected dialect"
    )
    key_indicators: List[str] = Field(default_factory=list, description="Classification indicators")


class OptimizedHandler:
    """
    Optimized handler that processes all steps in a single API call
    """
    
    def __init__(self):
        self.llm = create_llm(TEMPERATURE_CODE_SWITCHING)
        self.parser = JsonOutputParser(pydantic_object=ProcessingResult)
        
        # Ultra-concise prompt to minimize tokens
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """Algerian dialect expert. Tasks:
1. Fix code-switching → Algerian Arabic dialect
2. Convert to Algerian dialect (راني، نتاع، بصح، واش)
3. Label: fake/not fake/satire/others"""),
            ("user", """Text: {content}
{context}
{format_instructions}""")
        ])
        
        # Create the chain
        self.chain = self.prompt | self.llm | self.parser
    
    def process_content(
        self,
        content: str,
        title: Optional[str] = None,
        category: Optional[str] = None,
        source: Optional[str] = None,
        author: Optional[str] = None,
        date: Optional[str] = None
    ) -> ProcessingResult:
        """
        Process content through all pipeline steps in a single API call
        
        Args:
            content: Main text content
            title: Optional title
            category: Optional category
            source: Optional source
            author: Optional author name
            date: Optional publication date
            
        Returns:
            ProcessingResult with all processing results
        """
        # Build minimal context (only essential fields)
        context_parts = []
        if title:
            context_parts.append(f"Title: {title}")
        if source:
            context_parts.append(f"Source: {source}")
        
        context = " | ".join(context_parts) if context_parts else ""
        
        try:
            result = self.chain.invoke({
                "content": content,
                "context": context,
                "format_instructions": self.parser.get_format_instructions()
            })
            
            return ProcessingResult(**result)
            
        except Exception as e:
            logger.error(f"Error in unified processing: {e}")
            # Return defaults on error
            return ProcessingResult(
                has_code_switching=False,
                languages_detected=["arabic"],
                is_algerian_dialect=True,
                detected_dialect="other",
                processed_text=content,
                code_switching_action="no_action",
                dialect_action="no_action",
                label="others",
                label_confidence=0.0,
                label_reasoning=f"Error during processing: {str(e)}",
                key_indicators=[]
            )

class BatchProcessingResult(BaseModel):
    """Schema for batch processing results"""
    results: List[ProcessingResult] = Field(description="Processing results for each instance")
    batch_size: int = Field(description="Number of instances processed")

class OptimizedBatchHandler:
    """
    Handler that processes multiple data instances in a single API call
    
    Further optimization: Process N instances in 1 call instead of N calls
    """
    
    def __init__(self, max_batch_size: int = 5):
        """
        Initialize batch handler
        
        Args:
            max_batch_size: Maximum number of instances to process in one API call
                           Recommended: 3-5 for best balance of speed and reliability
        """
        self.llm = create_llm(TEMPERATURE_CODE_SWITCHING)
        self.max_batch_size = max_batch_size
        self.parser = JsonOutputParser(pydantic_object=BatchProcessingResult)
        
        # Minimal batch prompt
        self.batch_prompt = ChatPromptTemplate.from_messages([
            ("system", """Algerian dialect expert. For EACH instance:
1. Fix code-switching → Algerian
2. Convert to Algerian dialect  
3. Label: fake/not fake/satire/others"""),
            ("user", """Process {count} instances:

{instances}

{format_instructions}""")
        ])
        
        self.chain = self.batch_prompt | self.llm | self.parser
    
    def process_batch(
        self,
        contents: List[Dict[str, str]]
    ) -> List[ProcessingResult]:
        """
        Process multiple content instances in a single API call
        
        Args:
            contents: List of dicts with keys: content, title, author, category, source, date
            
        Returns:
            List of UnifiedProcessingResult objects
        """
        if not contents:
            return []
        
        # Format instances minimally
        instances_text = []
        for i, item in enumerate(contents, 1):
            parts = [f"#{i}: {item.get('content', '')}"]
            
            # Minimal metadata (only title and source)
            meta = []
            if item.get('title'):
                meta.append(f"Title: {item['title']}")
            if item.get('source'):
                meta.append(f"Source: {item['source']}")
            
            if meta:
                parts.append(" | ".join(meta))
            
            instances_text.append("\n".join(parts))
        
        instances_str = "\n\n".join(instances_text)
        
        try:
            result = self.chain.invoke({
                "count": len(contents),
                "instances": instances_str,
                "format_instructions": self.parser.get_format_instructions()
            })
            
            batch_result = BatchProcessingResult(**result)
            return batch_result.results
            
        except Exception as e:
            logger.error(f"Error in batch processing: {e}")
            # Return safe defaults for all instances
            return [
                ProcessingResult(
                    has_code_switching=False,
                    languages_detected=["arabic"],
                    is_algerian_dialect=True,
                    detected_dialect="other",
                    processed_text=item.get('content', ''),
                    code_switching_action="no_action",
                    dialect_action="no_action",
                    label="others",
                    label_confidence=0.0,
                    label_reasoning=f"Error during batch processing: {str(e)}",
                    key_indicators=[]
                )
                for item in contents
            ]
            