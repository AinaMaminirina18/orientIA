import io
import pandas as pd
import chromadb
from groq import Groq

from config import settings

csv_path = "../data/corpus_ispm.csv"

with open(csv_path, "r", encoding="latin1") as f:
    raw_lines = f.readlines()

clean_lines = []
for line in raw_lines:
    line_str = line.strip()
    if line_str.startswith('"') and line_str.endswith('"'):
        line_str = line_str[1:-1]
    line_str = line_str.replace('""', '"')
    clean_lines.append(line_str)

df = pd.read_csv(io.StringIO("\n".join(clean_lines)))
df = df.fillna("")

chroma_client = chromadb.PersistentClient(path="../vector_db/chroma_db")
collection = chroma_client.get_or_create_collection(
    name="ispm_parcours"
)

documents = []
metadatas = []
ids = []

for idx, row in df.iterrows():
    doc_text = f"""
    Mention: {row['mention']}
    Code Parcours: {row['code_parcours']}
    Nom du Parcours: {row['nom_parcours']}
    Niveaux Diplômes: {row.get('niveaux_diplomes', '').replace('|', ', ')}
    Prérequis: {row.get('prerequis', '')}
    Matières Principales: {row.get('matieres_principales', '').replace('|', ', ')}
    Compétences Développées: {row.get('competences_developpees', '').replace('|', ', ')}
    Débouchés Professionnels: {row.get('debouches_professionnels', '').replace('|', ', ')}
    Passerelles Possibles: {row.get('passerelles_possibles', '')}
    """.strip()

    documents.append(doc_text)
    metadatas.append({
        "code_parcours": str(row['code_parcours']),
        "mention": str(row['mention'])
    })
    ids.append(f"parcours_{idx}_{row['code_parcours']}")

collection.upsert(
    documents=documents,
    metadatas=metadatas,
    ids=ids
)
print(f"--> {len(documents)} parcours indexés avec succès dans ChromaDB.")

client = Groq(api_key=settings.GROQ_API_KEY)

def query_rag_ispm(user_query: str, top_k: int = 20) -> str:
    results = collection.query(
        query_texts=[user_query],
        n_results=top_k
    )
    
    retrieved_docs = results['documents'][0]
    context = "\n\n---\n\n".join(retrieved_docs)

    system_prompt = (
        "Tu es un assistant virtuel d'orientation pour l'ISPM (Institut Supérieur Polytechnique de Madagascar). "
        "Réponds aux questions de l'étudiant de manière claire, structurée et précise en te basant "
        "UNIQUEMENT sur le contexte fourni ci-dessous. Si l'information n'est pas présente, indique-le poliment."
    )
    
    prompt = f"Contexte ISPM:\n{context}\n\nQuestion de l'étudiant: {user_query}"

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )
    return response.choices[0].message.content
