"""Met à jour le corpus avec les règles d'admission officielles ISPM.

Source primaire consultée le 2026-08-27 :
https://ispm-edu.com/inscription.php
"""
import json
from pathlib import Path

DATA_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = DATA_ROOT.parent
CORPUS = DATA_ROOT / "Corpus-pedagogique/Simple/corpus-pedagogique-ispm.json"
KB_OUTPUT = REPO_ROOT / "ml/iasymbolique/ontologie/data/full_kb.json"
DATE = "2026-08-27"

SOURCES = [
    {
        "id": "source_offre",
        "titre": "ISPM — Les différents départements et filières",
        "origine_url": "https://ispm-edu.com/filieres.php",
        "date_consultation": DATE,
        "statut": "officiel",
        "donnees_extraites": ["Intitulé et code du parcours", "Présentation générale de la filière"],
        "limites_incertitudes": "La page ne publie pas de maquette détaillée par UE ni de volumes horaires.",
    },
    {
        "id": "source_admission",
        "titre": "ISPM — Conditions d'accès en première année",
        "origine_url": "https://ispm-edu.com/inscription.php",
        "date_consultation": DATE,
        "statut": "officiel",
        "donnees_extraites": ["Séries de baccalauréat admises", "Spécialités techniques admises", "Condition A2 en biotechnologie/agronomie"],
        "limites_incertitudes": "Les conditions sont présentées par département : les règles sont appliquées à tous les parcours du département.",
    },
    {
        "id": "source_diplomes",
        "titre": "ISPM — Présentation générale",
        "origine_url": "https://ispm-edu.com/presentation.php",
        "date_consultation": DATE,
        "statut": "officiel",
        "donnees_extraites": ["Licence Bac+3", "Master/Ingéniorat Bac+5", "Stages et soutenances"],
        "limites_incertitudes": "La présentation est institutionnelle ; elle ne remplace pas une décision administrative individuelle.",
    },
    {
        "id": "source_series_nationales",
        "titre": "Wiki iRENALA — Série Bacc",
        "origine_url": "https://wiki.irenala.edu.mg/wiki/S%C3%A9rie_Bacc",
        "date_consultation": DATE,
        "statut": "institutionnel",
        "donnees_extraites": ["Codes des séries générales", "Baccalauréats technologiques", "Spécialités du baccalauréat professionnel et technique"],
        "limites_incertitudes": "Le référentiel de codes est institutionnel mais sa date de dernière révision doit être confirmée par l'administration avant une décision d'admission.",
    },
]

GENERAL = ["A1", "A2", "C", "D", "L", "OSE", "S"]
TECH_GENIE_CIVIL = ["TGC", "CCBTP", "PCBTP"]
TECH_INDUSTRIEL = ["TGI", "DAMB", "EN", "TPFM", "TAMB", "TMEL", "TFFI", "TMA", "MEMA", "TMF", "TOM"]
TECH_AGRICOLE = ["TAG", "TEV"]
TECH_TERTIAIRE = ["TTER", "ACTC", "CG", "SS"]
ALL_TECH = TECH_GENIE_CIVIL + TECH_INDUSTRIEL + TECH_AGRICOLE + TECH_TERTIAIRE

RULES = {
    "IGGLIA": (["C", "D", "S"] + TECH_INDUSTRIEL, None),
    "ESIIA": (["C", "D", "S"] + TECH_INDUSTRIEL, None),
    "IMTICIA": (["C", "D", "S"] + TECH_INDUSTRIEL, None),
    "ISAIA": (["C", "D", "S"] + TECH_INDUSTRIEL, None),
    "EMII": (["C", "D", "S"] + TECH_INDUSTRIEL, None),
    "ICMP": (["C", "D", "S"] + TECH_INDUSTRIEL, None),
    "GCA": (["C", "D", "S"] + TECH_GENIE_CIVIL, None),
    "IAA": (["C", "D", "S", "A2"] + TECH_AGRICOLE, "A2 admise avec une note de mathématiques >= 12/20."),
    "AEE": (["C", "D", "S", "A2"] + TECH_AGRICOLE, "A2 admise avec une note de mathématiques >= 12/20."),
    "PIP": (["C", "D", "S", "A2"] + TECH_AGRICOLE, "A2 admise avec une note de mathématiques >= 12/20."),
}
ALL_SERIES = ["Toutes séries de baccalauréat", "Y compris les séries techniques ; vérification administrative sur dossier."]
ALL_SERIES_NORMALISEES = GENERAL + ALL_TECH
LANGUE_CANDIDATES = ["Anglais", "Allemand", "Français", "Malgache"]

def describe_series(series):
    return {
        "generales": [s for s in series if s in GENERAL],
        "technologiques": [s for s in series if s in {"TGC", "TGI", "TTER"}],
        "professionnelles_techniques": [s for s in series if s not in GENERAL and s not in {"TGC", "TGI", "TTER"}],
    }


def describe_bac_types(series):
    bac_types = []
    if series == ALL_SERIES or any(item in GENERAL for item in series):
        bac_types.append("Général")
    if series == ALL_SERIES or any(item in {"TGC", "TGI", "TTER"} for item in series):
        bac_types.append("Technologique")
    if series == ALL_SERIES or any(item in ALL_TECH for item in series):
        bac_types.append("Professionnel et technique")
    return bac_types


def describe_languages(parcours):
    prerequis = parcours.get("prerequis", [])
    if isinstance(prerequis, dict):
        prereq_texts = [prerequis.get("texte", "")]
    elif isinstance(prerequis, list):
        prereq_texts = prerequis
    else:
        prereq_texts = [str(prerequis)] if prerequis else []
    texts = " \n".join(parcours.get("competences_developpees", []) + prereq_texts)
    return [langue for langue in LANGUE_CANDIDATES if langue in texts]

with CORPUS.open(encoding="utf-8") as handle:
    corpus = json.load(handle)

for mention in corpus:
    for parcours in mention["filières_parcours"]:
        code = parcours["code_parcours"]
        series, condition = RULES.get(code, (ALL_SERIES, None))
        prerequis = {
            "texte": "Séries admises : " + ", ".join(series),
            "series_admises": series,
            "types_bac": describe_bac_types(series),
            "langues": describe_languages(parcours),
            "source": "source_admission",
            "source_referentiel_series": "source_series_nationales",
        }
        if condition:
            prerequis["condition_particuliere"] = condition
        parcours["prerequis"] = prerequis
        parcours["admission_conditions"] = {
            "niveau": "Première année",
            "series_admises": series,
            "types_bac": describe_bac_types(series),
            "langues": describe_languages(parcours),
            "series_par_voie": describe_series(ALL_SERIES_NORMALISEES if series[0] == "Toutes séries de baccalauréat" else series),
            "condition_particuliere": condition,
            "source": "source_admission",
            "source_referentiel_series": "source_series_nationales",
        }
        parcours["sources"] = SOURCES
        parcours["references_par_champ"] = {
            "nom_parcours": {"sources": ["source_offre"], "attribution": "explicite"},
            "niveaux_diplomes": {"sources": ["source_diplomes"], "attribution": "explicite"},
            "matieres_principales": {"sources": ["source_offre"], "attribution": "partielle"},
            "competences_developpees": {"sources": ["source_offre"], "attribution": "generale_non_explicite"},
            "prerequis": {"sources": ["source_admission"], "attribution": "explicite"},
            "admission_conditions": {"sources": ["source_admission", "source_series_nationales"], "attribution": "explicite"},
            "debouches_professionnels": {"sources": ["source_offre"], "attribution": "generale_non_explicite"},
            "relations_competences_metiers": {"sources": ["source_offre"], "attribution": "generale_non_explicite"},
            "passerelles_possibles": {"sources": [], "attribution": "non_verifie"},
        }

# TEE est publié comme filière distincte de TEH. La source ne donne pas de
# maquette détaillée : les champs non publiés restent volontairement vides.
tourisme = next(item for item in corpus if item["mention"] == "Tourisme")
if not any(p["code_parcours"] == "TEE" for p in tourisme["filières_parcours"]):
    tourisme["filières_parcours"].insert(0, {
        "code_parcours": "TEE",
        "nom_parcours": "Tourisme et Environnement",
        "niveaux_diplomes": [
            "Licence (Bac+3) — trois années de formation suivies d'un stage de trois mois et d'une soutenance.",
            "Master/Ingéniorat (Bac+5) — deux années d'approfondissement suivies d'un stage de recherche et d'une soutenance.",
        ],
        "matieres_principales": [],
        "competences_developpees": ["Connaissance du patrimoine environnemental et culturel malgache", "Sensibilisation au tourisme durable"],
        "prerequis": {
            "texte": "Séries admises : " + ", ".join(ALL_SERIES),
            "series_admises": ALL_SERIES,
            "types_bac": describe_bac_types(ALL_SERIES_NORMALISEES),
            "langues": [],
            "source": "source_admission",
            "source_referentiel_series": "source_series_nationales",
        },
        "admission_conditions": {"niveau": "Première année", "series_admises": ALL_SERIES, "types_bac": describe_bac_types(ALL_SERIES_NORMALISEES), "langues": [], "series_par_voie": describe_series(ALL_SERIES_NORMALISEES), "condition_particuliere": None, "source": "source_admission", "source_referentiel_series": "source_series_nationales"},
        "debouches_professionnels": ["Professionnel du secteur du tourisme"],
        "relations_competences_metiers": [],
        "passerelles_possibles": [],
        "sources": SOURCES,
        "references_par_champ": {
            "nom_parcours": {"sources": ["source_offre"], "attribution": "explicite"},
            "niveaux_diplomes": {"sources": ["source_diplomes"], "attribution": "explicite"},
            "matieres_principales": {"sources": ["source_offre"], "attribution": "absente"},
            "competences_developpees": {"sources": ["source_offre"], "attribution": "generale_non_explicite"},
            "prerequis": {"sources": ["source_admission"], "attribution": "explicite"},
            "admission_conditions": {"sources": ["source_admission", "source_series_nationales"], "attribution": "explicite"},
            "debouches_professionnels": {"sources": ["source_offre"], "attribution": "generale_non_explicite"},
            "relations_competences_metiers": {"sources": [], "attribution": "absente"},
            "passerelles_possibles": {"sources": [], "attribution": "non_verifie"},
        },
    })

with CORPUS.open("w", encoding="utf-8") as handle:
    json.dump(corpus, handle, ensure_ascii=False, indent=2)
    handle.write("\n")

# Le graphe consomme une vue compacte du corpus. La générer ici évite que des
# règles d'admission divergentes soient maintenues dans deux fichiers.
kb = {"mentions": [item["mention"] for item in corpus], "parcours": []}
for mention in corpus:
    for parcours in mention["filières_parcours"]:
        conditions = parcours["admission_conditions"]
        series = conditions["series_admises"]
        if series[0] == "Toutes séries de baccalauréat":
            series = ALL_SERIES_NORMALISEES
        kb["parcours"].append({
            "code": parcours["code_parcours"],
            "nom": parcours["nom_parcours"],
            "mention": mention["mention"],
            "matieres_principales": parcours["matieres_principales"],
            "competences_developpees": parcours["competences_developpees"],
            "prerequis_bac": series,
            "condition_admission": conditions["condition_particuliere"],
            "sources": parcours["sources"],
            "debouches_professionnels": parcours["debouches_professionnels"],
            "relations_competences_metiers": [
                {"competence": rel["competence"], "metier": rel["metier_cible"]}
                for rel in parcours["relations_competences_metiers"]
            ],
            "passerelles": [],
        })
KB_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
with KB_OUTPUT.open("w", encoding="utf-8") as handle:
    json.dump(kb, handle, ensure_ascii=False, indent=2)
    handle.write("\n")
