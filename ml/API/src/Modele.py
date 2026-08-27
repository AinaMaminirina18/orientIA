import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
import joblib

# 1. Chargement du dataset
df = pd.read_csv('../data/ispm_orientation_dataset.csv')

# 2. Construction d'une colonne de texte combinant profil et notes pour le Machine Learning
def prepare_features(row):
    return (
        f"Série Bac: {row['serie_bac']} | "
        f"Moyenne: {row['moyenne_generale']} | "
        f"Matières préférées: {row['matieres_preferees']} | "
        f"Compétences: {row['competences_declarees']} | "
        f"Centres d'intérêt: {row['centres_interet']} | "
        f"Projets: {row['activites_projets']}"
    )

df['text_input'] = df.apply(prepare_features, axis=1)

X = df['text_input']
y = df['parcours_recommande']

# 3. Pipeline de classification textuelle
model = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=1000, ngram_range=(1, 2))),
    ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
])

print("Entraînement du modèle sur le dataset ISPM...")
model.fit(X, y)

# 4. Sauvegarde du modèle
joblib.dump(model, '../models/classifier_parcours.pkl')
print("Modèle entraîné et sauvegardé avec succès sous 'classifier_parcours.pkl' !")