import pandas as pd
import chromadb
import os

csv_path = "../data/corpus_ispm.csv"

# Chargement direct via pandas (le fichier a été converti en UTF-8)
df = pd.read_csv(csv_path)
df = df.fillna("")

chroma_client = chromadb.PersistentClient(path="../vector_db/chroma_db_orientia")
collection = chroma_client.get_or_create_collection(
    name="orientia_corpus",
    metadata={"hnsw:space": "cosine"}
)

documents = []
metadatas = []
ids = []

print(f"Indexation de {len(df)} fiches formations...")

for idx, row in df.iterrows():
    code_p = str(row['code_parcours'])
    
    # 1. Chunk Global (La fiche complète) - Très descriptif pour la recherche sémantique
    doc_global = f"Fiche du parcours {code_p} ({row['nom_parcours']}). Mention {row['mention']}. Niveaux: {row['niveaux_diplomes']}. Prérequis: {row['prerequis']}. {row['competences_developpees']} {row['debouches_professionnels']}".strip()
    
    # 2. Chunk Spécialisé : Matières (Boost pour les questions sur le programme)
    doc_matieres = f"Programme d'études et matières enseignées en {code_p} ({row['nom_parcours']}): {row['matieres_principales']}".replace('|', ', ').strip()
    
    # 3. Chunk Spécialisé : Débouchés (Boost pour les questions sur les métiers)
    doc_metiers = f"Débouchés professionnels, carrières et métiers après {code_p}: {row['debouches_professionnels']}".replace('|', ', ').strip()

    # 4. Chunk Spécialisé : Prérequis (Boost pour les questions sur le Bac)
    doc_prerequis = f"Conditions d'admission et séries de Bac autorisées pour {code_p}: {row['prerequis']}".strip()

    chunks = [
        (doc_global, "global"),
        (doc_matieres, "matieres"),
        (doc_metiers, "metiers"),
        (doc_prerequis, "prerequis")
    ]
    
    for content, c_type in chunks:
        documents.append(content)
        metadatas.append({
            "code_parcours": code_p,
            "mention": str(row['mention']),
            "nom_parcours": str(row['nom_parcours']),
            "chunk_type": c_type,
            "source_titre": "Offre de formation ISPM (ispm-edu.com)",
            "statut": "officiel"
        })
        ids.append(f"{code_p}_{c_type}")

collection.upsert(
    documents=documents,
    metadatas=metadatas,
    ids=ids
)

print(f"--> {len(documents)} chunks indexés avec succès dans ChromaDB.")
