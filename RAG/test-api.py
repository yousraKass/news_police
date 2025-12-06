from services.db_api.data import get_data, insert_data

def test_get_data():
    result = get_data()
    print("GET result:", result)

def test_insert_data():
    test_data = {"title": "Test Article", "content": "This is a test"}
    result = insert_data(test_data)
    print("INSERT result:", result)

if __name__ == "__main__":
    print("Testing RAG API calls...")
    test_get_data()
    test_insert_data()