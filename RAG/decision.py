"""
Decision Module - Combines Document Retrieval and Classification

This module provides functionality to retrieve relevant documents and 
classify text using the fake news classifier, returning comprehensive
results that include both retrieval and classification information.
"""

import sys
from pathlib import Path
from typing import List, Dict, Optional

# Add CLASSIFIER to path to import inference module
classifier_path = Path(__file__).parent.parent / "CLASSIFIER"
sys.path.insert(0, str(classifier_path))

from RAG_utils.online_retrieve import retrieve_documents
from inference import FakeNewsClassifier


class DecisionEngine:
    """
    Decision Engine that combines document retrieval with text classification
    """
    
    def __init__(self, model_path: str = None):
        """
        Initialize the decision engine
        
        Args:
            model_path: Path to the classifier model. If None, uses default path.
        """
        # Default to CLASSIFIER/model directory
        if model_path is None:
            model_path = str(Path(__file__).parent.parent / "CLASSIFIER" / "model")
        
        self.classifier = FakeNewsClassifier(model_path=model_path)
        print("Decision Engine initialized successfully!")
    
    def analyze(
        self, 
        query: str, 
        k: int = 4, 
        threshold: float = 0.35,
        return_all_scores: bool = True
    ) -> Dict:
        """
        Analyze a query by retrieving relevant documents and classifying the text
        
        Args:
            query: The input text to analyze
            k: Number of documents to retrieve
            threshold: Similarity threshold for document retrieval
            return_all_scores: Whether to return probabilities for all classes
            
        Returns:
            Dictionary containing:
                - query: The original query
                - classification: Classification results with probabilities
                - retrieved_documents: List of relevant documents
                - document_count: Number of documents retrieved
        """
        # Retrieve relevant documents
        docs = retrieve_documents(query, k=k, threshold=threshold)
        
        # Classify the query text
        classification_result = self.classifier.predict(
            query, 
            clean=True, 
            return_all_scores=return_all_scores
        )
        
        # Format retrieved documents
        retrieved_docs = [
            {
                "content": doc.page_content,
                "metadata": doc.metadata
            }
            for doc in docs
        ]
        
        # Prepare comprehensive result
        result = {
            "query": query,
            "classification": {
                "predicted_class": classification_result['predicted_class'],
                "predicted_label": classification_result['predicted_label'],
                "description": classification_result['description'],
                "confidence": classification_result['confidence']
            },
            "retrieved_documents": retrieved_docs,
            "document_count": len(retrieved_docs)
        }
        
        # Add all class probabilities if requested
        if return_all_scores and 'all_scores' in classification_result:
            result['classification']['all_probabilities'] = classification_result['all_scores']
        
        # Add message if no documents found
        if not retrieved_docs:
            result["message"] = "No relevant documents found for the given query."
        
        return result


# Singleton instance for API usage
_decision_engine = None

def get_decision_engine() -> DecisionEngine:
    """
    Get or create the singleton DecisionEngine instance
    """
    global _decision_engine
    if _decision_engine is None:
        _decision_engine = DecisionEngine()
    return _decision_engine


if __name__ == "__main__":
    # Example usage
    engine = DecisionEngine()
    
    # Test query
    test_query = "اشكون سرق متحف اللوفر"
    
    print("\n" + "="*80)
    print("DECISION ENGINE TEST")
    print("="*80)
    print(f"\nQuery: {test_query}\n")
    
    result = engine.analyze(test_query, k=3, threshold=0.35)
    
    print("\n--- CLASSIFICATION RESULTS ---")
    print(f"Predicted Label: {result['classification']['predicted_label']}")
    print(f"Description: {result['classification']['description']}")
    print(f"Confidence: {result['classification']['confidence']:.4f}")
    
    if 'all_probabilities' in result['classification']:
        print("\nAll Class Probabilities:")
        for class_name, prob in result['classification']['all_probabilities'].items():
            print(f"  {class_name}: {prob:.4f}")
    
    print(f"\n--- RETRIEVED DOCUMENTS ({result['document_count']}) ---")
    for i, doc in enumerate(result['retrieved_documents'], 1):
        print(f"\n{i}. {doc['content'][:200]}...")
        print(f"   Metadata: {doc['metadata']}")
