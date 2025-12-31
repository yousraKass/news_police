"""
RAG Generator Module - Combines Classification, Retrieval, and Generation

This module provides RAG (Retrieval-Augmented Generation) functionality that:
1. Classifies the query using the fake news classifier
2. Retrieves relevant documents
3. Generates a comprehensive answer using Google Gemini with context
"""

import os
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
        
        # Create prompt template
        self.template = """You are an assistant for question-answering tasks specialized in analyzing news content.

CLASSIFICATION RESULT:
The query has been classified as: {classification_label} ({classification_description})
Confidence: {classification_confidence}
Classification Context: This is based on a linguistic processing task that analyzed the query for potential fake news indicators.

RETRIEVED CONTEXT:
{context}

Your task is to:
1. Consider the classification result when formulating your answer
2. Use the retrieved context to provide accurate information
3. If the classification indicates "fake" or "satire", mention this in your response
4. If you don't know the answer or there's insufficient context, say so
5. Keep the answer concise and informative
6. Answer in Arabic if the question is in Arabic

Question: {question}

Answer:"""

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
    
    def generate(
        self,
        query: str,
        k: int = 4,
        threshold: float = 0.35
    ) -> Dict:
        """
        Generate an answer using RAG with classification context
        
        Args:
            query: The user's question
            k: Number of documents to retrieve
            threshold: Similarity threshold for retrieval
            
        Returns:
            Dictionary containing the answer and metadata
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
            "classification_description": classification['description'],
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
        
        answer = rag_chain.invoke(prompt_inputs)
        
        # Return comprehensive result
        return {
            "query": query,
            "answer": answer,
            "classification": classification,
            "documents_retrieved": len(documents),
            "documents": documents
        }
    
    def generate_simple(self, query: str) -> str:
        """
        Simple interface that just returns the answer string
        
        Args:
            query: The user's question
            
        Returns:
            Generated answer as string
        """
        result = self.generate(query)
        return result['answer']


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
        
        print(f"Classification: {result['classification']['predicted_label']} "
              f"({result['classification']['confidence']:.2%})")
        print(f"Documents Retrieved: {result['documents_retrieved']}")
        print(f"\nAnswer:\n{result['answer']}")
        print(f"\n{'='*80}")
