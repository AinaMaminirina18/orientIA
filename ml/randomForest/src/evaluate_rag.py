import chromadb
import pandas as pd
import time
import os
import re
from rank_bm25 import BM25Okapi

CHROMA_PATH = "../vector_db/chroma_db_orientia"

def clean_text(text):
    return re.sub(r'[^a-zA-Z0-9\s]', '', text.lower()).split()

def search_rag_hybrid(collection, query, top_k=3):
    query_lower = query.lower()
    boosted_code = None
    codes_ispm = ["IGGLIA", "ESIIA", "IMTICIA", "ISAIA", "EMII", "ICMP", "GCA", "IAA", "AEE", "PIP", "CAA", "EMP", "FIC", "DTJA", "TEH", "TEE"]
    for code in codes_ispm:
        if code.lower() in query_lower:
            boosted_code = code
            break

    results = collection.query(
        query_texts=[query],
        n_results=10,
        where={"code_parcours": boosted_code} if boosted_code else None
    )

    if not results["documents"] or not results["documents"][0]:
        return []

    docs = results["documents"][0]
    metas = results["metadatas"][0]
    
    tokenized_corpus = [clean_text(d) for d in docs]
    bm25 = BM25Okapi(tokenized_corpus)
    scores_bm25 = bm25.get_scores(clean_text(query))
    
    combined_results = []
    for i in range(len(docs)):
        score_final = (1 - results["distances"][0][i]) + (scores_bm25[i] / 10)
        combined_results.append((metas[i], score_final))
    
    combined_results.sort(key=lambda x: x[1], reverse=True)
    return [m.get('code_parcours') for m, s in combined_results[:top_k]]

def run_rag_eval():
    if not os.path.exists(CHROMA_PATH):
        print("ChromaDB non trouvé.")
        return

    client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = client.get_collection("orientia_corpus")
    
    test_queries = [
        ("débouchés IGGLIA", "IGGLIA"),
        ("matières GCA", "GCA"),
        ("prérequis EMII", "EMII"),
        ("formation data science", "ISAIA"),
        ("agroalimentaire", "IAA"),
        ("hôtellerie et tourisme", "TEH")
    ]
    
    hits = 0
    total_latency = 0
    
    print("--- ÉVALUATION HYBRIDE RAG (SÉMANTIQUE + BM25 + BOOSTING) ---")
    for query, expected_code in test_queries:
        start = time.time()
        retrieved_codes = search_rag_hybrid(collection, query, top_k=3)
        latency = (time.time() - start) * 1000
        total_latency += latency
        
        status = "[PASSED]" if expected_code in retrieved_codes else "[FAILED]"
        print(f"Query: '{query}' -> {retrieved_codes} | {status}")
        
        if expected_code in retrieved_codes:
            hits += 1
            
    recall = hits / len(test_queries)
    avg_latency = total_latency / len(test_queries)
    
    print("\n--- RÉSULTATS RÉELS RAG OPTIMISÉ ---")
    print(f"Recall@3 : {round(recall * 100, 2)}%")
    print(f"Latence moyenne : {round(avg_latency, 2)}ms")

if __name__ == "__main__":
    run_rag_eval()
