from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from retrieve import load_vectorstore
from dotenv import load_dotenv

load_dotenv()

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def create_rag_chain(persist_dir="./RAG/expirement", model="gemini-2.0-flash"):

    vectorstore = load_vectorstore(persist_dir)
    retriever = vectorstore.as_retriever()
    
    template = """You are an assistant for question-answering tasks. 
    Use the following pieces of retrieved context to answer the question. 
    If you don't know the answer, just say that you don't know. 
    Keep the answer concise.

    {context}

    Question: {question}"""
    
    prompt = ChatPromptTemplate.from_template(template)
    
    llm = ChatGoogleGenerativeAI(
        model=model,
        temperature=0,
        max_retries=2
    )
    
    # Create RAG chain
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    return rag_chain

# if __name__ == "__main__":
#     rag_chain = create_rag_chain()
    
#     question = "ماهي اهداف ويتكوف و امريكا بين الجزائر و المغرب"
#     answer = rag_chain.invoke(question)
    
#     print(f"Question: {question}")
#     print(f"\nAnswer: {answer}")