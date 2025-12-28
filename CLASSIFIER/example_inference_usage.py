"""
Example usage of the FakeNewsClassifier

This script demonstrates different ways to use the inference script
"""

from inference import FakeNewsClassifier

# Initialize the classifier
classifier = FakeNewsClassifier(model_path="./model", max_length=256)

# Example 1: Single text prediction
print("="*80)
print("Example 1: Single Text Prediction")
print("="*80)

text = "هذا خبر مهم عن الأحداث الجارية في الجزائر"
result = classifier.predict(text, return_all_scores=True)

print(f"Text: {result['text']}")
print(f"Predicted: {result['predicted_label']} ({result['description']})")
print(f"Confidence: {result['confidence']:.2%}")
print("\nAll probabilities:")
for label, prob in result['all_probabilities'].items():
    print(f"  {label}: {prob:.2%}")
