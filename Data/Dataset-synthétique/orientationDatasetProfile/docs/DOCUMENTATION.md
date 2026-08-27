# Dataset synthétique — Aide à l'orientation (ISPM)

Ce jeu de données a été **entièrement généré de façon synthétique** afin d'entraîner
un modèle d'aide à l'orientation reliant un profil de candidat (bachelier) à un
parcours parmi les 16 parcours de l'ISPM publiés par l'établissement.

Aucune donnée réelle d'élève n'a été utilisée. Le document source a servi
uniquement de **base de connaissance** pour dériver, pour chaque parcours :
la mention de rattachement, les débouchés professionnels, les compétences
développées et les conditions d'admission publiées. Les sources primaires sont
précisées dans le corpus pédagogique :
`https://ispm-edu.com/inscription.php`, `https://ispm-edu.com/filieres.php`
et `https://ispm-edu.com/presentation.php` (consultées le 2026-08-27).

## Fichiers livrés

| Fichier | Contenu |
|---|---|
| `ispm_orientation_dataset.csv` | 1600 profils, format tabulaire (listes en texte séparé par `;`) |
| `ispm_orientation_dataset.jsonl` | Mêmes 1600 profils, un JSON par ligne, listes natives (recommandé pour l'entraînement) |
| `reference_parcours.py` | Base de connaissance structurée extraite du document source |
| `dataset_validation_report.txt` | Résultat des contrôles de cohérence et statistiques descriptives |
| `DOCUMENTATION.md` | Ce document |

## 1. Méthode de génération

Génération **procédurale, pilotée par des règles et de l'échantillonnage
probabiliste** (pas de LLM ni de modèle génératif tiers), en Python, avec une
graine aléatoire fixe (`seed = 42`) pour la reproductibilité.

Pour chaque profil :

1. **Tirage du parcours cible** (`parcours_recommande`) parmi les 16 codes,
   pondéré par une popularité relative supposée (voir *Hypothèses*).
2. **Tirage d'un statut « ambigu »** (~20 % des profils) : le profil est alors
   construit à cheval entre le parcours cible et un parcours proche (passerelle
   documentée dans la source, ou parcours de la même mention à défaut).
   Le champ `parcours_alternatif_plausible` conserve ce second parcours.
3. **Notes de lycée** (`note_*`, 12 matières classiques du secondaire
   malgache : Mathématiques, Physique-Chimie, SVT, Français, Malgache, Anglais,
   Histoire-Géo, Philosophie, Économie, Informatique, Arts, EPS) : tirées
   autour d'une moyenne de base (loi normale), puis **rehaussées** pour les
   matières jugées proches du parcours cible (table `AFFINITY`), avec un bruit
   gaussien additionnel. ~15 % des profils sont générés « généralistes »
   (sans rehaussement) pour représenter des candidats sans dominante nette.
   Toutes les notes sont bornées à [0, 20].
4. **Série de baccalauréat** : tirée parmi les séries explicitement admises
   par l'ISPM. Les données conservent le code réel de la série (`serie_bac`) et
   sa voie (`voie_bac`) : général (A1, A2, C, D, L, OSE, S), technologique
   (TGC, TGI, TTER) ou professionnel et technique (dont CCBTP, PCBTP, EN,
   TAG, TEV). Les familles demandées par l'ISPM sont appliquées ensuite :
   industriel pour informatique/génie industriel, génie civil/BTP pour GCA,
   agricole pour biotechnologie/agronomie. Pour IAA, AEE et
   PIP, une série A2 n'est générée que si la note de mathématiques atteint
   12/20, conformément à la condition publiée. Aucun profil d'entraînement
   n'est étiqueté vers un parcours auquel il n'est pas administrativement admis.
5. **Matières préférées** : les 3 à 5 matières aux meilleures notes du profil,
   avec 25 % de chance qu'une matière soit remplacée aléatoirement (préférence
   subjective imparfaitement corrélée aux résultats scolaires — réalisme).
6. **Compétences déclarées** : mélange de compétences issues du parcours
   cible (et du parcours alternatif si profil ambigu) et de compétences
   transversales génériques (rigueur, autonomie, esprit d'équipe...).
7. **Centres d'intérêt / activités et projets réalisés** : tirés dans des
   banques de textes courts propres à la mention du parcours cible, mélangés
   à des éléments génériques (sport, bénévolat...) non discriminants.
8. **Préférences professionnelles** : 1 à 2 métiers tirés dans la liste des
   débouchés professionnels du parcours cible (issue du document source),
   parfois complétés d'une aspiration générique (« créer son entreprise »...).
9. **Environnement de travail recherché** : catégorie tirée dans une table de
   correspondance mention → environnements types (bureau, laboratoire,
   chantier, atelier, terrain, relation client...).
10. **Champs de contrôle non corrélés au parcours** : `sexe`, `age`, `region`
    (couverture des 23 régions de Madagascar) sont tirés de façon totalement
    indépendante du parcours cible, afin d'éviter d'introduire un biais
    démographique ou géographique exploitable par le modèle (voir contrôle
    n°8 du rapport de validation).

## 2. Hypothèses utilisées

Ces hypothèses **ne proviennent pas du document source** et ont été ajoutées
pour rendre la génération possible et réaliste. Elles doivent être révisées
par un expert métier (conseiller d'orientation, direction des études ISPM)
avant tout usage en production :

- **Popularité relative des parcours** (`POPULARITY_WEIGHT`) : pondération
  arbitraire supposant que les parcours informatiques et « affaires » attirent
  davantage de candidats que les parcours miniers/pharmaceutiques. Non vérifiée
  par des données d'admission réelles.
- **Table d'affinité matières lycée ↔ parcours** (`AFFINITY`) : mapping construit
  par jugement d'expert (ex. IGGLIA valorisé par de bonnes notes en
  Mathématiques/Informatique) car le document source ne liste que des matières
  *universitaires* (post-bac), pas les matières de lycée. Cette table est une
  approximation raisonnable mais non validée empiriquement.
- **Correspondance mention → centres d'intérêt / environnement de travail** :
  déduite du bon sens métier à partir des débouchés listés dans le document,
  et non d'une enquête ou d'un référentiel officiel.
- **Indépendance stricte entre sexe/région et parcours recommandé** : hypothèse
  volontaire (contrôle anti-biais) — dans la réalité, certaines disparités
  démographiques peuvent exister par filière, mais les reproduire dans un
  jeu d'entraînement risquerait de les enraciner dans le modèle.
- **Taux cibles de bruit** : 20 % de profils ambigus, 15 % de profils
  « généralistes » — valeurs choisies pour obtenir
  un jeu ni trivialement séparable, ni ingérable, mais **arbitraires**.
- **Grades générés par loi normale indépendante par matière** : simplification
  qui ignore les corrélations réelles entre matières (ex. un bon niveau en
  Physique est souvent corrélé à un bon niveau en Mathématiques dans la
  réalité, ce qui n'est capté ici qu'indirectement via la table d'affinité).

## 3. Biais potentiellement introduits

- **Biais de couverture des sources** : certains parcours (ex. `DTJA`, `CAA`,
  `FIC`) ne reposaient dans le document source que sur 1 seule source
  documentaire (contre 3 pour la plupart des parcours informatiques), ce qui
  a pu conduire à un profil de compétences/débouchés moins riche et donc à
  moins de variété lexicale générée pour ces parcours.
- **Biais de « mots-clés »** : les listes de compétences, débouchés, centres
  d'intérêt et activités sont tirées de banques finies (issues ou dérivées du
  document). Un modèle entraîné sur ce seul jeu pourrait apprendre des
  raccourcis lexicaux (associer un mot-clé précis à un parcours) plutôt qu'un
  raisonnement de profil global. Cela peut sur-estimer la performance du
  modèle sur des données synthétiques par rapport à des données réelles, où
  le vocabulaire est bien plus varié.
- **Biais de popularité arbitraire** : la distribution des classes (voir
  rapport de validation, contrôle n°6) reflète la pondération artificielle
  `POPULARITY_WEIGHT` et non une réalité d'admission constatée. Un modèle
  entraîné directement sur ces proportions hériterait de ce biais s'il était
  utilisé pour estimer des taux de candidature réels.
- **Biais lié à l'absence de données réelles de validation** : aucune
  confrontation n'a été faite avec des dossiers d'anciens élèves ISPM ; la
  cohérence du jeu de données repose uniquement sur la logique interne du
  générateur, pas sur une vérité de terrain.
- **Biais linguistique et culturel** : le vocabulaire des matières, métiers et
  activités reflète le contexte scolaire/professionnel malgache francophone
  tel que décrit dans le document source ; le jeu de données n'est pas
  transférable tel quel à un autre système éducatif.
- **Biais de simplicité des notes** : le tirage des notes par loi normale
  indépendante par matière ne reproduit pas la structure de corrélation réelle
  des résultats scolaires (élèves globalement « scientifiques » ou
  « littéraires »), ce qui peut rendre les profils plus « bruités » que des
  profils réels, mais aussi moins réalistes dans leur cohérence interne.

## 4. Contrôles de cohérence appliqués

Le script `validate_dataset.py` exécute automatiquement les contrôles
suivants (résultats complets dans `dataset_validation_report.txt`) :

1. Unicité des identifiants de profil (`profil_id`).
2. Toutes les notes (matières + moyenne générale) sont bornées à [0, 20].
3. Les champs « liste » (matières préférées, compétences, centres d'intérêt,
   activités, préférences professionnelles) respectent une longueur minimale
   et ne sont jamais vides.
4. Les séries de baccalauréat appartiennent à un référentiel connu et fermé.
5. La `moyenne_generale` stockée correspond bien à la moyenne recalculée des
   notes détaillées (tolérance 0,05 point).
6. Calcul et publication de la distribution des classes cibles
   (`parcours_recommande`) pour documenter le déséquilibre introduit.
7. Vérification que le taux de profils « ambigus » est proche du taux cible
   (~20 %).
8. **Contrôle anti-biais** : vérification que la proportion homme/femme par
   parcours reste proche de la parité (aucune corrélation injectée entre le
   sexe et le parcours recommandé).
9. Vérification de l'admissibilité de chaque profil selon la série déclarée,
   la voie technique concernée et, pour A2 en biotechnologie/agronomie, la
   note minimale de mathématiques.
10. Mesure (proxy statistique, écart-type des notes) du taux de profils au
    profil scolaire globalement plat, à titre indicatif.

Résultat de la dernière exécution : **aucune erreur bloquante détectée**
(1600/1600 profils valides). Le détail chiffré (répartition des classes,
taux de bruit effectifs, etc.) est disponible dans
`dataset_validation_report.txt`.

## 5. Dictionnaire des données (colonnes)

| Champ | Type | Description |
|---|---|---|
| `profil_id` | string | Identifiant unique du profil synthétique |
| `age` | int | Âge simulé (17–20 ans) |
| `sexe` | string | F/M — tiré indépendamment du parcours (contrôle anti-biais) |
| `region` | string | Région de Madagascar simulée — indépendante du parcours |
| `serie_bac` | string | Série de baccalauréat simulée |
| `voie_bac` | string | Voie nationale : Général, Technologique ou Professionnel et technique |
| `domaine_technique_bac` | string | Domaine de la série technique, vide pour la voie générale |
| `moyenne_generale` | float | Moyenne des 12 notes de lycée |
| `note_<matiere>` | float | Note simulée /20 pour chaque matière de lycée |
| `matieres_preferees` | liste | Matières déclarées préférées par le candidat |
| `competences_declarees` | liste | Compétences (domaine + transversales) déclarées |
| `centres_interet` | liste | Centres d'intérêt déclarés |
| `activites_projets` | liste | Activités ou projets déjà réalisés |
| `preferences_professionnelles` | liste | Métiers/aspirations professionnelles visés |
| `environnement_travail_recherche` | string | Type d'environnement de travail recherché |
| `mention_recommandee` | string | Mention ISPM cible (label large) |
| `parcours_recommande` | string | Code du parcours cible — **label principal** |
| `parcours_recommande_nom` | string | Nom complet du parcours cible |
| `profil_ambigu` | bool | Indique si le profil a été construit à cheval sur deux parcours |
| `parcours_alternatif_plausible` | string | Code du second parcours plausible si `profil_ambigu = true` |

## 6. Limites et recommandations d'usage

- Ce jeu est destiné à **amorcer** l'entraînement/le prototypage d'un modèle
  d'orientation ; il ne doit pas être présenté comme représentatif de la
  population réelle de candidats de l'ISPM.
- Avant mise en production, il est recommandé de : (a) faire valider les
  tables d'affinité et de popularité par un conseiller d'orientation ISPM,
  (b) enrichir le vocabulaire des banques de textes (compétences, activités)
  pour réduire le risque de raccourcis lexicaux, (c) confronter les
  prédictions du modèle à un échantillon, même petit, de dossiers réels.
- Le script (`generate_dataset.py`, seed = 42) est entièrement reproductible
  et paramétrable (nombre de profils, taux de bruit) pour générer des
  variantes ou des jeux de test additionnels.
