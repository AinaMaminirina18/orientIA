# -*- coding: utf-8 -*-
"""
Générateur de données synthétiques pour un modèle d'aide à l'orientation
(candidats bacheliers -> parcours ISPM).

Toutes les hypothèses et pondérations "métier" ci-dessous (affinités
matières/parcours, popularité relative des parcours, mapping environnement
de travail, etc.) sont des HYPOTHÈSES D'EXPERT ajoutées pour la génération :
elles ne proviennent pas explicitement du document source et sont donc
documentées comme telles dans DOCUMENTATION.md.
"""
import json
import random
import csv
import statistics as stats
from reference_parcours import (
    BAC_SERIES_REFERENCE, GENERAL_BAC_SERIES, PARCOURS, PASSERELLES,
    TECH_AGRICOLE, TECH_GENIE_CIVIL, TECH_INDUSTRIEL, TECH_TERTIAIRE,
)

random.seed(42)  # reproductibilité

N_PROFILES = 1600
AMBIGUOUS_RATE = 0.20   # profils "à cheval" entre deux parcours proches
GENERALIST_RATE = 0.15  # profils sans préférence marquée (notes plates)

LYCEE_SUBJECTS = [
    "Mathematiques", "Physique_Chimie", "SVT", "Francais", "Malgache", "Anglais",
    "Histoire_Geo", "Philosophie", "Economie", "Informatique", "Arts", "EPS",
]

# Affinité (boost de note / probabilité de préférence) par parcours.
# Hypothèse d'expert, non issue du document source.
AFFINITY = {
    "IGGLIA": {"Mathematiques": 3, "Physique_Chimie": 1, "Informatique": 4},
    "ESIIA":  {"Mathematiques": 2, "Physique_Chimie": 4, "Informatique": 3},
    "IMTICIA":{"Informatique": 3, "Arts": 3, "Francais": 1, "Anglais": 1},
    "ISAIA":  {"Mathematiques": 4, "Economie": 2, "Informatique": 2},
    "EMII":   {"Mathematiques": 2, "Physique_Chimie": 4, "Informatique": 1},
    "ICMP":   {"Physique_Chimie": 3, "SVT": 2, "Mathematiques": 2},
    "GCA":    {"Mathematiques": 3, "Physique_Chimie": 3, "Arts": 2},
    "IAA":    {"SVT": 4, "Physique_Chimie": 2, "Mathematiques": 1},
    "AEE":    {"SVT": 4, "Histoire_Geo": 2, "Economie": 1},
    "PIP":    {"SVT": 4, "Physique_Chimie": 2, "Mathematiques": 1},
    "CAA":    {"Economie": 4, "Francais": 2, "Anglais": 2, "Mathematiques": 1},
    "EMP":    {"Economie": 4, "Mathematiques": 2, "Histoire_Geo": 1},
    "FIC":    {"Economie": 4, "Mathematiques": 3},
    "DTJA":   {"Francais": 3, "Malgache": 2, "Philosophie": 3, "Histoire_Geo": 2},
    "TEE":    {"Anglais": 3, "Francais": 2, "Malgache": 1, "Histoire_Geo": 2},
    "TEH":    {"Anglais": 3, "Francais": 2, "Malgache": 1, "Histoire_Geo": 2, "Arts": 1},
}

INTERESTS_BY_MENTION = {
    "Informatique et Télécommunications": ["Technologie", "Jeux vidéo", "Robotique", "Programmation", "Réseaux sociaux et numérique"],
    "Génie Industriel": ["Mécanique", "Bricolage", "Électronique", "Industrie", "Automobile et aéronautique"],
    "Génie Civil et Architecture": ["Construction", "Architecture", "Dessin et design", "Urbanisme"],
    "Biotechnologie et Agronomie": ["Nature", "Agriculture", "Santé", "Animaux", "Environnement"],
    "Droit et Techniques des Affaires": ["Économie", "Entrepreneuriat", "Actualité et politique", "Débat et droit", "Gestion"],
    "Tourisme": ["Voyage", "Cultures du monde", "Langues étrangères", "Gastronomie", "Hôtellerie"],
}

GENERIC_INTERESTS = ["Sport", "Musique", "Lecture", "Bénévolat associatif", "Réseaux sociaux"]

ENV_TRAVAIL_BY_MENTION = {
    "Informatique et Télécommunications": ["Bureau/Numérique", "Bureau/Numérique", "Mixte/Itinérant"],
    "Génie Industriel": ["Atelier/Industriel", "Atelier/Industriel", "Terrain/Extérieur"],
    "Génie Civil et Architecture": ["Chantier/BTP", "Chantier/BTP", "Bureau d'études"],
    "Biotechnologie et Agronomie": ["Laboratoire/Recherche", "Terrain/Extérieur", "Terrain/Extérieur"],
    "Droit et Techniques des Affaires": ["Bureau/Numérique", "Contact clientèle/Relationnel"],
    "Tourisme": ["Contact clientèle/Relationnel", "Mixte/Itinérant", "Mixte/Itinérant"],
}

GENERIC_SOFTSKILLS = [
    "rigueur", "autonomie", "esprit d'analyse", "créativité", "sens de l'observation",
    "aisance relationnelle", "curiosité", "esprit d'équipe", "sens de l'organisation",
    "persévérance",
]

ACTIVITY_TEMPLATES_BY_MENTION = {
    "Informatique et Télécommunications": [
        "a suivi un tutoriel en ligne de programmation et créé un petit site web personnel",
        "a participé à un club informatique ou de robotique au lycée",
        "a monté et dépanné des ordinateurs pour son entourage",
        "a créé un compte de jeu vidéo compétitif et anime une petite communauté en ligne",
    ],
    "Génie Industriel": [
        "a démonté et réparé des appareils électroménagers ou mécaniques par curiosité",
        "a participé à un club de robotique ou de modélisme",
        "a effectué un stage d'observation dans un atelier ou une usine",
        "aide régulièrement à l'entretien de véhicules en famille",
    ],
    "Génie Civil et Architecture": [
        "a réalisé des maquettes ou des plans de construction pour un projet scolaire",
        "aime dessiner des plans de maisons ou des croquis d'aménagement",
        "a visité un chantier de construction dans le cadre d'un stage d'observation",
    ],
    "Biotechnologie et Agronomie": [
        "a participé à un club de sciences naturelles ou d'écologie",
        "aide régulièrement dans l'exploitation agricole familiale",
        "a réalisé un exposé scolaire sur la santé ou la biologie",
        "s'occupe d'un petit élevage ou d'un jardin potager",
    ],
    "Droit et Techniques des Affaires": [
        "a organisé une petite activité commerciale ou un projet associatif",
        "a participé à un club de débat ou un simulacre de procès au lycée",
        "gère les comptes d'une association d'élèves",
        "s'intéresse à l'actualité économique et suit des chaînes d'information",
    ],
    "Tourisme": [
        "a organisé un voyage ou un événement pour son groupe d'amis",
        "pratique l'anglais ou une autre langue étrangère en autodidacte",
        "a effectué un stage d'observation dans un hôtel ou une agence de voyage",
        "aime cuisiner et découvrir des plats d'autres cultures",
    ],
}
GENERIC_ACTIVITIES = [
    "pratique un sport en club depuis plusieurs années",
    "participe à des activités associatives ou de bénévolat",
    "a occupé un petit job ou une activité rémunérée pendant les vacances",
]

REGIONS = [
    "Alaotra-Mangoro", "Amoron'i Mania", "Analamanga", "Analanjirofo", "Androy",
    "Anosy", "Atsimo-Andrefana", "Atsimo-Atsinanana", "Atsinanana", "Betsiboka",
    "Boeny", "Bongolava", "Diana", "Haute Matsiatra", "Ihorombe", "Itasy",
    "Melaky", "Menabe", "Sava", "Sofia", "Vakinankaratra", "Vatovavy", "Fitovinany",
]

ALL_BAC_SERIES = BAC_SERIES_REFERENCE

CODES = list(PARCOURS.keys())

# Pondération relative de "popularité"/fréquence de candidature par parcours.
# HYPOTHÈSE (non issue du document) introduite pour éviter une distribution
# strictement uniforme et donc irréaliste ; documentée comme biais potentiel.
POPULARITY_WEIGHT = {
    "IGGLIA": 1.4, "ISAIA": 1.3, "IMTICIA": 1.1, "ESIIA": 0.9,
    "EMII": 0.9, "ICMP": 0.6, "GCA": 1.0,
    "IAA": 0.9, "AEE": 0.8, "PIP": 0.6,
    "CAA": 1.2, "EMP": 1.0, "FIC": 1.1, "DTJA": 0.9,
    "TEE": 0.7, "TEH": 1.0,
}


def clamp(v, lo=0, hi=20):
    return max(lo, min(hi, v))


def gen_grades(target_code, generalist):
    """Génère des notes /20 pour les matières de lycée, avec un bonus
    d'affinité pour le parcours cible (sauf profils 'généralistes')."""
    grades = {}
    base = random.gauss(11.5, 2.0)
    affinity = {} if generalist else AFFINITY.get(target_code, {})
    for subj in LYCEE_SUBJECTS:
        boost = affinity.get(subj, 0)
        noise = random.gauss(0, 1.5)
        grade = base + boost + noise
        grades[subj] = round(clamp(grade), 1)
    return grades


def pick_bac_serie(target_code, grades):
    """Choisit uniquement une série admise selon la règle ISPM publiée.

    A2 est admise en Biotechnologie/Agronomie sous condition de note de
    mathématiques >= 12/20 ; cette condition est appliquée ici afin de ne pas
    apprendre au modèle à recommander un parcours administrativement invalide.
    """
    allowed = PARCOURS[target_code]["bac_series"]
    if "condition_a2" in PARCOURS[target_code] and grades["Mathematiques"] < 12:
        allowed = [serie for serie in allowed if serie != "A2"]
    return random.choice(allowed)


def classify_bac(serie):
    """Conserve la voie nationale à côté du code de série exact."""
    if serie in GENERAL_BAC_SERIES:
        return "Général", "Enseignement général"
    if serie in {"TGC", "TGI", "TTER"}:
        return "Technologique", {
            "TGC": "Génie civil", "TGI": "Industriel", "TTER": "Tertiaire",
        }[serie]
    if serie in TECH_GENIE_CIVIL:
        return "Professionnel et technique", "Génie civil / BTP"
    if serie in TECH_INDUSTRIEL:
        return "Professionnel et technique", "Industriel"
    if serie in TECH_AGRICOLE:
        return "Professionnel et technique", "Agricole"
    if serie in TECH_TERTIAIRE:
        return "Professionnel et technique", "Tertiaire"
    raise ValueError(f"Série de baccalauréat inconnue : {serie}")


def top_subjects_from_grades(grades, k=(3, 5)):
    ranked = sorted(grades.items(), key=lambda x: x[1], reverse=True)
    n = random.randint(*k)
    chosen = [s for s, _ in ranked[:n]]
    # bruit : parfois on remplace une matière "top" par une matière aléatoire
    # (préférence subjective qui ne colle pas parfaitement aux notes)
    if random.random() < 0.25 and len(chosen) > 1:
        idx = random.randrange(len(chosen))
        chosen[idx] = random.choice(LYCEE_SUBJECTS)
    return sorted(set(chosen))


def gen_competences(target_code, secondary_code=None):
    pool = list(PARCOURS[target_code]["competences"])
    if secondary_code:
        pool += list(PARCOURS[secondary_code]["competences"])
    n_domain = random.randint(1, 3)
    chosen = random.sample(pool, min(n_domain, len(pool)))
    n_soft = random.randint(2, 4)
    chosen += random.sample(GENERIC_SOFTSKILLS, n_soft)
    random.shuffle(chosen)
    return chosen


def gen_interests(mention, secondary_mention=None):
    pool = list(INTERESTS_BY_MENTION[mention])
    if secondary_mention and secondary_mention != mention:
        pool += list(INTERESTS_BY_MENTION[secondary_mention])
    n_domain = random.randint(1, 2)
    chosen = random.sample(pool, min(n_domain, len(pool)))
    if random.random() < 0.6:
        chosen.append(random.choice(GENERIC_INTERESTS))
    return list(dict.fromkeys(chosen))


def gen_activities(mention, secondary_mention=None):
    pool = list(ACTIVITY_TEMPLATES_BY_MENTION[mention])
    if secondary_mention and secondary_mention != mention:
        pool += list(ACTIVITY_TEMPLATES_BY_MENTION[secondary_mention])
    n = random.randint(1, 2)
    chosen = random.sample(pool, min(n, len(pool)))
    if random.random() < 0.5:
        chosen.append(random.choice(GENERIC_ACTIVITIES))
    return chosen


def gen_pro_prefs(target_code):
    debouches = PARCOURS[target_code]["debouches"]
    n = random.randint(1, 2)
    chosen = random.sample(debouches, min(n, len(debouches)))
    generic_aspirations = [
        "avoir un métier stable", "créer sa propre entreprise",
        "travailler à l'international", "contribuer au développement de Madagascar",
        "avoir un poste à responsabilités",
    ]
    if random.random() < 0.35:
        chosen.append(random.choice(generic_aspirations))
    return chosen


def gen_env_travail(mention, secondary_mention=None):
    pool = list(ENV_TRAVAIL_BY_MENTION[mention])
    if secondary_mention and secondary_mention != mention and random.random() < 0.3:
        pool += list(ENV_TRAVAIL_BY_MENTION[secondary_mention])
    return random.choice(pool)


def build_profile(idx):
    weights = [POPULARITY_WEIGHT[c] for c in CODES]
    target = random.choices(CODES, weights=weights, k=1)[0]
    mention = PARCOURS[target]["mention"]

    ambiguous = random.random() < AMBIGUOUS_RATE
    secondary = None
    if ambiguous:
        candidates = PASSERELLES.get(target, [])
        if not candidates:
            candidates = [c for c in CODES if PARCOURS[c]["mention"] == mention and c != target]
        secondary = random.choice(candidates) if candidates else None
    secondary_mention = PARCOURS[secondary]["mention"] if secondary else None

    generalist = random.random() < GENERALIST_RATE
    grades = gen_grades(target, generalist)
    moyenne = round(stats.mean(grades.values()), 2)
    serie_bac = pick_bac_serie(target, grades)
    voie_bac, domaine_technique = classify_bac(serie_bac)

    profile = {
        "profil_id": f"P{idx:05d}",
        "age": random.choice([17, 18, 19, 20]),
        "sexe": random.choice(["F", "M"]),  # indépendant du parcours (contrôle anti-biais)
        "region": random.choice(REGIONS),   # indépendant du parcours (contrôle anti-biais)
        "voie_bac": voie_bac,
        "serie_bac": serie_bac,
        "domaine_technique_bac": domaine_technique if voie_bac != "Général" else "",
        "moyenne_generale": moyenne,
        **{f"note_{k.lower()}": v for k, v in grades.items()},
        "matieres_preferees": top_subjects_from_grades(grades),
        "competences_declarees": gen_competences(target, secondary),
        "centres_interet": gen_interests(mention, secondary_mention),
        "activites_projets": gen_activities(mention, secondary_mention),
        "preferences_professionnelles": gen_pro_prefs(target),
        "environnement_travail_recherche": gen_env_travail(mention, secondary_mention),
        "mention_recommandee": mention,
        "parcours_recommande": target,
        "parcours_recommande_nom": PARCOURS[target]["nom"],
        "profil_ambigu": ambiguous,
        "parcours_alternatif_plausible": secondary or "",
    }
    return profile


def main():
    profiles = [build_profile(i) for i in range(1, N_PROFILES + 1)]

    # ---------- Écriture JSONL (format riche, listes natives) ----------
    with open("../data/ispm_orientation_dataset.jsonl", "w", encoding="utf-8") as f:
        for p in profiles:
            f.write(json.dumps(p, ensure_ascii=False) + "\n")

    # ---------- Écriture CSV (format tabulaire, listes en chaînes ';') --
    list_fields = [
        "matieres_preferees", "competences_declarees", "centres_interet",
        "activites_projets", "preferences_professionnelles",
    ]
    csv_rows = []
    for p in profiles:
        row = dict(p)
        for lf in list_fields:
            row[lf] = "; ".join(row[lf])
        csv_rows.append(row)

    fieldnames = list(csv_rows[0].keys())
    with open("../data/ispm_orientation_dataset.csv", "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(csv_rows)

    return profiles


if __name__ == "__main__":
    profiles = main()
    print(f"{len(profiles)} profils générés.")
