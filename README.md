# Yei’ta Match

Jeu de cartes soft skills utilisé pendant les entretiens candidats Yeita. Application statique (React + Vite), sans serveur : rien n’est transmis, les données ne sortent du navigateur que par les fichiers exportés.

## Local

```bash
npm install
npm run dev     # serveur de développement
npm test        # tests (node:test, sans dépendance)
npm run build   # build de production dans dist/
```

Formatage : Prettier (`.prettierrc.json`), vérifié par la CI avec `npx prettier@3.8.1 --check src test`.

## Parcours

1. Accueil → « Commencer » → identité obligatoire (nom complet du candidat, nom complet du maître du jeu et date).
2. Huit manches de cartes : à chaque manche, le candidat choisit deux cartes, dans l’ordre.
3. Restitution sans notes, export PDF ou JSON de la partie.
4. Hors entretien : sur l’accueil, « Reprendre une partie pour rédiger mes notes » → importer le JSON, renseigner les notes puis exporter le PDF avec ou sans notes.

Le JSON contient des données personnelles et les choix du candidat : le conserver de manière sécurisée et ne le partager qu'avec les personnes autorisées.

## Structure

```
public/data/
  situations.json   48 situations (6 catégories × 8), 4 cartes chacune
  dimensions.json   6 dimensions, 6 styles, paramètres du jeu
src/
  App.jsx           état de l’application et enchaînement des écrans
  screens/          WelcomeScreen, PlayScreen, ResultScreen
  components/       SiteHeader, SiteFooter, SetupModal, NotesPanel, Icons
  lib/
    scoring.js      tirage des manches et calcul des scores (non affichés, seuls styles et traits)
    session.js      format du fichier .json et validation à l’import
    exports.js      noms de fichiers, téléchargement JSON, impression PDF
    useGameData.js  chargement des données
  styles.css        styles écran, petits écrans (≤ 760 px, ≤ 390 px) et impression
test/               tests unitaires (scoring, import/export)
```

## Calcul

- Tirage Fisher–Yates : une situation par catégorie, puis des situations au hasard jusqu’à huit.
- Premier choix pondéré 4, second choix pondéré 1 ; dimension principale de la carte comptée à 100 %, secondaire à 35 %.
- Score par dimension : écart normalisé par rapport aux sélections attendues au hasard (50 = neutre, 100 = toujours choisie en premier, 0 = jamais choisie).

## Limite d'interprétation

Les scores reflètent des préférences exprimées dans ce jeu, pas une évaluation psychométrique validée ni la maîtrise réelle des soft skills.

## PDF

Les PDF sont produits via la fonction d'impression native du navigateur (Enregistrer en PDF). Le nom proposé est `Fiche Yeita - Nom du candidat avec Nom du maitre du jeu - Date` avec le suffixe ` - Notes` seulement pour la version avec notes. Le nom dépend de la gestion du titre de page par le navigateur. Les notes sont plafonnées en longueur pour viser une page A4.

## Déploiement

Pousser sur `main`, puis `Settings → Pages → Source: GitHub Actions`. Le workflow `.github/workflows/deploy-pages.yml` utilise `npm ci` et déploie `dist`. Le workflow `ci.yml` vérifie formatage, tests et build sur chaque pull request. Le `package-lock.json` est versionné ; `node_modules` et `dist` sont ignorés.
