# SKILL — ORIENT’IA

## Frontend MVP — Assistant intelligent d’orientation pédagogique

### ISPM — Examen de fin d’études — Master 2

---

# 1. Rôle

Tu es un **Senior Frontend Engineer + UI/UX Designer spécialisé dans les applications IA, Data Science et systèmes d'aide à la décision**.

Tu dois concevoir et développer le frontend du projet :

# ORIENT’IA

**Assistant intelligent d’orientation pédagogique de l'ISPM.**

Tu dois combiner :

* expertise Next.js / React / TypeScript ;
* architecture frontend scalable ;
* UI/UX moderne ;
* design systems ;
* visualisation de données ;
* interfaces conversationnelles ;
* interfaces d'aide à la décision ;
* restitution de recommandations IA ;
* explicabilité ;
* traçabilité ;
* observabilité ;
* accessibilité ;
* performance.

Le frontend doit être suffisamment abouti pour être utilisé lors de la **démonstration finale du hackathon**, tout en restant suffisamment modulaire pour intégrer progressivement les véritables modèles ML, le RAG, les outils de l'agent et éventuellement une ontologie ou un graphe de connaissances.

---

# 2. Sujet officiel

Le projet consiste à construire un assistant virtuel d'orientation pédagogique capable notamment de :

* présenter les formations et parcours de l'ISPM ;
* analyser le profil d'un candidat ;
* recommander des parcours adaptés ;
* expliquer et justifier ses recommandations ;
* répondre aux questions concernant les admissions, matières, compétences et débouchés ;
* reconnaître lorsqu'il ne dispose pas d'informations suffisantes pour conclure.

Le système doit produire une orientation personnalisée à partir :

1. des informations relatives aux formations de l'ISPM ;
2. du profil déclaré par l'utilisateur ;
3. des résultats d'un ou plusieurs modèles de Machine Learning ;
4. des documents et connaissances collectés ;
5. éventuellement de règles, d'une ontologie ou d'un graphe de connaissances.

L'exigence centrale du produit est :

> **Une recommandation ne doit pas simplement annoncer une filière. Elle doit être argumentée, traçable et prudente.**

---

# 3. Contraintes du frontend actuel

Le projet Next.js existe déjà.

Stack disponible :

* Next.js — version existante du projet ;
* React ;
* TypeScript ;
* Tailwind CSS ;
* Framer Motion ;
* Lucide React.

Une icône applicative existe déjà :

```text
/public/ISPM.ico
```

Ne réinstalle pas inutilement les dépendances existantes.

Avant toute modification :

* inspecter le projet ;
* comprendre sa structure ;
* identifier ce qui existe déjà ;
* réutiliser ce qui est pertinent.

---

# 4. Inspiration UX

La référence principale reste :

https://dovetail.com/

Le site doit être consulté avant la conception.

Le fichier HTML de référence présent dans `public/` peut également être analysé.

S'inspirer particulièrement de :

* la sobriété ;
* la hiérarchie visuelle ;
* l'organisation de l'information ;
* la navigation ;
* les espaces de travail ;
* la recherche ;
* les panneaux ;
* les cartes ;
* les états interactifs ;
* la lisibilité des informations complexes.

**Ne pas copier Dovetail.**

ORIENT’IA doit avoir sa propre identité.

---

# 5. Nouvelle charte graphique : VERT + BLANC

La direction artistique doit désormais privilégier très clairement :

# Vert + Blanc

Le vert doit devenir la couleur principale de l'application.

Le blanc doit constituer la base de l'interface.

L'objectif est de transmettre :

* confiance ;
* accompagnement ;
* pédagogie ;
* sérénité ;
* intelligence ;
* précision ;
* institutionnalité moderne.

Éviter l'esthétique "green tech" agressive.

Le vert doit être utilisé avec élégance.

---

## 5.1 Palette

Construire un système de tokens permettant de centraliser les couleurs.

Prévoir notamment :

```text
background
foreground
card
muted
muted-foreground
border
primary
primary-foreground
secondary
secondary-foreground
success
warning
destructive
accent
```

La couleur `primary` doit appartenir à une famille de verts.

Exemple de direction :

```text
Primary Green
Deep Green
Soft Green
Pale Green
White
Off White
Neutral Gray
```

Les valeurs exactes peuvent être choisies intelligemment pendant l'implémentation.

Ne pas utiliser une palette entièrement verte.

Les neutres restent indispensables pour conserver une interface professionnelle.

---

# 6. Identité visuelle

ORIENT’IA doit ressembler à :

> une plateforme moderne d'orientation et d'aide à la décision alimentée par l'intelligence artificielle.

Pas à :

* un simple chatbot ;
* un dashboard administratif ;
* un template SaaS générique ;
* un site universitaire classique ;
* une interface de laboratoire ML ;
* un produit cyberpunk ;
* une application crypto ;
* une landing page générée par IA.

L'interface doit pouvoir être présentée devant un jury académique et donner immédiatement une impression de produit sérieux.

---

# 7. Typographie

Police unique :

# Work Sans

Aucune autre police ne doit être introduite.

Éviter les poids excessifs.

INTERDICTION :

```text
font-black
```

Les titres doivent rester élégants et relativement légers.

Privilégier :

* Regular ;
* Medium ;
* SemiBold ;
* Bold ponctuellement.

---

# 8. Icônes

Toutes les icônes doivent provenir de :

**lucide-react**

INTERDICTION d'utiliser :

* emojis ;
* icônes Unicode ;
* bibliothèques concurrentes ;
* SVG dessinés manuellement pour des icônes standards.

Les icônes seules doivent disposer d'un contexte accessible (`aria-label` si nécessaire).

---

# 9. Philosophie UX

L'utilisateur principal est une personne qui cherche à comprendre :

> **Quel parcours de formation pourrait me correspondre et pourquoi ?**

L'interface doit donc constamment répondre à quatre questions :

### 1. Que sait ORIENT’IA ?

Informations issues des sources pédagogiques.

### 2. Que comprend ORIENT’IA de mon profil ?

Profil déclaré par l'utilisateur.

### 3. Que recommande le système ?

Résultat du modèle / moteur de recommandation.

### 4. Pourquoi cette recommandation ?

Explication, facteurs, sources et niveau d'incertitude.

---

# 10. Architecture fonctionnelle cible

Le frontend doit être pensé autour des grandes briques suivantes :

```text
ORIENT’IA
│
├── Accueil
│
├── Mon profil
│
├── Orientation
│   ├── Recommandation
│   ├── Comparaison
│   └── Explication
│
├── Formations
│   ├── Catalogue
│   └── Détail d'une formation
│
├── Assistant
│
├── Sources
│
└── Évaluation / Observabilité
```

Cette architecture constitue un **socle frontend**.

Elle pourra évoluer selon l'implémentation backend réelle.

---

# 11. Page d'accueil

Créer une page d'accueil qui explique immédiatement ORIENT’IA.

Elle doit présenter :

* la proposition de valeur ;
* l'objectif de l'outil ;
* une action principale pour commencer ;
* éventuellement un aperçu des formations ;
* éventuellement quelques indicateurs du système ;
* un rappel clair du rôle d'aide à l'orientation.

Le CTA principal pourrait être conceptuellement :

> Commencer mon orientation

L'interface doit immédiatement conduire vers la construction du profil.

---

# 12. Profil candidat

Le profil utilisateur est une composante centrale.

Le frontend doit prévoir un parcours permettant de renseigner progressivement :

* matières préférées ;
* résultats scolaires ;
* compétences déclarées ;
* centres d'intérêt ;
* activités / projets réalisés ;
* préférences professionnelles ;
* type d'environnement de travail recherché.

Ces éléments sont explicitement prévus par le sujet.

Le formulaire doit être conçu comme une **expérience guidée**, pas comme un énorme formulaire administratif.

Privilégier :

* étapes ;
* sections ;
* progression ;
* sélection visuelle ;
* champs simples ;
* résumé du profil.

---

# 13. Profil progressif

Le système doit pouvoir recueillir progressivement les informations nécessaires.

Prévoir une architecture permettant :

```text
Profil incomplet
       ↓
Questions complémentaires
       ↓
Profil suffisamment renseigné
       ↓
Analyse
```

Le frontend doit pouvoir afficher :

* ce qui est connu ;
* ce qui manque ;
* pourquoi une information est utile ;
* la progression du profil.

---

# 14. Recommandation

La page de recommandation constitue l'un des écrans les plus importants.

Elle ne doit PAS afficher simplement :

```text
1. ISAIA
2. IGGLIA
3. ...
```

Elle doit présenter une recommandation argumentée.

Exemple conceptuel :

```text
Parcours recommandé

ISAIA

Score d'adéquation
84 %

Pourquoi ce parcours ?

✓ Forte correspondance avec vos intérêts
✓ Bon alignement avec vos compétences
✓ Correspondance avec vos matières préférées

Facteurs principaux

Mathématiques        ██████████
Programmation        █████████
Analyse de données   ████████

Sources
[Voir les sources]

Comment cette recommandation a été produite
[Voir l'explication]
```

Les valeurs affichées doivent être mockées tant que le véritable modèle n'est pas intégré.

Ne jamais présenter une donnée fictive comme une mesure réelle.

---

# 15. Explicabilité

L'explicabilité est fondamentale.

Prévoir des composants permettant de distinguer clairement :

### Résultat du modèle ML

Ce que le modèle a produit.

### Informations documentaires

Ce que les sources pédagogiques indiquent.

### Règles pédagogiques

Ce qui provient éventuellement de règles explicites.

### Génération LLM

Ce qui est formulé ou expliqué par le modèle de langage.

Ces sources ne doivent jamais être mélangées visuellement.

---

# 16. Niveau de confiance et incertitude

ORIENT’IA doit être capable de reconnaître lorsqu'il ne dispose pas de suffisamment d'informations.

Prévoir des états tels que :

```text
Confiance élevée
Confiance modérée
Informations insuffisantes
Résultat incertain
```

L'interface doit éviter de présenter une recommandation comme une vérité absolue.

Prévoir éventuellement :

```text
Pourquoi cette recommandation est-elle incertaine ?
```

avec une explication.

---

# 17. Comparaison de parcours

Créer une interface permettant de comparer plusieurs formations / parcours.

Elle doit pouvoir comparer :

* matières ;
* compétences ;
* prérequis ;
* débouchés ;
* compatibilité avec le profil ;
* score d'adéquation lorsque disponible ;
* sources.

Éviter les tableaux excessivement denses.

Privilégier une comparaison visuelle lisible.

---

# 18. Catalogue des formations

Créer un catalogue permettant d'explorer les formations.

Prévoir :

* recherche ;
* filtres ;
* catégories ;
* cartes ;
* page détaillée ;
* matières ;
* compétences ;
* prérequis ;
* débouchés ;
* sources.

Les informations doivent être représentées comme des données structurées.

Ne pas mettre de longs textes directement dans les composants.

---

# 19. Page détail d'une formation

Une formation doit pouvoir être présentée avec une structure similaire à :

```text
Nom du parcours

Présentation

Niveau / diplôme

Matières principales

Compétences développées

Prérequis

Débouchés

Parcours associés

Sources
```

Prévoir un emplacement pour indiquer :

* source officielle ;
* source institutionnelle ;
* source externe.

---

# 20. Traçabilité des sources

La traçabilité est une exigence fondamentale du sujet.

Pour chaque source, le système devra à terme pouvoir afficher :

* titre ;
* origine / URL ;
* date de consultation ;
* statut ;
* informations extraites ;
* limites / incertitudes.

Prévoir une interface dédiée :

```text
Sources
│
├── Sources officielles
├── Sources institutionnelles
└── Sources externes
```

Le frontend doit pouvoir afficher la provenance d'une information directement dans le contexte où elle est utilisée.

---

# 21. Recherche documentaire / RAG

Le frontend doit être préparé pour l'intégration future du RAG.

Prévoir une représentation permettant de montrer :

```text
Question
   ↓
Recherche
   ↓
Documents récupérés
   ↓
Passages pertinents
   ↓
Réponse
```

L'utilisateur doit éventuellement pouvoir consulter :

* les documents utilisés ;
* les passages récupérés ;
* les citations ;
* les sources.

Ne pas simuler un véritable RAG si le backend n'est pas encore disponible.

Créer plutôt les interfaces nécessaires à son intégration.

---

# 22. Assistant conversationnel

L'assistant constitue une interface centrale d'ORIENT’IA.

Il doit être plus qu'une simple fenêtre de chat.

Prévoir :

* historique de conversation ;
* messages utilisateur ;
* réponses assistant ;
* sources citées ;
* actions proposées ;
* appels d'outils ;
* informations manquantes ;
* incertitude ;
* recommandations ;
* possibilité de consulter les détails.

Exemple :

```text
Assistant

Bonjour, je peux vous aider à identifier
les parcours correspondant à votre profil.

[Commencer mon profil]

ou

Posez votre question...
```

---

# 23. Outils de l'agent

Le sujet exige au moins trois outils fonctionnels côté système.

Le frontend doit donc prévoir leur représentation.

Exemples :

```text
Rechercher une formation
Vérifier les prérequis
Comparer les parcours
Rechercher des compétences
Analyser le profil
Calculer le score d'adéquation
Identifier les débouchés
Expliquer une recommandation
```

Le frontend doit pouvoir afficher lorsqu'un outil est utilisé :

```text
Analyse du profil...
✓ Profil analysé

Recherche de formations...
✓ 4 formations pertinentes trouvées

Calcul de l'adéquation...
✓ Recommandations générées
```

Les noms et états doivent être suffisamment génériques pour être reliés aux vrais outils plus tard.

---

# 24. État des outils

Prévoir des états :

* idle ;
* running ;
* success ;
* error ;
* skipped.

Une action de l'agent ne doit pas apparaître comme instantanée si elle représente réellement un traitement.

---

# 25. IA symbolique / Graphe de connaissances

L'IA symbolique est une extension recommandée par le sujet.

Le frontend doit être préparé à afficher éventuellement :

```text
Étudiant
   ↓ possède
Compétence
   ↓ développée par
Parcours
   ↓ prépare à
Métier
```

Une future vue "Graphe" peut permettre d'explorer :

* formations ;
* matières ;
* compétences ;
* prérequis ;
* métiers ;
* centres d'intérêt.

Cette vue peut être préparée architecturalement sans forcément implémenter un moteur de graphe complet maintenant.

---

# 26. Évaluation du système

L'évaluation est une composante majeure du projet.

Le sujet impose notamment un jeu d'au moins **32 cas de test**, répartis entre :

* questions factuelles ;
* comparaisons ;
* recommandations ML ;
* questions multi-sources ;
* informations absentes ;
* ambiguïtés ;
* sécurité / prompt injection ;
* biais ;
* provenance / refus du profilage psychologique.

Le frontend doit donc prévoir une future interface d'évaluation.

---

# 27. Dashboard d'évaluation

Prévoir une interface permettant éventuellement d'afficher :

### Machine Learning

* performance prédictive ;
* classement ;
* généralisation ;
* stabilité ;
* biais ;
* erreurs.

### Recherche documentaire

* pertinence ;
* rappel ;
* qualité du contexte ;
* récupération d'information.

### Génération

* exactitude ;
* fidélité aux sources ;
* qualité des citations ;
* utilité ;
* reconnaissance de l'absence d'information.

### Système complet

* utilisation des outils ;
* cohérence ML / réponse ;
* latence ;
* coût ;
* robustesse ;
* sécurité.

Ne pas inventer de résultats scientifiques.

Utiliser des données mock clairement identifiées jusqu'à l'intégration des vrais résultats.

---

# 28. Observabilité

Prévoir une interface d'observabilité.

Le sujet demande notamment de pouvoir examiner :

* question initiale ;
* profil ;
* passages récupérés ;
* scores de recherche ;
* outils appelés ;
* entrées / sorties ML ;
* réponse finale ;
* temps d'exécution ;
* erreurs ;
* refus.

Prévoir donc une vue de type :

```text
Trace #001

Question
↓

Profil construit
↓

Recherche documentaire
↓

Documents récupérés
↓

Outils utilisés
↓

Modèle ML
↓

Réponse finale
```

Cette fonctionnalité est importante pour la démonstration et le debugging.

---

# 29. Sécurité et garde-fous

Le frontend doit refléter les garde-fous du système.

Le système devra notamment traiter :

* prompt injection ;
* documents malveillants ;
* questions hors sujet ;
* demandes d'informations personnelles ;
* informations contradictoires ;
* recommandations discriminatoires ;
* profilage psychologique ;
* affirmations non justifiées ;
* confusion entre conseil pédagogique et décision administrative.

Le frontend doit permettre d'afficher clairement les refus et avertissements.

---

# 30. Mention obligatoire

L'interface doit afficher clairement :

> **ORIENT’IA constitue un outil d’aide à l’orientation. Ses recommandations ne remplacent ni l’avis d’un conseiller pédagogique ni une décision officielle d’admission.**

Cette mention doit être intégrée élégamment dans l'expérience utilisateur.

Elle ne doit pas être cachée uniquement dans une page de conditions d'utilisation.

---

# 31. Refus de profilage psychologique

Le frontend ne doit jamais suggérer que l'application :

* analyse la personnalité ;
* déduit des traits psychologiques ;
* détermine un profil psychologique à partir de l'écriture.

Les recommandations doivent être fondées sur les informations explicitement déclarées par l'utilisateur et les données / modèles prévus par le système.

---

# 32. Données sensibles

Ne jamais demander ou afficher inutilement des informations personnelles sensibles.

Le frontend doit être conçu autour de données déclarées et pertinentes pour l'orientation.

Prévoir une UX de consentement et d'information lorsque nécessaire.

---

# 33. Architecture technique

Le projet doit rester modulaire.

Architecture recommandée :

```text
src/
├── app/
│   ├── page.tsx
│   ├── orientation/
│   ├── formations/
│   ├── assistant/
│   ├── sources/
│   ├── evaluation/
│   └── observability/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   ├── profile/
│   ├── recommendation/
│   ├── assistant/
│   ├── sources/
│   ├── evaluation/
│   └── observability/
│
├── features/
│   ├── profile/
│   ├── recommendation/
│   ├── formations/
│   ├── assistant/
│   ├── search/
│   └── ...
│
├── lib/
│   ├── storage/
│   ├── mock/
│   ├── utils/
│   └── ...
│
├── hooks/
│
├── types/
│
└── ...
```

Cette structure est indicative.

Adapte-la à la structure réelle du projet.

---

# 34. Abstraction des données

Le frontend doit être prêt à fonctionner :

### Maintenant

avec :

```text
Mock data
+
LocalStorage
```

### Plus tard

avec :

```text
API
+
Backend
+
ML
+
RAG
+
Agent
```

Éviter de coupler directement les composants UI au stockage.

---

# 35. LocalStorage

Les données frontend doivent pouvoir être persistées localement.

Créer une abstraction dédiée.

Elle pourra gérer notamment :

* profil ;
* préférences ;
* historique conversation ;
* données temporaires ;
* éventuellement traces locales.

Prévoir une architecture facilement remplaçable par une API.

---

# 36. Recherche

La recherche doit être réellement fonctionnelle côté frontend.

Elle doit pouvoir évoluer vers :

* recherche lexicale ;
* recherche sémantique ;
* RAG ;
* recherche hybride ;
* recherche dans les formations ;
* recherche dans les sources.

Pour la première version :

* utiliser les données locales / mock ;
* filtrer réellement ;
* gérer les résultats ;
* gérer l'absence de résultat.

---

# 37. Formulaires

Tous les formulaires doivent être fonctionnels.

Le formulaire de profil doit notamment pouvoir :

* être rempli ;
* être validé ;
* être sauvegardé ;
* être modifié ;
* être restauré après refresh.

Prévoir :

* erreurs ;
* loading ;
* succès ;
* champs manquants ;
* progression.

---

# 38. Design System

Créer des composants cohérents :

* Button ;
* Input ;
* Textarea ;
* Select ;
* Checkbox ;
* Badge ;
* Card ;
* Dialog ;
* Dropdown ;
* Tabs ;
* Tooltip ;
* Search ;
* Toast ;
* Progress ;
* Avatar ;
* Table ;
* Empty State ;
* Loading State ;
* Error State ;
* Source Citation ;
* Confidence Indicator ;
* Recommendation Card ;
* Tool Execution ;
* Chat Message.

Ne pas transformer chaque composant en abstraction excessivement générique.

---

# 39. Animations

Utiliser Framer Motion uniquement lorsque cela améliore l'UX.

Exemples :

* progression du profil ;
* apparition d'une recommandation ;
* ouverture des détails ;
* changement d'étape ;
* apparition des sources ;
* exécution d'un outil ;
* transitions de navigation.

Animations :

* courtes ;
* subtiles ;
* naturelles ;
* performantes.

Respecter `prefers-reduced-motion`.

---

# 40. Performance

Respecter les bonnes pratiques Next.js.

Privilégier :

* Server Components par défaut ;
* Client Components uniquement lorsque nécessaires ;
* imports légers ;
* composants petits ;
* rendu optimisé ;
* lazy loading lorsque pertinent ;
* absence de dépendances inutiles.

Les animations ne doivent pas dégrader la fluidité.

---

# 41. Responsive

L'application doit être pleinement utilisable sur :

* desktop ;
* laptop ;
* tablette ;
* mobile.

Les interfaces critiques doivent être pensées mobile-first :

* profil ;
* assistant ;
* recommandations ;
* comparaison ;
* catalogue.

---

# 42. Accessibilité

Respecter :

* navigation clavier ;
* focus visible ;
* labels ;
* contrastes ;
* aria-label ;
* boutons sémantiques ;
* liens sémantiques ;
* messages d'erreur accessibles.

---

# 43. Données mock

Créer des données mock réalistes représentant :

* quelques formations ;
* mentions ;
* parcours ;
* matières ;
* compétences ;
* prérequis ;
* métiers ;
* recommandations ;
* sources ;
* exemples de profils.

Les données doivent être :

* typées ;
* centralisées ;
* faciles à remplacer.

Ne pas disperser des données hardcodées dans les composants.

---

# 44. Distinction entre données réelles et mock

Une donnée fictive ne doit jamais être présentée comme une donnée officielle.

Lorsqu'une donnée est mockée :

* soit l'interface doit pouvoir l'identifier ;
* soit le code doit clairement la séparer des données réelles ;
* soit l'état "démo" doit être explicite lorsqu'il existe un risque de confusion.

---

# 45. Règles concernant les sources ISPM

Lorsque des informations réelles concernant les formations ISPM sont utilisées :

elles doivent pouvoir être associées à leur provenance.

Le sujet exige notamment :

* titre ;
* origine / URL ;
* date de consultation ;
* statut ;
* données extraites ;
* limites / incertitudes.

Le frontend doit donc prévoir ce modèle dès maintenant.

---

# 46. Navigation principale

La navigation peut être structurée autour de :

```text
Accueil
Mon profil
Orientation
Formations
Assistant
Sources
Évaluation
Observabilité
```

Les éléments encore non connectés à un backend peuvent être présentés avec un état approprié, mais les routes doivent fonctionner.

---

# 47. Dashboard

Le dashboard doit être orienté **orientation**, et non simplement "KPI".

Exemple de structure :

```text
Bonjour

Votre orientation
[Compléter mon profil]

Dernière recommandation
[Voir ma recommandation]

Explorer les formations
[Explorer]

Assistant ORIENT’IA
[Poser une question]

État du profil
████████░░ 80 %

Informations manquantes
...
```

Le dashboard doit avoir une fonction réelle.

---

# 48. Page de recommandation : priorité UX

Cette page doit être particulièrement soignée.

Elle doit permettre au jury de comprendre rapidement :

```text
Profil
 ↓
Modèle
 ↓
Résultat
 ↓
Pourquoi ?
 ↓
Sources
 ↓
Incertitude
```

Le frontend doit rendre visible cette chaîne de raisonnement sans prétendre exposer une "pensée interne" du modèle.

Afficher uniquement des informations explicatives et traçables :

* facteurs ;
* scores ;
* sources ;
* règles ;
* résultats ;
* outils utilisés.

---

# 49. Gestion des contradictions

Prévoir un état permettant de représenter :

```text
Le modèle ML recommande A

mais

Les règles pédagogiques indiquent une incompatibilité.

[Voir le détail]
```

Le frontend ne doit pas masquer ce genre de conflit.

Au contraire, il doit rendre les divergences visibles.

---

# 50. Gestion de l'information absente

Si le système ne possède pas suffisamment d'information :

```text
Informations insuffisantes

Je ne dispose pas actuellement de suffisamment
d'informations vérifiées pour recommander un parcours
avec un niveau de confiance satisfaisant.

Informations nécessaires :
• ...
• ...
```

Cette situation doit être considérée comme un **état normal du produit**, et non comme une erreur technique.

---

# 51. UX du chatbot

Le chatbot doit encourager :

* questions sur les formations ;
* comparaison ;
* orientation ;
* demande d'explication ;
* consultation des sources.

Il doit pouvoir suggérer des actions :

```text
Analyser mon profil
Comparer deux parcours
Voir les sources
Comprendre cette recommandation
```

---

# 52. Aucun faux fonctionnement

Un bouton important ne doit jamais être purement décoratif.

Chaque action doit :

* déclencher une vraie interaction ;
* modifier un état ;
* ouvrir un dialogue ;
* naviguer ;
* sauvegarder ;
* filtrer ;
* ou afficher un résultat.

Les fonctionnalités backend qui ne sont pas encore disponibles doivent être représentées honnêtement comme telles.

---

# 53. Qualité du code

Le code doit être :

* lisible ;
* typé ;
* documenté lorsque nécessaire ;
* modulaire ;
* extensible ;
* testable ;
* maintenable.

Éviter :

* `any` ;
* gros composants ;
* logique métier dans l'UI ;
* duplication ;
* constantes magiques ;
* composants monolithiques ;
* commentaires inutiles.

---

# 54. Workflow obligatoire

## Étape 1 — Inspection

Inspecter le projet existant.

## Étape 2 — Lire les références

Consulter :

* `SKILL.md` ;
* HTML Dovetail ;
* assets existants.

## Étape 3 — Architecture

Définir l'architecture frontend ORIENT’IA.

## Étape 4 — Design system

Mettre en place :

* vert / blanc ;
* Work Sans ;
* tokens ;
* composants ;
* états.

## Étape 5 — Application shell

Créer :

* sidebar ;
* header ;
* navigation ;
* responsive.

## Étape 6 — Profil

Créer le parcours de profil.

## Étape 7 — Formations

Créer catalogue + détail.

## Étape 8 — Orientation

Créer recommandations + comparaison + explications.

## Étape 9 — Assistant

Créer l'interface conversationnelle.

## Étape 10 — Sources

Créer traçabilité / citations.

## Étape 11 — Évaluation

Créer le socle d'évaluation.

## Étape 12 — Observabilité

Créer le socle de visualisation des traces.

## Étape 13 — Interactions

Connecter LocalStorage, recherche, formulaires et états.

## Étape 14 — Animations

Ajouter les animations utiles.

## Étape 15 — Validation

Tester l'ensemble.

---

# 55. Validation finale

Avant de considérer le frontend terminé, vérifier :

* [ ] application démarre ;
* [ ] build fonctionnel ;
* [ ] aucune erreur TypeScript critique ;
* [ ] navigation fonctionnelle ;
* [ ] profil fonctionnel ;
* [ ] LocalStorage fonctionnel ;
* [ ] recherche fonctionnelle ;
* [ ] catalogue fonctionnel ;
* [ ] pages détail fonctionnelles ;
* [ ] recommandations représentées correctement ;
* [ ] comparaison fonctionnelle ;
* [ ] assistant fonctionnel côté UI ;
* [ ] sources représentables ;
* [ ] états d'incertitude ;
* [ ] états d'erreur ;
* [ ] états vides ;
* [ ] dialogues ;
* [ ] animations ;
* [ ] responsive ;
* [ ] accessibilité ;
* [ ] aucune icône hors Lucide ;
* [ ] aucun emoji ;
* [ ] Work Sans partout ;
* [ ] charte vert / blanc respectée ;
* [ ] aucune donnée mock présentée comme officielle.

---

# 56. Critères de qualité visuelle

Le produit doit être suffisamment qualitatif pour être présenté devant le jury.

Priorités :

1. compréhension immédiate ;
2. hiérarchie visuelle ;
3. confiance ;
4. lisibilité ;
5. cohérence ;
6. explicabilité ;
7. sobriété ;
8. performance.

Ne pas chercher à impressionner avec des animations.

Chercher à impressionner avec :

> **la qualité de l'expérience.**

---

# 57. Walkthrough obligatoire

À la fin du développement, fournir un walkthrough détaillé.

## 1. Résumé

Ce qui a été construit.

## 2. Architecture

Structure des dossiers et responsabilités.

## 3. Pages

Chaque page et son rôle.

## 4. Design system

* palette ;
* typographie ;
* composants ;
* spacing ;
* responsive ;
* animations.

## 5. Fonctionnalités

Ce qui fonctionne réellement.

## 6. Données

Différence entre :

* mock ;
* données locales ;
* futures données backend.

## 7. Architecture IA prévue

Expliquer comment le frontend pourra accueillir :

* ML ;
* RAG ;
* LLM ;
* outils ;
* ontologie / graphe ;
* évaluation ;
* observabilité.

## 8. Vérifications

Tests effectués.

## 9. Limites actuelles

Ce qui n'est pas encore connecté.

## 10. Prochaines étapes

Indiquer précisément comment connecter les futures briques backend.

---

# 58. Principe directeur

Le frontend ne doit jamais faire croire que l'intelligence du système existe déjà lorsqu'elle n'est pas encore connectée.

Il doit plutôt rendre l'architecture future **visible, crédible et facilement intégrable**.

Le produit final doit permettre de raconter clairement :

```text
Profil utilisateur
       ↓
Analyse ML
       ↓
Recherche documentaire / RAG
       ↓
Outils
       ↓
Règles / connaissances
       ↓
Assistant
       ↓
Recommandation
       ↓
Explication
       ↓
Sources
       ↓
Incertitude
       ↓
Trace / Évaluation
```

---

# 59. Critère ultime

Le résultat attendu n'est pas :

> "Un beau chatbot."

Le résultat attendu est :

> **Une véritable interface d'aide à l'orientation pédagogique, capable de rendre compréhensible, traçable et exploitable le fonctionnement d'un système combinant Machine Learning, RAG, LLM, outils et éventuellement IA symbolique.**

Le frontend doit donc être :

**beau + fonctionnel + explicable + traçable + performant + extensible.**
