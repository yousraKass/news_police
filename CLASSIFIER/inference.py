"""
Inference script for DziriBERT Fake News Classifier

This script loads the fine-tuned DziriBERT model and performs inference
on Algerian dialect (Darja) text for fake news classification.

Classes:
    0: Not_fake - Real news
    1: fake - Fake news
    2: satire - Satirical content
    3: not_news - Not news content

Usage:
    # Single prediction
    python inference.py --text "your text here"
    
    # Batch prediction from CSV
    python inference.py --csv input.csv --output predictions.csv
    
    # Interactive mode
    python inference.py --interactive
"""

import os
import argparse
import json
import re
from typing import Dict, List, Union, Optional
import warnings
warnings.filterwarnings('ignore')

import torch
import numpy as np
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from tqdm import tqdm


class FakeNewsClassifier:
    """
    Fake News Classifier for Algerian Dialect using fine-tuned DziriBERT
    """
    
    # Class labels mapping
    CLASS_LABELS = {
        0: "Not_fake",
        1: "fake",
        2: "satire",
        3: "not_news"
    }
    
    CLASS_DESCRIPTIONS = {
        0: "Real/Legitimate News",
        1: "Fake News",
        2: "Satirical Content",
        3: "Not News Content"
    }
    
    def __init__(self, model_path: str = "./model", max_length: int = 256, device: str = None):
        """
        Initialize the classifier
        
        Args:
            model_path: Path to the saved model directory
            max_length: Maximum sequence length for tokenization
            device: Device to run inference on ('cuda', 'cpu', or None for auto-detect)
        """
        self.model_path = model_path
        self.max_length = max_length
        
        # Set device
        if device is None:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = torch.device(device)
        
        print(f"Loading model from: {model_path}")
        print(f"Using device: {self.device}")
        
        # Load tokenizer and model
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
        self.model = self.model.to(self.device)
        self.model.eval()
        
        print(f"Model loaded successfully!")
        print(f"Vocabulary size: {self.tokenizer.vocab_size}")
        print(f"Max sequence length: {max_length}")
    
    def clean_text(self, text: str) -> str:
        """
        Clean text by removing emojis and special characters
        (Same preprocessing as during training)
        
        Args:
            text: Input text string
            
        Returns:
            Cleaned text
        """
        text = str(text)
        
        # Remove emojis
        emoji_pattern = re.compile(
            "["
            "\U0001F600-\U0001F64F"  # emoticons
            "\U0001F300-\U0001F5FF"  # symbols & pictographs
            "\U0001F680-\U0001F6FF"  # transport & map symbols
            "\U0001F1E0-\U0001F1FF"  # flags (iOS)
            "\U00002500-\U00002BEF"  # chinese char
            "\U00002702-\U000027B0"  # Dingbats
            "\U000024C2-\U0001F251"
            "\U0001f926-\U0001f937"
            "\U00010000-\U0010ffff"
            "\u2640-\u2642"
            "\u2600-\u2B55"
            "\u200d"
            "\u23cf"
            "\u23e9"
            "\u231a"
            "\ufe0f"
            "\u3030"
            "]+",
            flags=re.UNICODE
        )
        text = emoji_pattern.sub(r'', text)
        
        # Remove zero-width characters
        text = re.sub(r'[\u200b\u200c\u200d\ufeff]', '', text)
        
        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text
    
    def predict(self, text: str, clean: bool = True, return_all_scores: bool = False) -> Dict:
        """
        Predict the class of a given text
        
        Args:
            text: Input text to classify
            clean: Whether to apply text cleaning (recommended)
            return_all_scores: Whether to return probabilities for all classes
            
        Returns:
            Dictionary containing prediction results
        """
        # Clean text if requested
        if clean:
            text = self.clean_text(text)
        
        # Check if text is empty after cleaning
        if not text or len(text.strip()) == 0:
            return {
                'error': 'Text is empty after cleaning',
                'predicted_class': None,
                'predicted_label': None,
                'confidence': 0.0
            }
        
        # Tokenize
        encoding = self.tokenizer(
            text,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        input_ids = encoding['input_ids'].to(self.device)
        attention_mask = encoding['attention_mask'].to(self.device)
        
        # Predict
        with torch.no_grad():
            outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)
            pred_class = torch.argmax(probs, dim=1).item()
            confidence = probs[0][pred_class].item()
        
        # Prepare result
        result = {
            'text': text,
            'predicted_class': pred_class,
            'predicted_label': self.CLASS_LABELS[pred_class],
            'description': self.CLASS_DESCRIPTIONS[pred_class],
            'confidence': float(confidence)
        }
        
        if return_all_scores:
            all_probs = probs[0].cpu().numpy()
            result['all_probabilities'] = {
                self.CLASS_LABELS[i]: float(all_probs[i]) 
                for i in range(len(all_probs))
            }
        
        return result
    
    def predict_batch(self, texts: List[str], clean: bool = True, 
                     batch_size: int = 16, show_progress: bool = True) -> List[Dict]:
        """
        Predict classes for a batch of texts
        
        Args:
            texts: List of input texts
            clean: Whether to apply text cleaning
            batch_size: Batch size for inference
            show_progress: Whether to show progress bar
            
        Returns:
            List of prediction dictionaries
        """
        results = []
        
        # Process in batches
        iterator = range(0, len(texts), batch_size)
        if show_progress:
            iterator = tqdm(iterator, desc="Predicting")
        
        for i in iterator:
            batch_texts = texts[i:i + batch_size]
            
            # Clean texts if requested
            if clean:
                batch_texts = [self.clean_text(text) for text in batch_texts]
            
            # Tokenize batch
            encodings = self.tokenizer(
                batch_texts,
                max_length=self.max_length,
                padding='max_length',
                truncation=True,
                return_tensors='pt'
            )
            
            input_ids = encodings['input_ids'].to(self.device)
            attention_mask = encodings['attention_mask'].to(self.device)
            
            # Predict
            with torch.no_grad():
                outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
                logits = outputs.logits
                probs = torch.softmax(logits, dim=1)
                pred_classes = torch.argmax(probs, dim=1).cpu().numpy()
                confidences = probs.max(dim=1).values.cpu().numpy()
            
            # Store results
            for j, (text, pred_class, confidence) in enumerate(
                zip(batch_texts, pred_classes, confidences)
            ):
                results.append({
                    'text': text,
                    'predicted_class': int(pred_class),
                    'predicted_label': self.CLASS_LABELS[pred_class],
                    'description': self.CLASS_DESCRIPTIONS[pred_class],
                    'confidence': float(confidence)
                })
        
        return results
    
    def predict_csv(self, input_csv: str, output_csv: str, 
                   text_column: str = 'text', batch_size: int = 16) -> pd.DataFrame:
        """
        Predict classes for texts in a CSV file
        
        Args:
            input_csv: Path to input CSV file
            output_csv: Path to output CSV file
            text_column: Name of the column containing text
            batch_size: Batch size for inference
            
        Returns:
            DataFrame with predictions
        """
        print(f"Loading CSV from: {input_csv}")
        df = pd.read_csv(input_csv)
        
        if text_column not in df.columns:
            raise ValueError(f"Column '{text_column}' not found in CSV. Available columns: {df.columns.tolist()}")
        
        print(f"Found {len(df)} texts to classify")
        
        # Get predictions
        texts = df[text_column].tolist()
        predictions = self.predict_batch(texts, batch_size=batch_size, show_progress=True)
        
        # Add predictions to dataframe
        df['predicted_class'] = [p['predicted_class'] for p in predictions]
        df['predicted_label'] = [p['predicted_label'] for p in predictions]
        df['confidence'] = [p['confidence'] for p in predictions]
        df['description'] = [p['description'] for p in predictions]
        
        # Save results
        df.to_csv(output_csv, index=False)
        print(f"\nPredictions saved to: {output_csv}")
        
        # Print summary
        print("\n" + "="*80)
        print("PREDICTION SUMMARY")
        print("="*80)
        print(f"Total texts: {len(df)}")
        print(f"\nClass distribution:")
        for label in df['predicted_label'].value_counts().items():
            print(f"  {label[0]}: {label[1]} ({label[1]/len(df)*100:.1f}%)")
        print(f"\nAverage confidence: {df['confidence'].mean():.4f}")
        print("="*80)
        
        return df


def interactive_mode(classifier: FakeNewsClassifier):
    """
    Run classifier in interactive mode
    """
    print("\n" + "="*80)
    print("INTERACTIVE MODE - DziriBERT Fake News Classifier")
    print("="*80)
    print("Enter text to classify (or 'quit' to exit)")
    print("="*80 + "\n")
    
    while True:
        text = input("\nEnter text: ").strip()
        
        if text.lower() in ['quit', 'exit', 'q']:
            print("Exiting...")
            break
        
        if not text:
            print("Please enter some text!")
            continue
        
        # Predict
        result = classifier.predict(text, return_all_scores=True)
        
        # Display results
        print("\n" + "-"*80)
        print("PREDICTION RESULTS")
        print("-"*80)
        print(f"Text: {result['text'][:100]}{'...' if len(result['text']) > 100 else ''}")
        print(f"\nPredicted Class: {result['predicted_label']} (Class {result['predicted_class']})")
        print(f"Description: {result['description']}")
        print(f"Confidence: {result['confidence']:.4f} ({result['confidence']*100:.2f}%)")
        
        if 'all_probabilities' in result:
            print(f"\nAll Class Probabilities:")
            for label, prob in result['all_probabilities'].items():
                bar = "█" * int(prob * 50)
                print(f"  {label:12s} {prob:.4f} {bar}")
        print("-"*80)


def main():
    parser = argparse.ArgumentParser(
        description="DziriBERT Fake News Classifier - Inference Script",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Single text prediction
  python inference.py --text "هذا خبر مهم جدا"
  
  # Batch prediction from CSV
  python inference.py --csv input.csv --output predictions.csv
  
  # Interactive mode
  python inference.py --interactive
  
  # Use CPU instead of GPU
  python inference.py --text "example" --device cpu
        """
    )
    
    parser.add_argument(
        '--text',
        type=str,
        help='Single text to classify'
    )
    
    parser.add_argument(
        '--csv',
        type=str,
        help='Input CSV file path for batch prediction'
    )
    
    parser.add_argument(
        '--output',
        type=str,
        help='Output CSV file path (required when using --csv)'
    )
    
    parser.add_argument(
        '--text-column',
        type=str,
        default='text',
        help='Name of the text column in CSV (default: text)'
    )
    
    parser.add_argument(
        '--model-path',
        type=str,
        default='./model',
        help='Path to the model directory (default: ./model)'
    )
    
    parser.add_argument(
        '--max-length',
        type=int,
        default=256,
        help='Maximum sequence length (default: 256)'
    )
    
    parser.add_argument(
        '--batch-size',
        type=int,
        default=16,
        help='Batch size for batch prediction (default: 16)'
    )
    
    parser.add_argument(
        '--device',
        type=str,
        choices=['cuda', 'cpu', 'auto'],
        default='auto',
        help='Device to use for inference (default: auto)'
    )
    
    parser.add_argument(
        '--interactive',
        action='store_true',
        help='Run in interactive mode'
    )
    
    parser.add_argument(
        '--no-clean',
        action='store_true',
        help='Skip text cleaning (not recommended)'
    )
    
    args = parser.parse_args()
    
    # Validate arguments
    if args.csv and not args.output:
        parser.error("--output is required when using --csv")
    
    if not any([args.text, args.csv, args.interactive]):
        parser.error("One of --text, --csv, or --interactive is required")
    
    # Set device
    device = None if args.device == 'auto' else args.device
    
    # Initialize classifier
    try:
        classifier = FakeNewsClassifier(
            model_path=args.model_path,
            max_length=args.max_length,
            device=device
        )
    except Exception as e:
        print(f"Error loading model: {e}")
        return
    
    # Run appropriate mode
    if args.interactive:
        interactive_mode(classifier)
    
    elif args.text:
        # Single text prediction
        result = classifier.predict(
            args.text, 
            clean=not args.no_clean,
            return_all_scores=True
        )
        
        print("\n" + "="*80)
        print("PREDICTION RESULTS")
        print("="*80)
        print(f"Text: {result['text']}")
        print(f"\nPredicted Class: {result['predicted_label']} (Class {result['predicted_class']})")
        print(f"Description: {result['description']}")
        print(f"Confidence: {result['confidence']:.4f} ({result['confidence']*100:.2f}%)")
        
        if 'all_probabilities' in result:
            print(f"\nAll Class Probabilities:")
            for label, prob in result['all_probabilities'].items():
                bar = "█" * int(prob * 50)
                print(f"  {label:12s} {prob:.4f} {bar}")
        print("="*80)
    
    elif args.csv:
        # Batch prediction from CSV
        try:
            df = classifier.predict_csv(
                input_csv=args.csv,
                output_csv=args.output,
                text_column=args.text_column,
                batch_size=args.batch_size
            )
        except Exception as e:
            print(f"Error processing CSV: {e}")
            return


if __name__ == "__main__":
    main()
