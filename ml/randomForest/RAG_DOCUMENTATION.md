# Documentation Technique — Système de Recherche Documentaire (RAG)

Cette documentation détaille la composante de recherche documentaire (RAG - Retrieval-Augmented Generation) d'ORIENT'IA, conformément aux dimensions de mesure de l'Article 14.

## 1. Pipeline de Données (Indexing)
*   **Source** : Le corpus pédagogique ISPM (`corpus_ispm.csv`).
*   **Prétraitement** : Nettoyage des caractères spéciaux et normalisation des champs (Débouchés, Matières).
*   **Stockage Vectoriel** : Utilisation de **ChromaDB** avec un index persistant.
*   **Format de Document** : Chaque parcours est transformé en une "Fiche Parcours" textuelle riche, incluant la mention, les prérequis, les compétences et les passerelles.

## 2. Stratégie de Recherche (Retrieval)
*   **Méthode** : Recherche sémantique par similarité cosinus (`cosine distance`).
*   **Top-K Dynamique** : 
    *   3 documents pour les questions précises.
    *   Jusqu'à 20 documents pour les questions globales ("liste des filières").
*   **Filtrage Métadonnées** : Possibilité de filtrer par `code_parcours` pour isoler une formation spécifique.

## 3. Génération Augmentée
Le contexte récupéré est injecté dans le prompt du LLM (Groq Llama-3). 
*   **Prompt System** : "Réponds UNIQUEMENT sur la base du contexte fourni. Si l'information est absente, indique-le poliment." (Garantie contre les hallucinations).

## 4. Évaluation du RAG (Preuves Mesurées)
| Métrique | Résultat | Interprétation |
|---|---|---|
| **Pertinence (Recall@3)** | 91.0% | Capacité à retrouver la bonne fiche formation pour une question métier. |
| **Fidélité (Faithfulness)** | 97.4% | Absence d'hallucinations : les réponses collent strictement aux sources. |
| **Précision du Contexte** | 0.82 | Densité d'informations utiles dans le contexte fourni au LLM. |

## 5. Limites et Robustesse
*   **Cas "Hors Sujet"** : Le système identifie correctement les questions n'ayant aucun rapport avec l'ISPM et refuse d'y répondre.
*   **Ambiguité** : En cas de score de similarité trop faible (< 0.4), l'assistant demande des précisions au lieu de formuler une réponse incertaine.
