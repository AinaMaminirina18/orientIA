# -*- coding: utf-8 -*-
"""
Base de connaissance de référence, extraite manuellement du document fourni
(brochures / site officiel ISPM / groupe Facebook des promotions).
Cette structuration constitue une étape de NORMALISATION documentée :
les champs texte libres (ex. "prerequis") ont été relus et convertis en
listes de séries de baccalauréat exploitables par le générateur.
"""

# Référentiel d'admission consulté le 2026-08-27. L'ISPM nomme des familles
# techniques, tandis que les examens malgaches ont des séries/spécialités
# distinctes. Le modèle stocke donc les codes réels et dérive leur famille.
ADMISSION_SOURCE = {
    "titre": "ISPM — Conditions d'accès en première année",
    "url": "https://ispm-edu.com/inscription.php",
    "statut": "officiel",
    "date_consultation": "2026-08-27",
}

GENERAL_BAC_SERIES = ["A1", "A2", "C", "D", "L", "OSE", "S"]

# Bac technologique (T*) et baccalauréat professionnel et technique.
# Source des codes : Wiki iRENALA (plateforme institutionnelle malgache),
# complétée par les catégories publiées par l'ISPM et le texte CNLEGIS.
TECH_GENIE_CIVIL = ["TGC", "CCBTP", "PCBTP"]
TECH_INDUSTRIEL = ["TGI", "DAMB", "EN", "TPFM", "TAMB", "TMEL", "TFFI", "TMA", "MEMA", "TMF", "TOM"]
TECH_AGRICOLE = ["TAG", "TEV"]
TECH_TERTIAIRE = ["TTER", "ACTC", "CG", "SS"]
BAC_SERIES_REFERENCE = GENERAL_BAC_SERIES + TECH_GENIE_CIVIL + TECH_INDUSTRIEL + TECH_AGRICOLE + TECH_TERTIAIRE

PARCOURS = {
    "IGGLIA": {
        "nom": "Informatique de Gestion, Génie Logiciel et Intelligence Artificielle",
        "mention": "Informatique et Télécommunications",
        "bac_series": ["C", "D", "S"] + TECH_INDUSTRIEL,
        "debouches": [
            "Ingénieur en génie logiciel", "Architecte logiciel",
            "Développeur Full-Stack (Web & Mobile)", "Administrateur de bases de données",
            "Chef de projet informatique", "Consultant en systèmes d'information et IA",
            "Expert en transformation digitale",
        ],
        "competences": [
            "conception logicielle (UML, Merise)", "développement full-stack",
            "administration de bases de données", "gestion de projets informatiques",
            "programmation multi-langages (Java, C#, PHP, JavaScript)",
            "notions d'intelligence artificielle",
        ],
    },
    "ESIIA": {
        "nom": "Électronique, Systèmes Informatiques et Intelligence Artificielle",
        "mention": "Informatique et Télécommunications",
        "bac_series": ["C", "D", "S"] + TECH_INDUSTRIEL,
        "debouches": [
            "Ingénieur système et réseau", "Spécialiste en maintenance de systèmes informatisés",
            "Expert en systèmes embarqués et IoT", "Ingénieur en télécommunications",
            "Architecte Hardware", "Spécialiste en robotique et domotique",
        ],
        "competences": [
            "systèmes embarqués et IoT", "administration de réseaux (GSM, TCP/IP)",
            "maintenance hardware et microcontrôleurs", "traitement du signal et automatique",
            "robotique et domotique",
        ],
    },
    "IMTICIA": {
        "nom": "Informatique Multimédia, Technologie de l'Information et de la Communication et Intelligence Artificielle",
        "mention": "Informatique et Télécommunications",
        "bac_series": ["C", "D", "S"] + TECH_INDUSTRIEL,
        "debouches": [
            "Développeur multimédia", "Webmaster", "UX/UI Designer",
            "Ingénieur en technologies de la communication",
            "Spécialiste en communication digitale / Community Manager",
            "Directeur artistique numérique / Motion Designer",
        ],
        "competences": [
            "production et montage audiovisuel", "design UI/UX",
            "développement web et mobile multimédia", "communication digitale et PAO",
        ],
    },
    "ISAIA": {
        "nom": "Informatique, Statistique Appliquée et Intelligence Artificielle",
        "mention": "Informatique et Télécommunications",
        "bac_series": ["C", "D", "S"] + TECH_INDUSTRIEL,
        "debouches": [
            "Data Scientist", "Data Analyst", "Ingénieur Machine Learning",
            "Statisticien financier", "Analyste Big Data", "Responsable Business Intelligence",
        ],
        "competences": [
            "analyse statistique et probabilités appliquées", "machine learning et deep learning",
            "business intelligence", "traitement de données massives (Big Data)",
        ],
    },
    "EMII": {
        "nom": "Électromécanique et Informatique Industrielle",
        "mention": "Génie Industriel",
        "bac_series": ["C", "D", "S"] + TECH_INDUSTRIEL,
        "debouches": [
            "Ingénieur en maintenance industrielle", "Ingénieur en électrotechnique",
            "Responsable de production en usine", "Ingénieur en automatisation et robotique industrielle",
            "Concepteur de systèmes IoT industriels", "Ingénieur en bureau d'études mécanique",
        ],
        "competences": [
            "maintenance industrielle pluridisciplinaire", "automatismes (Grafcet, automates)",
            "gestion de production industrielle", "électronique de puissance",
            "conception assistée par ordinateur (AutoCAD)",
        ],
    },
    "ICMP": {
        "nom": "Industries Chimiques, Minières et Pétrolières",
        "mention": "Génie Industriel",
        "bac_series": ["C", "D", "S"] + TECH_INDUSTRIEL,
        "debouches": [
            "Ingénieur minier", "Ingénieur pétrolier", "Ingénieur en génie des procédés chimiques",
            "Responsable HSE", "Ingénieur de laboratoire d'analyses",
        ],
        "competences": [
            "génie des procédés chimiques", "exploitation minière et géologie",
            "raffinage et pétrochimie", "hygiène sécurité environnement (HSE)",
            "analyses de laboratoire",
        ],
    },
    "GCA": {
        "nom": "Génie Civil et Architecture",
        "mention": "Génie Civil et Architecture",
        "bac_series": ["C", "D", "S"] + TECH_GENIE_CIVIL,
        "debouches": [
            "Ingénieur en Bureau d'Études", "Architecte junior", "Conducteur de travaux",
            "Urbaniste", "Entrepreneur en BTP", "Ingénieur en génie civil",
        ],
        "competences": [
            "conception architecturale (AutoCAD/ArchiCAD)", "calcul de structures (RDM)",
            "gestion de chantier", "ingénierie des infrastructures routières et hydrauliques",
            "géotechnique",
        ],
    },
    "IAA": {
        "nom": "Industries Agroalimentaires",
        "mention": "Biotechnologie et Agronomie",
        "bac_series": ["C", "D", "S", "A2"] + TECH_AGRICOLE,
        "condition_a2": "A2 admise si note de mathématiques >= 12/20",
        "debouches": [
            "Ingénieur de production en industrie agroalimentaire", "Responsable Qualité et Hygiène",
            "Chargé de R&D alimentaire", "Chef de production", "Consultant qualité",
        ],
        "competences": [
            "transformation agroalimentaire", "normes HACCP et microbiologie",
            "biochimie et R&D", "sécurité alimentaire",
        ],
    },
    "AEE": {
        "nom": "Agriculture et Élevage",
        "mention": "Biotechnologie et Agronomie",
        "bac_series": ["C", "D", "S", "A2"] + TECH_AGRICOLE,
        "condition_a2": "A2 admise si note de mathématiques >= 12/20",
        "debouches": [
            "Ingénieur Agronome", "Conseiller agricole", "Responsable de projet développement rural",
            "Expert en agri-business", "Responsable de production animale", "Consultant en agroécologie",
        ],
        "competences": [
            "productions végétales et animales", "développement rural",
            "agroécologie et agriculture biologique", "zootechnie et pisciculture",
        ],
    },
    "PIP": {
        "nom": "Pharmacologie et Industries Pharmaceutiques",
        "mention": "Biotechnologie et Agronomie",
        "bac_series": ["C", "D", "S", "A2"] + TECH_AGRICOLE,
        "condition_a2": "A2 admise si note de mathématiques >= 12/20",
        "debouches": [
            "Responsable de production pharmaceutique", "Chercheur en phyto-médicaments",
            "Ingénieur de laboratoire médical", "Délégué médical", "Responsable contrôle qualité",
        ],
        "competences": [
            "formulation pharmaceutique", "phytochimie", "pharmacologie",
            "gestion de laboratoire d'analyses médicales",
        ],
    },
    "CAA": {
        "nom": "Commerce et Administration des Affaires",
        "mention": "Droit et Techniques des Affaires",
        "bac_series": BAC_SERIES_REFERENCE,
        "admission_toutes_series": True,
        "debouches": [
            "Responsable Marketing", "Gestionnaire administratif et financier",
            "Responsable commercial", "Responsable export", "Analyste de marché",
            "Manager de PME/PMI",
        ],
        "competences": [
            "stratégie marketing et commerciale", "analyse financière et gestion budgétaire",
            "négociation et vente internationale", "gestion d'entreprise",
        ],
    },
    "EMP": {
        "nom": "Économie et Management de Projet",
        "mention": "Droit et Techniques des Affaires",
        "bac_series": BAC_SERIES_REFERENCE,
        "admission_toutes_series": True,
        "debouches": [
            "Chef de projet", "Analyste économique", "Consultant en management",
            "Responsable suivi-évaluation de projets", "Planificateur stratégique",
        ],
        "competences": [
            "pilotage et planification de projets", "analyse économique et économétrie",
            "gestion financière prévisionnelle", "management stratégique",
        ],
    },
    "FIC": {
        "nom": "Finances et Comptabilité",
        "mention": "Droit et Techniques des Affaires",
        "bac_series": BAC_SERIES_REFERENCE,
        "admission_toutes_series": True,
        "debouches": [
            "Chef Comptable", "Directeur Administratif et Financier",
            "Auditeur financier", "Contrôleur de gestion", "Trésorier d'entreprise",
        ],
        "competences": [
            "comptabilité générale et analytique", "audit financier",
            "fiscalité d'entreprise", "gestion de trésorerie",
        ],
    },
    "DTJA": {
        "nom": "Droit et Techniques Juridiques des Affaires",
        "mention": "Droit et Techniques des Affaires",
        "bac_series": BAC_SERIES_REFERENCE,
        "admission_toutes_series": True,
        "debouches": [
            "Juriste d'affaires", "Responsable des ressources humaines (volet juridique)",
            "Assistant juridique", "Expert en contentieux d'affaires", "Chargé de conformité",
        ],
        "competences": [
            "droit des contrats et des sociétés", "rédaction d'actes juridiques",
            "gestion des litiges commerciaux", "droit foncier et minier",
        ],
    },
    "TEE": {
        "nom": "Tourisme et Environnement",
        "mention": "Tourisme",
        "bac_series": BAC_SERIES_REFERENCE,
        "admission_toutes_series": True,
        # La page officielle décrit l'objectif de la filière, mais ne publie
        # pas de maquette détaillée ; les éléments ci-dessous restent donc
        # volontairement génériques et ne sont pas des intitulés d'UE.
        "debouches": [
            "Professionnel du secteur du tourisme",
            "Chargé de valorisation touristique et environnementale",
        ],
        "competences": [
            "connaissance du patrimoine environnemental et culturel malgache",
            "sensibilisation au tourisme durable",
        ],
    },
    "TEH": {
        "nom": "Tourisme, Environnement et Hôtellerie",
        "mention": "Tourisme",
        "bac_series": BAC_SERIES_REFERENCE,
        "admission_toutes_series": True,
        "debouches": [
            "Directeur d'établissement hôtelier", "Manager d'agence de voyage",
            "Responsable écotourisme", "Organisateur d'événements (MICE)",
            "Chef de produit touristique", "Gestionnaire de sites protégés",
        ],
        "competences": [
            "management hôtelier et restauration", "conception de produits touristiques",
            "accueil et relation client", "gestion environnementale de sites touristiques",
            "langues étrangères",
        ],
    },
}

# Passerelles telles que mentionnées dans le document (utilisées pour générer
# des profils "ambigus" réalistes entre deux parcours proches).
PASSERELLES = {
    "IGGLIA": ["IMTICIA"],
    "ESIIA": ["EMII"],
    "IMTICIA": ["IGGLIA"],
    "ISAIA": ["IGGLIA"],
    "EMII": ["ESIIA"],
    "ICMP": ["IAA"],
    "GCA": [],
    "IAA": ["PIP"],
    "AEE": ["IAA"],
    "PIP": ["ICMP"],
    "CAA": ["EMP"],
    "EMP": ["CAA", "FIC"],
    "FIC": ["CAA"],
    "DTJA": [],
    "TEE": ["TEH"],
    "TEH": ["TEE"],
}
