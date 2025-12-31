"""
Simple test script for the Decision API endpoint
Tests the /ai/analyze endpoint with 100 different sentences
"""

import requests
import json
from datetime import datetime

# API endpoint
API_URL = "http://localhost:8001/ai/analyze"

# Test sentences (mix of Arabic/Algerian dialect) - 100 queries
test_sentences = [
    # News queries
    "اشكون سرق متحف اللوفر",
    "الأرصاد الجوية الطقس",
    "فريق الجزائر فاز بكأس العالم",
    "الحكومة أعلنت عن إجراءات جديدة",
    "رئيس الجمهورية يزور ولاية وهران",
    "أخبار الرياضة اليوم",
    "الطقس غدا سيكون ممطر",
    "السوق المالي اليوم",
    "وزير التربية يعلن عن العطلة",
    "مباراة الجزائر ومصر الليلة",
    
    # More news queries
    "انفجار في العاصمة",
    "رئيس الوزراء يستقيل",
    "الدولار يرتفع مقابل الدينار",
    "زلزال يضرب المنطقة",
    "وزير الصحة يعلن عن حالات جديدة",
    "البطولة الوطنية تنطلق غدا",
    "أسعار البترول في ارتفاع",
    "الجزائر تفوز بالميدالية الذهبية",
    "افتتاح مطار جديد",
    "الحكومة توزع مساعدات",
    
    # Political news
    "الرئيس يلتقي بنظيره الفرنسي",
    "البرلمان يصادق على قانون جديد",
    "الانتخابات المحلية قادمة",
    "وزير الخارجية في زيارة رسمية",
    "حزب المعارضة ينتقد القرار",
    "مظاهرات في العاصمة",
    "القمة العربية تنعقد في الجزائر",
    "الأمم المتحدة تدين الهجوم",
    "اتفاقية تعاون بين البلدين",
    "الرئيس يترأس اجتماع الحكومة",
    
    # Economic news
    "البورصة تسجل ارتفاعا",
    "البنك المركزي يخفض الفائدة",
    "صادرات الجزائر ترتفع",
    "معرض تجاري دولي",
    "شركة جديدة تفتح فروعا",
    "الضرائب الجديدة تثير الجدل",
    "البطالة في انخفاض",
    "مشروع استثماري كبير",
    "أسعار المواد الغذائية",
    "الحكومة تدعم المشاريع الصغيرة",
    
    # Social news
    "حملة تلقيح واسعة",
    "مدارس جديدة في البناء",
    "مستشفى حديث يفتح أبوابه",
    "حملة نظافة في المدينة",
    "مهرجان ثقافي يبدأ غدا",
    "جمعية خيرية توزع مساعدات",
    "حادث مرور خطير",
    "الأمطار تسبب فيضانات",
    "مسابقة توظيف جديدة",
    "جامعة جديدة تفتح",
    
    # Sports news
    "الفريق الوطني يتأهل",
    "بطولة أفريقيا للأمم",
    "لاعب جزائري ينتقل لنادي أوروبي",
    "الأولمبياد القادم في باريس",
    "مباراة مولودية الجزائر",
    "بطل العالم في الملاكمة",
    "سباق الماراثون السنوي",
    "المنتخب الوطني للسيدات",
    "كأس الكونفدرالية الأفريقية",
    "رياضي جزائري يحطم رقم قياسي",
    
    # Weather and environment
    "موجة حر شديدة",
    "عاصفة ثلجية قادمة",
    "الطقس معتدل هذا الأسبوع",
    "أمطار غزيرة متوقعة",
    "درجات الحرارة في ارتفاع",
    "رياح قوية على السواحل",
    "الطقس البارد يستمر",
    "حرائق الغابات تحت السيطرة",
    "التلوث البيئي في المدن",
    "حملة تشجير وطنية",
    
    # Technology news
    "شركة جزائرية تطلق تطبيقا جديدا",
    "الإنترنت السريع يصل للقرى",
    "هاتف ذكي جديد في الأسواق",
    "تطوير نظام ذكاء اصطناعي",
    "الحكومة تدعم الشركات التقنية",
    "معرض التكنولوجيا السنوي",
    "تطبيق جديد للتعليم الإلكتروني",
    "الجزائر تطلق قمر صناعي",
    "شبكة الجيل الخامس قريبا",
    "برنامج لتعليم البرمجة",
    
    # Cultural news
    "مهرجان السينما الدولي",
    "معرض للفنون التشكيلية",
    "كتاب جديد لكاتب جزائري",
    "حفل موسيقي في دار الأوبرا",
    "مسرحية جديدة تعرض الليلة",
    "مكتبة وطنية جديدة",
    "جائزة أدبية لروائي جزائري",
    "أسبوع الثقافة العربية",
    "فيلم جزائري في مهرجان كان",
    "احتفالات باليوم الوطني"
]


def test_api():
    """Test the API with multiple sentences and save results to JSON"""
    print("\n" + "="*80)
    print("TESTING DECISION API - /ai/analyze")
    print(f"Total queries: {len(test_sentences)}")
    print("="*80)
    
    results = []
    
    for i, sentence in enumerate(test_sentences, 1):
        print(f"\n[Test {i}/{len(test_sentences)}] Query: {sentence}")
        print("-" * 80)
        
        try:
            # Make POST request
            response = requests.post(
                API_URL,
                json={
                    "query": sentence,
                    "k": 3,
                    "threshold": 0.35,
                    "return_all_scores": True
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Display classification results
                classification = result['classification']
                print(f"✓ Label: {classification['predicted_label']}")
                print(f"  Description: {classification['description']}")
                print(f"  Confidence: {classification['confidence']:.4f}")
                
                # Display document count
                print(f"  Documents Found: {result['document_count']}")
                
                # Display retrieved documents
                if result['document_count'] > 0:
                    print("\n  Retrieved Documents:")
                    for j, doc in enumerate(result['retrieved_documents'], 1):
                        print(f"    [{j}] {doc['content'][:150]}...")
                        if doc['metadata']:
                            print(f"        Metadata: {doc['metadata']}")
                
                # Show top probability scores
                if 'all_probabilities' in classification:
                    print("\n  Probabilities:")
                    for label, prob in classification['all_probabilities'].items():
                        print(f"    - {label}: {prob:.4f}")
                
                # Save to results list
                results.append({
                    "test_number": i,
                    "query": sentence,
                    "classification": {
                        "label": classification['predicted_label'],
                        "description": classification['description'],
                        "confidence": classification['confidence'],
                        "all_probabilities": classification.get('all_probabilities', {})
                    },
                    "documents": {
                        "count": result['document_count'],
                        "retrieved": [
                            {
                                "content": doc['content'],
                                "metadata": doc['metadata']
                            }
                            for doc in result['retrieved_documents']
                        ]
                    },
                    "status": "success"
                })
                
            else:
                print(f"✗ Error: {response.status_code}")
                print(f"  {response.text}")
                
                results.append({
                    "test_number": i,
                    "query": sentence,
                    "error": f"HTTP {response.status_code}",
                    "error_details": response.text,
                    "status": "failed"
                })
                
        except requests.exceptions.ConnectionError:
            print("✗ Error: Cannot connect to API. Make sure server is running on port 8001")
            results.append({
                "test_number": i,
                "query": sentence,
                "error": "Connection error",
                "status": "failed"
            })
            break
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            results.append({
                "test_number": i,
                "query": sentence,
                "error": str(e),
                "status": "failed"
            })
    
    # Save results to JSON file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"test_results_{timestamp}.json"
    
    output_data = {
        "test_info": {
            "total_queries": len(test_sentences),
            "successful": len([r for r in results if r['status'] == 'success']),
            "failed": len([r for r in results if r['status'] == 'failed']),
            "timestamp": timestamp,
            "api_endpoint": API_URL
        },
        "results": results
    }
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print("\n" + "="*80)
    print("TEST COMPLETE")
    print("="*80)
    print(f"\nResults saved to: {filename}")
    print(f"Total queries: {len(test_sentences)}")
    print(f"Successful: {output_data['test_info']['successful']}")
    print(f"Failed: {output_data['test_info']['failed']}")
    print("="*80 + "\n")


if __name__ == "__main__":
    print("Starting API tests...")
    print("Make sure the server is running: python server.py")
    print("Waiting 2 seconds...\n")
    
    import time
    time.sleep(2)
    
    test_api()
