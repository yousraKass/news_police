import requests

DB_API_URL = "http://localhost:5001/data"

def get_data():
    try:
        response = requests.get(f"{DB_API_URL}/retrieve")
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error getting data: {e}")
        return None

def insert_data(data):
    try:
        response = requests.post(f"{DB_API_URL}/insert", json=data)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error inserting data: {e}")
        return None