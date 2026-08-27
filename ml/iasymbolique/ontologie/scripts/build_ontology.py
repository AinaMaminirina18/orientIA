# -*- coding: utf-8 -*-
"""
Construction de l'ontologie / graphe de connaissances ORIENT'IA.

Produit :
- ontology_schema.ttl   : TBox seule (classes + propriétés), pour import Protégé
- knowledge_graph.ttl   : TBox + ABox (graphe peuplé), format Turtle
- knowledge_graph.owl   : même graphe peuplé, format RDF/XML (compatibilité Protégé)
- nodes.csv / edges.csv : export "graphe de propriétés" (compatible Neo4j / networkx)
"""
import json
import re
import unicodedata
import random
from rdflib import Graph, Namespace, RDF, RDFS, OWL, XSD, Literal, URIRef

random.seed(42)

KB = json.load(open("../data/full_kb.json", encoding="utf-8"))

ORIENT = Namespace("http://orientia.ispm.mg/ontology#")
g = Graph()
g.bind("orient", ORIENT)
g.bind("owl", OWL)

# ---------------------------------------------------------------------------
# Utilitaire : transformer un libellé en identifiant d'URI stable et lisible
# ---------------------------------------------------------------------------
def slug(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "_", text).strip("_")
    return text[:80]


def uri(cls_prefix, label):
    return ORIENT[f"{cls_prefix}_{slug(label)}"]


# ===========================================================================
# 1. TBox — Classes du domaine (celles demandées par le sujet)
# ===========================================================================
CLASSES = {
    "Etudiant": "Étudiant",
    "Formation": "Formation",
    "Mention": "Mention",
    "Parcours": "Parcours",
    "Matiere": "Matière",
    "Competence": "Compétence",
    "Prerequis": "Prérequis",
    "Metier": "Métier",
    "CentreInteret": "Centre d'intérêt",
}
for cls, label_fr in CLASSES.items():
    g.add((ORIENT[cls], RDF.type, OWL.Class))
    g.add((ORIENT[cls], RDFS.label, Literal(label_fr, lang="fr")))

# Hiérarchie : Parcours et Mention sont des types de Formation (offre de formation)
g.add((ORIENT.Parcours, RDFS.subClassOf, ORIENT.Formation))
g.add((ORIENT.Mention, RDFS.subClassOf, ORIENT.Formation))

# Sous-classes utiles pour distinguer deux granularités présentes dans la
# source (compétences transversales vs compétences disciplinaires) — EXTENSION documentée.
for sub, parent, label_fr in [
    ("CompetenceDisciplinaire", "Competence", "Compétence disciplinaire"),
    ("CompetenceTransversale", "Competence", "Compétence transversale"),
]:
    g.add((ORIENT[sub], RDF.type, OWL.Class))
    g.add((ORIENT[sub], RDFS.subClassOf, ORIENT[parent]))
    g.add((ORIENT[sub], RDFS.label, Literal(label_fr, lang="fr")))

# ===========================================================================
# 2. TBox — Propriétés d'objet
# ===========================================================================
# --- Relations demandées explicitement par le sujet ------------------------
CORE_PROPS = [
    ("enseigne", "Parcours", "Matiere", "enseigne"),
    ("developpe", "Parcours", "Competence", "développe"),
    ("prepareA", "Parcours", "Metier", "prépare à"),
    ("necessite", "Parcours", "Prerequis", "nécessite"),
    ("possede", "Etudiant", "Competence", "possède"),
    ("prefere", "Etudiant", "Matiere", "préfère"),
    ("estRequisePour", "Competence", "Metier", "est requise pour"),
]
# --- Extensions ajoutées pour rendre le graphe exploitable de bout en bout -
#     (structurelles ou nécessaires aux cas d'usage listés dans le sujet ;
#     documentées explicitement dans ONTOLOGY.md, non demandées telles quelles)
EXTENSION_PROPS = [
    ("appartientAMention", "Parcours", "Mention", "appartient à la mention"),
    ("aCentreInteret", "Etudiant", "CentreInteret", "a pour centre d'intérêt"),
    ("aSerieBac", "Etudiant", "Prerequis", "a pour série de bac"),
    ("estOrienteVers", "Etudiant", "Parcours", "est orienté vers (recommandation)"),
]

for pname, dom, rng, label_fr in CORE_PROPS + EXTENSION_PROPS:
    g.add((ORIENT[pname], RDF.type, OWL.ObjectProperty))
    g.add((ORIENT[pname], RDFS.domain, ORIENT[dom]))
    g.add((ORIENT[pname], RDFS.range, ORIENT[rng]))
    g.add((ORIENT[pname], RDFS.label, Literal(label_fr, lang="fr")))

# Propriétés inverses utiles au raisonnement multiétape (ex. remonter d'un
# Métier vers les Parcours qui y préparent) — EXTENSION.
g.add((ORIENT.estEnseigneePar, OWL.inverseOf, ORIENT.enseigne))
g.add((ORIENT.estDeveloppeePar, OWL.inverseOf, ORIENT.developpe))
g.add((ORIENT.preparePar, OWL.inverseOf, ORIENT.prepareA))

# ===========================================================================
# 3. TBox — Propriétés de données (littéraux)
# ===========================================================================
DATA_PROPS = [
    ("aLibelle", "rdfs:label utilisé pour tous types"),
    ("aNiveauMatiere", "'lycee' ou 'universite' — niveau d'enseignement d'une Matiere"),
    ("aCode", "code officiel du Parcours (ex. IGGLIA)"),
]
for pname, _comment in DATA_PROPS:
    g.add((ORIENT[pname], RDF.type, OWL.DatatypeProperty))

# On sauvegarde la TBox seule ici, avant d'ajouter l'ABox.
g.serialize(destination="../data/ontology_schema.ttl", format="turtle")
SCHEMA_TRIPLES = len(g)

# ===========================================================================
# 4. ABox — Instances issues de la base de connaissance (mentions, parcours,
#    matières, compétences, métiers, prérequis)
# ===========================================================================
LYCEE_SUBJECTS = ["Mathematiques", "Physique_Chimie", "SVT", "Francais", "Malgache", "Anglais",
                  "Histoire_Geo", "Philosophie", "Economie", "Informatique", "Arts", "EPS"]
# NB : "Francais" (sans accent) correspond au champ du dataset synthétique de
# profils (matieres_preferees). Le parcours TEH possède par ailleurs une
# matière universitaire "Français" (avec accent) dans le document source :
# les deux restent volontairement deux individus distincts (documenté comme
# limitation de normalisation dans ONTOLOGY.md).
SOFT_SKILLS = ["rigueur", "autonomie", "esprit d'analyse", "créativité",
               "sens de l'observation", "aisance relationnelle", "curiosité",
               "esprit d'équipe", "sens de l'organisation", "persévérance"]
INTERESTS_BY_MENTION = {
    "Informatique et Télécommunications": ["Technologie", "Jeux vidéo", "Robotique", "Programmation", "Réseaux sociaux et numérique"],
    "Génie Industriel": ["Mécanique", "Bricolage", "Électronique", "Industrie", "Automobile et aéronautique"],
    "Génie Civil et Architecture": ["Construction", "Architecture", "Dessin et design", "Urbanisme"],
    "Biotechnologie et Agronomie": ["Nature", "Agriculture", "Santé", "Animaux", "Environnement"],
    "Droit et Techniques des Affaires": ["Économie", "Entrepreneuriat", "Actualité et politique", "Débat et droit", "Gestion"],
    "Tourisme": ["Voyage", "Cultures du monde", "Langues étrangères", "Gastronomie", "Hôtellerie"],
}
GENERIC_INTERESTS = ["Sport", "Musique", "Lecture", "Bénévolat associatif", "Réseaux sociaux"]
BAC_SERIES = ["C", "D", "S", "A1", "A2", "L", "Technique", "OSE"]

def add_individual(cls_prefix, cls_name, label):
    ind = uri(cls_prefix, label)
    g.add((ind, RDF.type, ORIENT[cls_name]))
    g.add((ind, RDFS.label, Literal(label, lang="fr")))
    g.add((ind, ORIENT.aLibelle, Literal(label)))
    return ind

# -- Mentions
mention_uri = {}
for m in KB["mentions"]:
    mention_uri[m] = add_individual("Mention", "Mention", m)

# -- Prérequis (séries de bac)
bac_uri = {}
for b in BAC_SERIES:
    bac_uri[b] = add_individual("Prerequis", "Prerequis", f"Baccalauréat série {b}")

# -- Centres d'intérêt
interet_uri = {}
for lst in list(INTERESTS_BY_MENTION.values()) + [GENERIC_INTERESTS]:
    for it in lst:
        if it not in interet_uri:
            interet_uri[it] = add_individual("Interet", "CentreInteret", it)

# -- Matières (lycée, niveau bas ; universitaires, par parcours)
matiere_uri = {}
for s in LYCEE_SUBJECTS:
    ind = add_individual("Matiere", "Matiere", s.replace("_", " "))
    g.add((ind, ORIENT.aNiveauMatiere, Literal("lycee")))
    matiere_uri[("lycee", s.replace("_", " "))] = ind

all_uni_matieres = set()
for p in KB["parcours"]:
    for m in p["matieres_principales"]:
        all_uni_matieres.add(m)
for m in sorted(all_uni_matieres):
    ind = add_individual("Matiere", "Matiere", m)
    g.add((ind, ORIENT.aNiveauMatiere, Literal("universite")))
    matiere_uri[("universite", m)] = ind

# -- Compétences (disciplinaires par parcours + transversales génériques
#    + compétences fines issues des relations compétence->métier)
competence_uri = {}
all_comp_disc = set()
all_comp_fine = set()
for p in KB["parcours"]:
    for c in p["competences_developpees"]:
        all_comp_disc.add(c)
    for rel in p["relations_competences_metiers"]:
        all_comp_fine.add(rel["competence"])

for c in sorted(all_comp_disc):
    ind = add_individual("Competence", "CompetenceDisciplinaire", c)
    competence_uri[c] = ind
for c in sorted(all_comp_fine):
    if c not in competence_uri:
        ind = add_individual("Competence", "CompetenceDisciplinaire", c)
        competence_uri[c] = ind
for c in SOFT_SKILLS:
    ind = add_individual("Competence", "CompetenceTransversale", c)
    competence_uri[c] = ind

# -- Métiers (débouchés + cibles des relations compétence->métier)
metier_uri = {}
all_metiers = set()
for p in KB["parcours"]:
    for d in p["debouches_professionnels"]:
        all_metiers.add(d)
    for rel in p["relations_competences_metiers"]:
        all_metiers.add(rel["metier"])
for m in sorted(all_metiers):
    metier_uri[m] = add_individual("Metier", "Metier", m)

# -- Parcours + toutes leurs relations
parcours_uri = {}
for p in KB["parcours"]:
    ind = add_individual("Parcours", "Parcours", p["nom"])
    g.add((ind, ORIENT.aCode, Literal(p["code"])))
    parcours_uri[p["code"]] = ind
    g.add((ind, ORIENT.appartientAMention, mention_uri[p["mention"]]))
    for m in p["matieres_principales"]:
        g.add((ind, ORIENT.enseigne, matiere_uri[("universite", m)]))
    for c in p["competences_developpees"]:
        g.add((ind, ORIENT.developpe, competence_uri[c]))
    for d in p["debouches_professionnels"]:
        g.add((ind, ORIENT.prepareA, metier_uri[d]))
    for b in p["prerequis_bac"]:
        g.add((ind, ORIENT.necessite, bac_uri[b]))
    for rel in p["relations_competences_metiers"]:
        g.add((competence_uri[rel["competence"]], ORIENT.estRequisePour, metier_uri[rel["metier"]]))

# ===========================================================================
# 5. ABox — Échantillon d'étudiants issus du dataset synthétique
# ===========================================================================
DATASET_PATH = "../../../../Data/Dataset-synthétique/orientationDatasetProfile/data/ispm_orientation_dataset.jsonl"
students = [json.loads(l) for l in open(DATASET_PATH, encoding="utf-8")]
sample = random.sample(students, 40)

for s in sample:
    ind = add_individual("Etudiant", "Etudiant", s["profil_id"])
    g.add((ind, ORIENT.aSerieBac, bac_uri[s["serie_bac"]]))
    g.add((ind, ORIENT.estOrienteVers, parcours_uri[s["parcours_recommande"]]))
    for m in s["matieres_preferees"]:
        key = ("lycee", m.replace("_", " "))
        if key in matiere_uri:
            g.add((ind, ORIENT.prefere, matiere_uri[key]))
    for c in s["competences_declarees"]:
        if c in competence_uri:
            g.add((ind, ORIENT.possede, competence_uri[c]))
    for it in s["centres_interet"]:
        if it in interet_uri:
            g.add((ind, ORIENT.aCentreInteret, interet_uri[it]))

# ===========================================================================
# 6. Sérialisation
# ===========================================================================
g.serialize(destination="../data/knowledge_graph.ttl", format="turtle")
g.serialize(destination="../data/knowledge_graph.owl", format="xml")

print(f"Triplets TBox (schéma seul)      : {SCHEMA_TRIPLES}")
print(f"Triplets totaux (TBox + ABox)    : {len(g)}")
print(f"Mentions: {len(mention_uri)} | Parcours: {len(parcours_uri)} | "
      f"Matières: {len(matiere_uri)} | Compétences: {len(competence_uri)} | "
      f"Métiers: {len(metier_uri)} | Prérequis: {len(bac_uri)} | "
      f"CentresIntérêt: {len(interet_uri)} | Étudiants (échantillon): {len(sample)}")

# ===========================================================================
# 7. Export "graphe de propriétés" (nodes.csv / edges.csv) — compatible
#    Neo4j / networkx pour les équipes qui préfèrent une base graphe plutôt
#    qu'un triplestore OWL.
# ===========================================================================
import csv

nodes = {}
for s_, p_, o_ in g:
    for term in (s_, o_):
        if isinstance(term, URIRef) and str(term).startswith(str(ORIENT)):
            local = str(term)[len(str(ORIENT)):]
            if local not in nodes:
                types = list(g.objects(term, RDF.type))
                type_local = [str(t)[len(str(ORIENT)):] for t in types if str(t).startswith(str(ORIENT))]
                label = g.value(term, RDFS.label)
                nodes[local] = {
                    "id": local,
                    "label": str(label) if label else local,
                    "type": type_local[0] if type_local else "",
                }

with open("../data/nodes.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["id", "label", "type"])
    w.writeheader()
    for n in nodes.values():
        w.writerow(n)

with open("../data/edges.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["source", "relation", "target"])
    w.writeheader()
    for s_, p_, o_ in g:
        if (isinstance(s_, URIRef) and isinstance(o_, URIRef)
                and str(s_).startswith(str(ORIENT)) and str(o_).startswith(str(ORIENT))
                and str(p_).startswith(str(ORIENT))):
            rel = str(p_)[len(str(ORIENT)):]
            if rel in ("type",):
                continue
            w.writerow({
                "source": str(s_)[len(str(ORIENT)):],
                "relation": rel,
                "target": str(o_)[len(str(ORIENT)):],
            })

print("Export nodes.csv / edges.csv terminé.")
