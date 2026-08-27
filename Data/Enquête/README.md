# Registre de Collecte — Enquête Réelle (Validation ORIENT'IA)

Ce dossier contient les données recueillies auprès de personnes réelles (étudiants et professionnels) afin de valider et tester les capacités de généralisation du modèle d'aide à l'orientation. Contrairement au dataset synthétique, ces données reflètent des choix et des parcours réels.

## 1. Informations Générales
*   **Lien du formulaire d'enquête :** [https://forms.gle/WMp5RGeVskay7NxT8](https://forms.gle/WMp5RGeVskay7NxT8)
*   **Période de collecte :** Lancée dès la première heure du projet et gelée à la fin de la première journée.
*   **Statut :** Données de test et de validation (non utilisées pour l'entraînement initial afin d'éviter le sur-apprentissage des règles synthétiques).

## 2. Protocole de Collecte
### Populations Visées
1.  **Étudiants :** Profil au moment de l'inscription, parcours choisi, et satisfaction actuelle.
2.  **Professionnels :** Profil rétrospectif (avant études), parcours suivi, métier actuel et jugement sur l'adéquation formation-métier.

### Mode de Diffusion
L'enquête a été diffusée via les réseaux sociaux (groupes d'étudiants ISPM, LinkedIn) et par contact direct pour garantir une diversité de profils.

## 3. Traçabilité et Traitement des Données
*   **Nombre de réponses :** Consultable dans `resultatenquete.csv`.
*   **Texte de Consentement :** Présenté en introduction du formulaire. Les répondants ont accepté que leurs données (anonymisées) soient utilisées dans le cadre de ce projet académique.
*   **Procédure d'Anonymisation :** 
    *   Aucune donnée personnelle sensible (nom, adresse exacte, contact direct) n'a été collectée.
    *   Les adresses e-mail ne sont pas conservées dans le dataset final.
*   **Traitements postérieurs :** Nettoyage des réponses incomplètes ou manifestement incohérentes, recodage des matières et centres d'intérêt pour correspondre au référentiel du modèle.

## 4. Limites et Biais Constatés
*   **Volume :** Le nombre de réponses est limité par rapport au dataset synthétique, ce qui induit des intervalles de confiance plus larges.
*   **Auto-sélection :** Les répondants sont majoritairement issus des filières technologiques (sur-représentation de l'informatique).
*   **Biais de reconstruction :** Pour les professionnels, le souvenir des motivations pré-études peut être influencé par leur carrière actuelle.

## 5. Fichiers
*   `resultatenquete.csv` : Données brutes nettoyées et anonymisées.
