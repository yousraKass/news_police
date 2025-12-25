python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt

python -m ipykernel install --user --name=news_rag_env --display-name="News RAG Env"