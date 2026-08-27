# ontologie — ORIENT'IA

Ontologie / graphe de connaissances reliant profil étudiant, offre de
formation (mentions, parcours, matières, compétences, prérequis) et
débouchés professionnels. Voir docs/ONTOLOGY.md pour la conception complète.

## Démarrage rapide
```
pip install rdflib
python3 scripts/build_ontology.py     # régénère data/*.ttl, *.owl, nodes/edges.csv
python3 scripts/run_queries_demo.py   # exécute les 6 requêtes exemples
```

## Importer dans Protégé
Ouvrir data/knowledge_graph.owl (ou .ttl) directement.
