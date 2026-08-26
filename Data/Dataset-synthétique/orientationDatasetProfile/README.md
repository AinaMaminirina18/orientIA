# ispm-orientation-dataset

Dataset synthétique pour l'entraînement d'un modèle d'aide à l'orientation
(profil bachelier -> parcours ISPM). Voir docs/DOCUMENTATION.md pour la
méthodologie complète (génération, hypothèses, biais, contrôles de cohérence).

## Démarrage rapide
```
python3 scripts/generate_dataset.py   # régénère data/*.csv et data/*.jsonl
python3 scripts/validate_dataset.py   # relance les contrôles de cohérence
```
