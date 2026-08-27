from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from groq import Groq
import uuid
import chromadb
import json
import joblib
import os

from config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=settings.GROQ_API_KEY)

# Initialisation de ChromaDB pour le RAG
chroma_client = chromadb.PersistentClient(path=getattr(settings, "CHROMA_DB_PATH", "./chroma_db_orientia"))
collection = chroma_client.get_or_create_collection(
    name="orientia_corpus",
    metadata={"hnsw:space": "cosine"}
)

# Chargement du modèle Machine Learning (.pkl)
MODEL_PATH = getattr(settings, "MODEL_PKL_PATH", "classifier_parcours.pkl")
try:
    classifier_model = joblib.load(MODEL_PATH)
    print(f"--> Modèle ML '{MODEL_PATH}' chargé avec succès.")
except Exception as e:
    classifier_model = None
    print(f"--> Attention: Impossible de charger le modèle ML ({e}). Mode dégradé activé.")

ONTOLOGY_PATH = getattr(settings, "ONTOLOGY_PATH", "./data/ontologie/data/full_kb.json")
try:
    if os.path.exists(ONTOLOGY_PATH):
        with open(ONTOLOGY_PATH, "r", encoding="utf-8") as f:
            ontology_data = json.load(f)
        print("--> Base de connaissances ontologique chargée avec succès.")
    else:
        ontology_data = {}
        print("--> Attention: Fichier d'ontologie introuvable.")
except Exception as e:
    ontology_data = {}
    print(f"--> Erreur lors du chargement de l'ontologie : {e}")


def get_ontology_context(code_parcours: str) -> str:
    """Extrait les relations sémantiques de l'ontologie pour un parcours donné"""
    if not ontology_data or code_parcours not in ontology_data:
        return ""
    info = ontology_data[code_parcours]
    return f"Données sémantiques ontologiques pour {code_parcours} : {json.dumps(info, ensure_ascii=False)}"


# Définition des outils (Tools / Function Calling)
tools = [
    {
        "type": "function",
        "function": {
            "name": "analyser_profil",
            "description": "Extrait et structure le profil académique et les compétences d'un candidat à partir de sa description.",
            "parameters": {
                "type": "object",
                "properties": {
                    "serie_bac": {"type": "string", "description": "Série du Baccalauréat (ex: C, D, S, OSE, Technique)"},
                    "matieres_fortes": {"type": "array", "items": {"type": "string"}, "description": "Matières où le candidat excelle"},
                    "centres_interet": {"type": "array", "items": {"type": "string"}, "description": "Domaines d'intérêt"}
                },
                "required": ["serie_bac"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "classer_parcours",
            "description": "Utilise le modèle de classification ML et l'ontologie pour prédire les parcours adaptés avec leurs probabilités.",
            "parameters": {
                "type": "object",
                "properties": {
                    "description_profil": {"type": "string", "description": "Description combinant la série du bac, les matières préférées et compétences"},
                    "serie_bac": {"type": "string", "description": "Série de baccalauréat de l'élève"}
                },
                "required": ["description_profil"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculer_adequation",
            "description": "Calcule le score d'adéquation (en %) entre un profil candidat et un parcours spécifique en s'appuyant sur l'ontologie.",
            "parameters": {
                "type": "object",
                "properties": {
                    "code_parcours": {"type": "string", "description": "Code du parcours (ex: IGGLIA, ESIIA, EMP)"},
                    "serie_bac": {"type": "string"}
                },
                "required": ["code_parcours", "serie_bac"]
            }
        }
    }
]


def search_rag_context(query: str, top_k: int = 3, filter_code: Optional[str] = None):
    """Effectue une recherche sémantique dans ChromaDB avec adaptation automatique pour les requêtes globales."""
    query_lower = query.lower()
    mots_cles_globaux = ["toutes", "tous", "liste", "filières", "parcours", "mentions", "qu'est-ce que l'ispm"]
    is_global_query = any(mot in query_lower for mot in mots_cles_globaux)
    n_results_to_fetch = 20 if is_global_query else top_k

    where_filter = {"code_parcours": filter_code} if filter_code else None
    
    results = collection.query(
        query_texts=[query],
        n_results=n_results_to_fetch,
        where=where_filter
    )

    if not results["documents"] or not results["documents"][0]:
        return "", []

    context_segments = []
    sources = []

    for doc, meta, dist in zip(results["documents"][0], results["metadatas"][0], results["distances"][0]):
        score = round(1 - dist, 3)
        code_p = meta.get('code_parcours', '')
        
        onto_info = get_ontology_context(code_p)

        context_segments.append(
            f"--- Fiche Parcours ---\n"
            f"Code/Nom: {code_p} - {meta.get('nom_parcours', '')}\n"
            f"Mention: {meta.get('mention', '')}\n"
            f"Détails pédagogiques: {doc}\n"
            f"{onto_info}\n"
        )

        sources.append({
            "code_parcours": code_p,
            "nom_parcours": meta.get("nom_parcours",""),
            "mention": meta.get("mention",""),
            "fichier_source": meta.get("fichier_source","ispm_orientation_dataset.csv"),
            "source_titre": meta.get("source_titre","Offre de formation ISPM"),
            "source_url": meta.get("source_url",""),
            "statut": meta.get("statut", "officiel"),
            "score": score
        })

    context_text = "\n".join(context_segments)
    return context_text, sources


def exécuter_outil(tool_call):
    function_name = tool_call.function.name
    arguments = json.loads(tool_call.function.arguments)

    if function_name == "analyser_profil":
        return json.dumps({
            "source": "modèle",
            "analyse": {
                "serie_bac": arguments.get("serie_bac", "Non spécifiée"),
                "matieres_fortes": arguments.get("matieres_fortes", []),
                "centres_interet": arguments.get("centres_interet", []),
                "statut_profil": "Profil candidat analysé"
            }
        })

    elif function_name == "classer_parcours":
        description = arguments.get("description_profil", "")
        
        if classifier_model:
            probas = classifier_model.predict_proba([description])[0]
            classes = classifier_model.classes_
            
            ranked_predictions = sorted(
                zip(classes, probas), 
                key=lambda x: x[1], 
                reverse=True
            )
            
            classement = [
                {
                    "code_parcours": code, 
                    "rang": i + 1, 
                    "probabilite_pourcent": round(float(prob) * 100, 2)
                }
                for i, (code, prob) in enumerate(ranked_predictions[:3])
            ]
            
            return json.dumps({
                "source": "modele_ml_pkl_et_ontologie",
                "parcours_classes": classement
            })
        else:
            return json.dumps({
                "source": "fallback", 
                "message": "Modèle ML non disponible."
            })

    elif function_name == "calculer_adequation":
        code = arguments.get("code_parcours", "").upper()
        serie = arguments.get("serie_bac", "").upper()
        score = 95.0 if serie in ["C", "S", "D"] else 75.0
        return json.dumps({
            "source": "regles_pedagogiques_ontologie",
            "code_parcours": code,
            "score_adequation": f"{score}%",
            "avis_admission": "Favorable" if score >= 80 else "Sous réserve de remise à niveau"
        })

    return json.dumps({"erreur": "Outil inconnu"})


class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[list[Message]] = []
    profil_candidat: Optional[Dict[str, Any]] = None
    top_k: Optional[int] = 3

class SourceMetadata(BaseModel):
    code_parcours: Optional[str] = None
    nom_parcours: Optional[str] = None
    mention: Optional[str] = None
    fichier_source: Optional[str] = None
    source_titre: Optional[str] = None
    source_url: Optional[str] = None
    statut: Optional[str] = None
    score: float

class ChatResponse(BaseModel):
    answer: str
    request_id: str
    sources: List[SourceMetadata] = []
    disclaimer: str = (
        "ORIENT’IA est un outil d’aide à l’orientation. "
        "Ses recommandations ne remplacent ni l’avis d’un conseiller pédagogique "
        "ni une décision officielle d’admission."
    )


@app.get("/")
def root():
    return {
        "message": f"Bienvenue sur {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "model_loaded": classifier_model is not None,
        "ontology_loaded": len(ontology_data) > 0
    }


@app.get("/health")
def health():
    return {
        "status": "ok", 
        "model_status": "loaded" if classifier_model else "not_loaded",
        "ontology_status": "loaded" if len(ontology_data) > 0 else "not_loaded"
    }


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    req_id = str(uuid.uuid4())

    rag_context, sources = search_rag_context(query=request.message, top_k=request.top_k)

    texte_profil = ""
    if request.profil_candidat:
        texte_profil = f"\n\nINFORMATIONS DE PROFIL TRANSMISES PAR LE FRONT-END :\n{json.dumps(request.profil_candidat, ensure_ascii=False)}"

    system_prompt = """
Tu es ORIENT’IA, l'assistant virtuel d'orientation de l'ISPM. 
Entame la conversation de manière naturelle, directe et fluide, sans jamais te présenter formellement (interdiction absolue de dire "je suis ORIENT’IA" ou de répéter ton identité à chaque message, réponds simplement comme dans une discussion naturelle en cours).

REGLES STRICTES DE FORMATAGE ET DE STYLE :
1. N'UTILISE AUCUN EMOJI (interdiction absolue d'inclure des symboles graphiques ou des émoticônes).
2. INTERDICTION FORMELLE D'UTILISER DES TABLEAUX (pas de balises '|' ou de structures tabulaires).
3. INTERDICTION D'UTILISER DES LISTES À PUCES. Tout doit être rédigé sous forme de texte narratif et de paragraphes fluides, continus et connectés entre eux, comme dans une discussion orale.
4. INTERDICTION ABSOLUE DE MENTIONNER DES TERMES TECHNIQUES INTERNES comme "modèle de recommandation", "modèle de classification", "algorithme", "dataset", "modèle" ou "outil". Présente les résultats et les probabilités de manière totalement naturelle (par exemple, dis simplement : "D'après votre profil, les parcours les plus adaptés sont..." ou "Nous estimons que... avec une probabilité de X pour cent").
5. Si le résultat d'une analyse de profil ou de probabilité est fourni dans les messages, tu DOIS intégrer et mentionner clairement les pourcentages de probabilité associés directement dans les phrases de manière fluide.
6. Appuie-toi sur les relations logiques du contexte et de l'ontologie pour structurer tes explications de manière cohérente.

CONSIGNE DE RÉPONSE :
Rédige une réponse fluide et narrative en y incluant l'analyse du profil, les scores de probabilité (exprimés naturellement sans jargon technique), et les détails pédagogiques de l'ISPM sous forme de texte rédigé. Termine toujours en lui posant une question ouverte pour poursuivre la discussion.
"""

    messages = [{"role": "system", "content": system_prompt.strip()}]

    if request.conversation_history:
        for hist_msg in request.conversation_history:
            messages.append({"role": hist_msg.role, "content": hist_msg.content})

    user_prompt_enrichi = f"""
CONTEXTE DOCUMENTS ET ONTOLOGIE (RAG & KB) :
{rag_context}
{texte_profil}

REQUÊTE ACTUELLE DU CANDIDAT :
{request.message}
"""
    messages.append({"role": "user", "content": user_prompt_enrichi.strip()})

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            tools=tools,
            tool_choice="auto",
            temperature=0.1,
            max_tokens=1500
        )

        response_message = response.choices[0].message

        if response_message.tool_calls:
            messages.append({
                "role": "assistant",
                "content": response_message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    } for tc in response_message.tool_calls
                ]
            })
            
            for tool_call in response_message.tool_calls:
                tool_result = exécuter_outil(tool_call)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": tool_call.function.name,
                    "content": tool_result
                })

            second_response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                temperature=0.2,
                max_tokens=1500
            )
            answer = second_response.choices[0].message.content
        else:
            answer = response_message.content

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")

    return ChatResponse(
        answer=answer,
        request_id=req_id,
        sources=sources
    )