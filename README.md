# Yei’ta Match — POC V3

## Local

```bash
npm install
npm run dev
```

## Parcours

1. Accueil → « Commencer » → identité obligatoire (nom complet du candidat, nom complet du maître du jeu et date).
2. Huit manches de cartes.
3. Restitution sans notes, export PDF ou JSON de la partie.
4. Hors entretien : sur l’accueil, « Reprendre une partie pour rédiger mes notes » → importer le JSON, renseigner les notes puis exporter le PDF avec ou sans notes.

Le JSON contient des données personnelles et les choix du candidat : le conserver de manière sécurisée et ne le partager qu'avec les personnes autorisées. Aucune transmission serveur n'est effectuée par l'application.

## PDF

Les PDF sont produits via la fonction d'impression native du navigateur (Enregistrer en PDF). Le nom proposé est `Fiche Yeita - Nom du candidat avec Nom du maitre du jeu - Date` avec le suffixe ` - Notes` seulement pour la version avec notes. Le nom dépend de la gestion du titre de page par le navigateur. Les notes sont plafonnées en longueur pour viser une page A4.

## Déploiement

Pousser sur `main`, puis `Settings → Pages → Source: GitHub Actions`. Le workflow `.github/workflows/deploy-pages.yml` utilise `npm ci` et déploie `dist`. Le `package-lock.json` est versionné ; `node_modules` et `dist` sont ignorés.

## Limite d'interprétation

Les scores reflètent des préférences exprimées dans ce jeu, pas une évaluation psychométrique validée ni la maîtrise réelle des soft skills.

## V4

- 48 situations au total (8 manches parmi 6 catégories).
- Tirage Fisher–Yates et couverture de toutes les catégories.
- Résultat : écart normalisé par rapport aux sélections attendues au hasard, avec un premier choix pondéré 4 et un second choix pondéré 1. Ce sont des préférences relatives, pas des compétences mesurées.
- Simplification du logo et des textes.
