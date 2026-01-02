"""
RAG Generator Module - Combines Classification, Retrieval, and Generation

This module provides RAG (Retrieval-Augmented Generation) functionality that:
1. Classifies the query using the fake news classifier
2. Retrieves relevant documents
3. Generates a comprehensive answer using Google Gemini with context
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

from decision import get_decision_engine

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class RAGGenerator:
    """
    RAG Generator that combines classification, retrieval, and generation
    """
    
    def __init__(self, model_name: str = "gemini-2.5-flash", temperature: float = 0):
        """
        Initialize the RAG Generator
        
        Args:
            model_name: Google Generative AI model name
            temperature: Temperature for generation (0 = deterministic)
        """
        # Initialize decision engine
        self.decision_engine = get_decision_engine()
        
        # Initialize LLM
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in .env file")
        
        self.llm = ChatGoogleGenerativeAI(
            model=model_name,
            temperature=temperature,
            max_retries=2,
            google_api_key=api_key
        )
        
        # Create prompt template for structured analysis
        self.template = """You are a specialized news content analyzer with expertise in detecting fake news, satire, and authentic journalism.

IMPORTANT: A preliminary classifier has analyzed this content, but it often makes mistakes. DO NOT rely heavily on its results. Use your own judgment based on the content and retrieved context.

PRELIMINARY CLASSIFIER RESULT (use with caution):
- Label: {classification_label}
- Confidence: {classification_confidence}

RETRIEVED CONTEXT:
{context}

QUERY TO ANALYZE:
{question}

Your task is to conduct YOUR OWN INDEPENDENT ANALYSIS and generate a STRUCTURED JSON response with the following fields. Respond in Arabic if the query is in Arabic, otherwise respond in French:

1. "partition": YOUR OWN probability assessment as an object:
   - "Not_fake": Your assessed probability this is real/legitimate news (0.0 to 1.0)
   - "fake": Your assessed probability this is fake news (0.0 to 1.0)
   - "satire": Your assessed probability this is satire/parody (0.0 to 1.0)
   - "not_news": Your assessed probability this is not news content (0.0 to 1.0)
   
   CRITICAL: These four probabilities MUST sum to EXACTLY 1.0 (100%). Double-check your math before responding.
   Example: If Not_fake=0.15, fake=0.25, satire=0.55, not_news=0.05, then 0.15+0.25+0.55+0.05 = 1.0 ✓

2. "detection_reasoning": A list of 2-4 reasons explaining YOUR classification decision. Each reason should have:
   - "title": Short title for the detection indicator
   - "description": Brief explanation of this indicator

3. "linguistic_profile": An object containing:
   - "dialect": The detected dialect/language (e.g., "Algerian Darja", "Standard Arabic", "French")
   - "emotional_level": The emotional intensity ("Low", "Medium", "High" or in target language)
   - "cited_sources": Number of sources cited (integer, estimate from content)
   - "factual_claims": Number of factual claims made (integer, estimate from content)
   - "language": The language code ("ar" for Arabic, "fr" for French, etc.)

IMPORTANT: The partition probabilities MUST sum to exactly 1.0. Make your own independent assessment.

Return ONLY a valid JSON object with these exact keys: "partition", "detection_reasoning", "linguistic_profile"

Example structure:
{{
  "partition": {{
    "Not_fake": 0.15,
    "fake": 0.25,
    "satire": 0.55,
    "not_news": 0.05
  }},
  "detection_reasoning": [
    {{"title": "Reason 1 title", "description": "Explanation..."}},
    {{"title": "Reason 2 title", "description": "Explanation..."}}
  ],
  "linguistic_profile": {{
    "dialect": "Algerian Darja",
    "emotional_level": "Low",
    "cited_sources": 0,
    "factual_claims": 1,
    "language": "ar"
  }}
}}"""

        self.prompt = ChatPromptTemplate.from_template(self.template)
        
        # Output parser
        self.output_parser = StrOutputParser()
        
        print("RAG Generator initialized successfully!")
    
    def format_docs(self, docs: List[Dict]) -> str:
        """
        Format retrieved documents for the prompt
        
        Args:
            docs: List of document dictionaries
            
        Returns:
            Formatted string with all document contents
        """
        if not docs:
            return "No relevant documents found."
        
        formatted = []
        for i, doc in enumerate(docs, 1):
            content = doc.get('content', '')
            metadata = doc.get('metadata', {})
            
            doc_text = f"Document {i}:\n{content}"
            if metadata:
                doc_text += f"\nSource: {metadata}"
            formatted.append(doc_text)
        
        return "\n\n".join(formatted)
    
    def parse_llm_response(self, llm_output: str) -> Dict:
        """
        Parse the LLM JSON response, handling markdown code blocks
        
        Args:
            llm_output: Raw output from LLM
            
        Returns:
            Parsed dictionary
        """
        try:
            # Try to extract JSON from markdown code blocks
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', llm_output, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Try to find raw JSON
                json_match = re.search(r'\{.*\}', llm_output, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                else:
                    json_str = llm_output
            
            parsed = json.loads(json_str)
            return parsed
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"LLM Output: {llm_output}")
            # Return a default structure
            return {
                "answer": llm_output,
                "detection_reasoning": [],
                "linguistic_profile": {
                    "dialect": "Unknown",
                    "emotional_level": "Unknown",
                    "cited_sources": 0,
                    "factual_claims": 0,
                    "language": "unknown"
                }
            }
    
    def generate(
        self,
        query: str,
        k: int = 4,
        threshold: float = 0.35
    ) -> Dict:
        """
        Generate a comprehensive analysis using RAG with classification context
        
        Args:
            query: The user's question
            k: Number of documents to retrieve
            threshold: Similarity threshold for retrieval
            
        Returns:
            Dictionary containing the structured analysis report
        """
        # Get classification and retrieval results
        decision_result = self.decision_engine.analyze(
            query=query,
            k=k,
            threshold=threshold,
            return_all_scores=True
        )
        
        # Extract components
        classification = decision_result['classification']
        documents = decision_result['retrieved_documents']
        
        # Format documents
        formatted_context = self.format_docs(documents)
        
        # Prepare prompt inputs
        prompt_inputs = {
            "classification_label": classification['predicted_label'],
            "classification_confidence": f"{classification['confidence']:.2%}",
            "context": formatted_context,
            "question": query
        }
        
        # Generate answer using RAG chain
        rag_chain = (
            self.prompt
            | self.llm
            | self.output_parser
        )
        
        llm_output = rag_chain.invoke(prompt_inputs)
        
        # Parse the structured response
        structured_analysis = self.parse_llm_response(llm_output)
        
        # Get LLM's partition or use default
        llm_partition = structured_analysis.get('partition', {
            'Not_fake': 0.25,
            'fake': 0.25,
            'satire': 0.25,
            'not_news': 0.25
        })
        
        # Normalize partition to ensure it sums to 1.0
        partition_sum = sum(llm_partition.values())
        if abs(partition_sum - 1.0) > 0.01:  # If not close to 1.0, normalize
            llm_partition = {
                key: value / partition_sum 
                for key, value in llm_partition.items()
            }
        
        # Determine verdict based on LLM's partition
        llm_verdict_label = max(llm_partition.items(), key=lambda x: x[1])[0]
        llm_verdict_confidence = llm_partition[llm_verdict_label]
        
        label_descriptions = {
            'Not_fake': 'Real/Legitimate News',
            'fake': 'Fake News',
            'satire': 'Satirical Content',
            'not_news': 'Not News Content'
        }
        
        # Build comprehensive result
        result = {
            "original_content": query,
            "verdict": {
                "label": llm_verdict_label,
                "description": label_descriptions.get(llm_verdict_label, 'Unknown'),
                "confidence": llm_verdict_confidence
            },
            "partition": llm_partition,
            "classifier_reference": {
                "label": classification['predicted_label'],
                "confidence": classification['confidence'],
                "partition": {
                    label: prob 
                    for label, prob in classification.get('all_probabilities', {}).items()
                }
            },
            "detection_reasoning": structured_analysis.get('detection_reasoning', []),
            "linguistic_profile": structured_analysis.get('linguistic_profile', {}),
            "documents_retrieved": len(documents),
            "documents": documents
        }
        
        return result
    
    def generate_simple(self, query: str) -> Dict:
        """
        Simple interface that returns the full analysis result
        
        Args:
            query: The user's question
            
        Returns:
            Analysis result dictionary
        """
        result = self.generate(query)
        return result


# Singleton instance
_rag_generator = None

def get_rag_generator() -> RAGGenerator:
    """Get or create the singleton RAGGenerator instance"""
    global _rag_generator
    if _rag_generator is None:
        _rag_generator = RAGGenerator()
    return _rag_generator


if __name__ == "__main__":
    # Example usage
    print("\n" + "="*80)
    print("RAG GENERATOR TEST")
    print("="*80)
    
    generator = RAGGenerator()
    
    # Test queries
    test_queries = [
        "اشكون سرق متحف اللوفر",
        "ما هي أخبار الطقس اليوم"
    ]
    
    for query in test_queries:
        print(f"\n{'='*80}")
        print(f"Query: {query}")
        print(f"{'='*80}\n")
        
        result = generator.generate(query, k=3, threshold=0.35)
        
        print(f"\n--- VERDICT ---")
        print(f"Label: {result['verdict']['label']}")
        print(f"Confidence: {result['verdict']['confidence']:.2%}")
        
        print(f"\n--- PARTITION ---")
        for label, prob in result['partition'].items():
            print(f"{label}: {prob:.2%}")
        
        print(f"\n--- DETECTION REASONING ---")
        for i, reason in enumerate(result['detection_reasoning'], 1):
            print(f"{i}. {reason.get('title', 'N/A')}")
            print(f"   {reason.get('description', 'N/A')}")
        
        print(f"\n--- LINGUISTIC PROFILE ---")
        profile = result['linguistic_profile']
        print(f"Dialect: {profile.get('dialect', 'N/A')}")
        print(f"Emotional Level: {profile.get('emotional_level', 'N/A')}")
        print(f"Cited Sources: {profile.get('cited_sources', 0)}")
        print(f"Factual Claims: {profile.get('factual_claims', 0)}")
        
        print(f"\n--- DOCUMENTS ---")
        print(f"Retrieved: {result['documents_retrieved']}")
        
        print(f"\n{'='*80}")
