# Ontologie / Graphe de connaissances — ORIENT'IA

Cette extension symbolique complète le modèle statistique d'orientation par
une représentation explicite du domaine : offre de formation (mentions,
parcours, matières, compétences, débouchés) et profils d'étudiants, reliés
par des relations exploitables en requêtes (SPARQL) ou en parcours de graphe.

## Fichiers livrés

| Fichier | Rôle |
|---|---|
| `full_kb.json` | Base de connaissance structurée, extraite du document source (mentions, parcours, matières, compétences, débouchés, prérequis, passerelles, relations compétence→métier) |
| `ontology_schema.ttl` | **TBox seule** : classes + propriétés (à importer dans Protégé pour voir le schéma) |
| `knowledge_graph.ttl` | **TBox + ABox** : graphe complet peuplé, format Turtle |
| `knowledge_graph.owl` | Même graphe peuplé, format RDF/XML (alternative pour Protégé / autres outils OWL) |
| `nodes.csv` / `edges.csv` | Export "graphe de propriétés" (compatible Neo4j `LOAD CSV`, networkx, Gephi) pour les équipes ne souhaitant pas utiliser un triplestore OWL |
| `build_ontology.py` | Script de construction (reproductible) |
| `example_queries.sparql` | 6 requêtes commentées, une par cas d'usage demandé dans le sujet |
| `run_queries_demo.py` | Exécute ces 6 requêtes sur le graphe et affiche des résultats réels |
| `query_results_demo.txt` | Sortie de la dernière exécution des requêtes de démonstration |

## 1. Classes retenues

Les 9 classes demandées par le sujet sont toutes présentes :
`Etudiant`, `Formation`, `Mention`, `Parcours`, `Matiere`, `Competence`,
`Prerequis`, `Metier`, `CentreInteret`.

Choix de modélisation :
- `Parcours` et `Mention` sont modélisées comme deux sous-classes de
  `Formation` (une Mention regroupe plusieurs Parcours dans le document
  source — ex. la mention *Informatique et Télécommunications* regroupe
  IGGLIA, ESIIA, IMTICIA, ISAIA).
- `Competence` est subdivisée en deux sous-classes **non demandées
  explicitement mais nécessaires** pour rester fidèle à la source : le
  document distingue en réalité deux granularités de compétences —
  des compétences "larges" par parcours (`competences_developpees`, ex.
  *« Administration et optimisation de bases de données »*) et des
  compétences plus fines utilisées uniquement dans les paires
  compétence→métier (`relations_competences_metiers`, ex. *« Administration
  SGBDR »*). Elles sont représentées comme `CompetenceDisciplinaire` (les
  deux granularités y sont regroupées, faute de règle fiable pour les
  fusionner automatiquement — voir *Limites*) et `CompetenceTransversale`
  (compétences comportementales génériques : rigueur, autonomie...).
- `Matiere` porte une propriété de donnée `aNiveauMatiere` (`lycee` /
  `universite`) : le document source ne liste que des matières
  *universitaires* enseignées par chaque parcours, alors qu'un profil
  d'étudiant candidat s'exprime avec des matières de *lycée*. Les deux
  niveaux cohabitent dans la même classe `Matiere` pour permettre la
  relation `Etudiant prefere Matiere` sans créer une classe séparée non
  demandée par le sujet.
- `Prerequis` est peuplée par les séries de baccalauréat et les voies
  techniques explicitement distinguées par l'ISPM : `Technique industrielle`,
  `Technique génie civil / BTP` et `Technique agricole / élevage`. Les règles
  viennent de `https://ispm-edu.com/inscription.php` (consultée le
  2026-08-27), et non d'une catégorie générique « Technique ».

## 2. Relations retenues

### Relations demandées explicitement par le sujet (cœur du schéma)

| Relation | Domaine → Portée | Origine dans la source |
|---|---|---|
| `enseigne` | Parcours → Matière | champ `matieres_principales` |
| `developpe` | Parcours → Compétence | champ `competences_developpees` |
| `prepareA` | Parcours → Métier | champ `debouches_professionnels` |
| `necessite` | Parcours → Prérequis | champ `prerequis` (normalisé en séries de bac) |
| `possede` | Étudiant → Compétence | champ `competences_declarees` du profil |
| `prefere` | Étudiant → Matière | champ `matieres_preferees` du profil |
| `estRequisePour` | Compétence → Métier | champ `relations_competences_metiers` |

### Extensions ajoutées (documentées, non demandées telles quelles)

Ces relations ont été ajoutées car elles sont nécessaires pour que le graphe
réponde effectivement aux 6 cas d'usage listés dans le sujet — sans elles,
le graphe resterait une collection de triplets déconnectés (aucun moyen de
relier un Étudiant à une recommandation, ou un Parcours à sa Mention) :

| Relation | Domaine → Portée | Pourquoi |
|---|---|---|
| `appartientAMention` | Parcours → Mention | structure l'offre de formation ; nécessaire pour "parcourir les relations entre formations et métiers" à l'échelle d'une mention |
| `aCentreInteret` | Étudiant → CentreInteret | la classe `CentreInteret` est demandée dans l'énoncé mais aucune relation ne lui est explicitement associée dans la liste fournie |
| `aSerieBac` | Étudiant → Prérequis | indispensable pour le cas d'usage "vérifier des prérequis" (comparer le bac de l'étudiant aux prérequis du parcours) |
| `estOrienteVers` | Étudiant → Parcours | matérialise la sortie du modèle statistique dans le graphe, pour "expliquer une recommandation" et "compléter les résultats du modèle statistique" |
| `estEnseigneePar`, `estDeveloppeePar`, `preparePar` | inverses de `enseigne`, `developpe`, `prepareA` | facilitent le raisonnement multiétape en remontant d'un Métier ou d'une Matière vers les Parcours concernés |
| `provientDeSource` | Parcours → Source | rend chaque parcours traçable vers les pages officielles exactes ; l'URL, le statut et la date sont des propriétés de `Source` |

## 3. Peuplement du graphe (ABox)

- **6 Mentions**, **16 Parcours** (avec leur `appartientAMention`,
  `enseigne`, `developpe`, `prepareA`, `necessite`) directement dérivés de
  `full_kb.json`.
- Les parcours sont reliés aux trois pages ISPM suivantes :
  `https://ispm-edu.com/inscription.php`,
  `https://ispm-edu.com/filieres.php` et
  `https://ispm-edu.com/presentation.php` (consultées le 2026-08-27).
- Les effectifs détaillés de matières, compétences et métiers sont générés et
  affichés par `build_ontology.py` ; ils évoluent avec le corpus source.
- **`estRequisePour`** (Compétence → Métier) est peuplée à partir des
  relations compétence → métier du corpus.
- **40 Étudiants** sont échantillonnés dans le dataset synthétique
  (`ispm_orientation_dataset.jsonl`), avec leurs
  relations `aSerieBac`, `estOrienteVers`, `prefere`, `possede`,
  `aCentreInteret`. Ce sous-échantillon sert de **démonstration** ; le
  graphe peut être repeuplé avec l'intégralité des 1600 profils en modifiant
  `random.sample(students, 40)` dans `build_ontology.py`.

Les statistiques exactes sont affichées à chaque exécution de
`build_ontology.py`.

## 4. Couverture des 6 cas d'usage (voir `example_queries.sparql`)

1. **Vérifier des prérequis** — pour un étudiant, confronte sa `aSerieBac` à
   la liste des `necessite` du parcours vers lequel il est orienté.
2. **Expliquer une recommandation** — retrouve les matières préférées et
   compétences possédées par un étudiant qui coïncident avec ce
   qu'enseigne/développe le parcours recommandé (base d'une explication
   "pourquoi ce parcours ?").
3. **Parcourir les relations entre formations et métiers** — à partir d'un
   métier cible, retrouve tous les parcours qui y préparent et leur mention.
4. **Détecter des incohérences** — liste les étudiants dont la série de bac
   ne correspond à aucun prérequis du parcours recommandé (voir résultat
   réel ci-dessous : 4 cas détectés sur l'échantillon de 40, cohérent avec
   le taux de bruit ~12% injecté volontairement dans le dataset).
5. **Compléter les résultats du modèle statistique** — calcule, pour un
   étudiant, un score symbolique de recoupement (matières + compétences
   communes) avec chaque parcours, permettant de proposer un "top 3"
   explicable en complément d'une prédiction ML.
6. **Raisonnement multiétape** — chaîne à 3 sauts Étudiant → Matière
   préférée → Parcours qui l'enseigne → Métier auquel il prépare, pour
   suggérer des métiers non directement présents dans les préférences
   déclarées de l'étudiant.

Le dataset d'entraînement est désormais généré de façon à respecter ces règles
d'admission. Les cas volontairement non admissibles doivent appartenir au jeu
d'évaluation de sécurité, séparé du jeu d'entraînement : le graphe peut alors
les signaler au conseiller sans apprendre à les recommander.

## 5. Comment le graphe complète le modèle statistique

- Le modèle statistique (ex. un classifieur entraîné sur le dataset
  synthétique) prédit un `parcours_recommande` à partir d'un profil, mais ne
  peut pas justifier *pourquoi* sans ré-ouvrir sa boîte noire.
- Le graphe, lui, permet de **matérialiser cette prédiction** comme un
  triplet `Etudiant estOrienteVers Parcours`, puis d'en dériver une
  **explication symbolique vérifiable** (requête n°2), une **vérification
  de cohérence** (requête n°1 et n°4) et des **alternatives classées**
  (requête n°5) — sans avoir besoin de ré-entraîner ou d'interroger le
  modèle statistique lui-même.
- Il permet aussi une **navigation** que le modèle statistique seul
  n'offre pas : partir d'un métier visé et remonter aux parcours qui y
  préparent (requête n°3), ou partir d'une matière aimée et découvrir des
  métiers accessibles via un parcours qui l'enseigne (requête n°6).

## 6. Limites connues

- **Deux granularités de compétences non fusionnées** : les compétences
  "larges" (`competences_developpees`) et les compétences fines utilisées
  dans `relations_competences_metiers` sont représentées comme des individus
  distincts de la même classe `CompetenceDisciplinaire`, même lorsqu'elles
  se recoupent sémantiquement (ex. *« Administration et optimisation de
  bases de données »* vs *« Administration SGBDR »*). Une fusion nécessite un
  travail d'alignement sémantique (ou un LLM d'assistance) non réalisé ici.
- **Duplication mineure liée aux accents** : la matière de lycée "Francais"
  (sans accent, héritée du générateur de dataset) et la matière universitaire
  "Français" (avec accent, présente dans le cursus TEH) restent deux
  individus distincts faute de normalisation orthographique systématique.
  D'autres cas similaires peuvent exister dans les 291 matières
  universitaires (variantes d'accentuation/majuscules non détectées par une
  correspondance exacte de chaîne).
- **`estRequisePour` incomplet** : cette relation n'est peuplée que pour les
  métiers explicitement présents dans `relations_competences_metiers` (5
  paires par parcours en moyenne) — elle ne couvre pas l'ensemble des
  combinaicompétence/métier plausibles, faute de source pour les inférer.
- **Échantillon d'étudiants limité à 40** dans le graphe livré (à des fins de
  démonstration et de lisibilité) ; le script permet de repeupler avec les
  1600 profils du dataset en une ligne.
- **Pas de raisonneur OWL (reasoner) exécuté** : le schéma utilise des
  primitives simples (`rdfs:subClassOf`, `owl:inverseOf`) mais aucune
  contrainte de cardinalité, disjonction ou classe restreinte n'a été
  ajoutée ; l'ontologie reste donc "légère" (proche d'un graphe de
  connaissances RDF) plutôt qu'une OWL-DL complète avec inférences
  automatiques de cohérence. Les contrôles de cohérence présentés (cas
  d'usage n°4) sont réalisés par requête SPARQL explicite, pas par
  classification automatique d'un raisonneur.
