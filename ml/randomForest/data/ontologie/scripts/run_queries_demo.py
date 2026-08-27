# -*- coding: utf-8 -*-
"""Exécute les 6 requêtes exemples sur le graphe peuplé et sauvegarde les résultats."""
from rdflib import Graph

g = Graph()
g.parse("../data/knowledge_graph.ttl", format="turtle")

PREFIX = """
PREFIX orient: <http://orientia.ispm.mg/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
"""

# Choix d'un étudiant concret existant dans le graphe pour les requêtes 2, 5, 6
some_student = g.value(predicate=None, object=None)  # placeholder, remplacé ci-dessous
students = sorted({str(s) for s, p, o in g if str(p).endswith("estOrienteVers")})
demo_student_uri = students[0].split("#")[-1]
print(f"Étudiant utilisé pour les requêtes 2/5/6 : {demo_student_uri}\n")

Q1 = PREFIX + """
SELECT ?etudiantLabel ?parcoursLabel ?serieBacLabel
       (IF(BOUND(?ok), "OK", "INCOHERENT") AS ?statut)
WHERE {
  ?etudiant a orient:Etudiant ; rdfs:label ?etudiantLabel ;
            orient:aSerieBac ?serieBac ; orient:estOrienteVers ?parcours .
  ?parcours rdfs:label ?parcoursLabel .
  ?serieBac rdfs:label ?serieBacLabel .
  OPTIONAL { ?parcours orient:necessite ?serieBac . BIND(true AS ?ok) }
}
ORDER BY ?etudiant
LIMIT 8
"""

Q2 = PREFIX + f"""
SELECT ?matiereLabel ?competenceLabel
WHERE {{
  BIND(orient:{demo_student_uri} AS ?etudiant)
  ?etudiant orient:estOrienteVers ?parcours .
  OPTIONAL {{
    ?etudiant orient:prefere ?matiere . ?parcours orient:enseigne ?matiere .
    ?matiere rdfs:label ?matiereLabel .
  }}
  OPTIONAL {{
    ?etudiant orient:possede ?competence . ?parcours orient:developpe ?competence .
    ?competence rdfs:label ?competenceLabel .
  }}
  FILTER(BOUND(?matiereLabel) || BOUND(?competenceLabel))
}}
"""

Q3 = PREFIX + """
SELECT ?parcoursLabel ?mentionLabel
WHERE {
  ?metier rdfs:label "Data Scientist / Data Analyst"@fr .
  ?parcours orient:prepareA ?metier ; orient:appartientAMention ?mention ;
            rdfs:label ?parcoursLabel .
  ?mention rdfs:label ?mentionLabel .
}
"""

Q4 = PREFIX + """
SELECT ?etudiantLabel ?serieBacLabel ?parcoursLabel
WHERE {
  ?etudiant a orient:Etudiant ; rdfs:label ?etudiantLabel ;
            orient:aSerieBac ?serieBac ; orient:estOrienteVers ?parcours .
  ?serieBac rdfs:label ?serieBacLabel .
  ?parcours rdfs:label ?parcoursLabel .
  FILTER NOT EXISTS { ?parcours orient:necessite ?serieBac }
}
"""

Q5 = PREFIX + f"""
SELECT ?parcoursLabel (COUNT(DISTINCT ?matiere) AS ?nbMatieres) (COUNT(DISTINCT ?competence) AS ?nbCompetences)
WHERE {{
  BIND(orient:{demo_student_uri} AS ?etudiant)
  ?parcours a orient:Parcours ; rdfs:label ?parcoursLabel .
  OPTIONAL {{ ?etudiant orient:prefere ?matiere . ?parcours orient:enseigne ?matiere . }}
  OPTIONAL {{ ?etudiant orient:possede ?competence . ?parcours orient:developpe ?competence . }}
}}
GROUP BY ?parcoursLabel
ORDER BY DESC(?nbMatieres) DESC(?nbCompetences)
LIMIT 5
"""

Q6 = PREFIX + f"""
SELECT DISTINCT ?matiereLabel ?parcoursLabel ?metierLabel
WHERE {{
  BIND(orient:{demo_student_uri} AS ?etudiant)
  ?etudiant orient:prefere ?matiere . ?matiere rdfs:label ?matiereLabel .
  ?parcours orient:enseigne ?matiere ; orient:prepareA ?metier ; rdfs:label ?parcoursLabel .
  ?metier rdfs:label ?metierLabel .
}}
ORDER BY ?matiereLabel
LIMIT 10
"""

out = []
def run(title, query):
    out.append(f"\n=== {title} ===")
    res = g.query(query)
    out.append(f"({len(res)} résultat(s), colonnes : {', '.join(str(v) for v in res.vars)})")
    for row in res:
        out.append(" | ".join(str(x) for x in row))
    return res

run("1. Vérifier des prérequis", Q1)
run("2. Expliquer une recommandation", Q2)
run("3. Parcourir formations -> métiers (métier = Data Scientist / Data Analyst)", Q3)
run("4. Détecter des incohérences", Q4)
run("5. Compléter le modèle statistique (top parcours par recoupement symbolique)", Q5)
run("6. Raisonnement multiétape (Étudiant -> Matière -> Parcours -> Métier)", Q6)

text = "\n".join(out)
print(text)
open("../reports/query_results_demo.txt", "w", encoding="utf-8").write(text)
