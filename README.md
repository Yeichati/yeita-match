# Yei’ta Match

Jeu de cartes soft skills utilisé pendant les entretiens candidats Yeita : les choix du candidat font ressortir deux des quatre valeurs Yeita, qui désignent son profil parmi douze. Application statique (React + Vite), sans serveur : rien n’est transmis, les données ne sortent du navigateur que par les fichiers exportés.

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
2. Huit manches : à chaque manche, une situation et quatre cartes (une par valeur) ; le candidat en choisit deux, sans ordre.
3. En cas d’égalité pour la 1re ou la 2e valeur, une « Dernière manche » de départage (1 carte parmi celles des valeurs à égalité, 2 manches au plus).
4. Page de profil montrée au candidat : nom du profil, combinaison dominante › seconde, détail des deux valeurs. Export PDF ou JSON de la partie.
5. Hors entretien : sur l’accueil, « Reprendre une partie pour rédiger mes notes » → importer le JSON, renseigner les notes puis exporter le PDF avec ou sans notes.

Le JSON contient des données personnelles et les choix du candidat : le conserver de manière sécurisée et ne le partager qu'avec les personnes autorisées.

## Structure

```
src/
  data/             contenu du jeu, modifiable sans toucher au code
    values.json     4 valeurs, leurs 3 comportements et soft skills
    profiles.json   12 profils (dominante › seconde)
    situations.json 48 situations (6 catégories × 8), 4 cartes chacune, une par valeur
  App.jsx           état de l’application et enchaînement des écrans
  screens/          WelcomeScreen, PlayScreen, ProfileScreen
  components/       SiteHeader, SiteFooter, SetupModal, NotesPanel, Icons
  lib/
    scoring.js      tirage, comptage par valeur, départage, choix du profil
    session.js      format du fichier .json (v2) et validation à l’import
    exports.js      noms de fichiers, téléchargement JSON, impression PDF
    gameData.js     données du jeu (intégrées au build)
  styles.css        styles écran, petits écrans (≤ 760 px, ≤ 390 px) et impression
test/               tests unitaires (contenu, calcul, import/export)
```

## Calcul

- Tirage Fisher–Yates : une situation par catégorie, puis des situations au hasard jusqu’à huit.
- Chaque carte pointe vers un comportement, donc vers une valeur. Chaque carte choisie vaut 1 point pour sa valeur (16 points par partie).
- Les deux valeurs les plus choisies donnent le profil : dominante › seconde, lu dans `profiles.json`.
- Égalité qui décide la 1re ou la 2e place : manche de départage sur une situation non jouée, avec les seules cartes des valeurs à égalité. Les départages sont enregistrés dans le JSON, le profil est recalculé à l’identique à l’import.

## Modifier le contenu

Tout le contenu du jeu est dans `src/data/`. Les tests (`npm test`) vérifient sa cohérence : 4 cartes par situation couvrant les 4 valeurs, comportements existants, un profil par couple de valeurs, identifiants uniques.

## Limite d'interprétation

Le profil reflète des préférences exprimées dans ce jeu, pas une évaluation psychométrique validée ni la maîtrise réelle des soft skills.

## PDF

Les PDF sont produits via la fonction d'impression native du navigateur (Enregistrer en PDF). Le nom proposé est `Fiche Yeita - Nom du candidat avec Nom du maitre du jeu - Date` avec le suffixe ` - Notes` seulement pour la version avec notes. Le nom dépend de la gestion du titre de page par le navigateur. Les notes sont plafonnées en longueur pour viser une page A4.

## Déploiement et cache navigateur

GitHub Pages autorise les navigateurs à garder les fichiers en cache 10 minutes, sans réglage possible. Pour qu'un déploiement soit pris en compte sans rechargement forcé :

- le JS et le CSS ont une empreinte dans leur nom (Vite) et les données du jeu sont intégrées au JS : code et données changent toujours ensemble ;
- chaque build porte un identifiant de version (commit), écrit dans `index.html` et dans `version.json`. Au chargement, un script inline d'`index.html` compare les deux (`version.json` lu sans cache) et, si une version plus récente est en ligne, recharge la page une fois sur une URL `?v=…` qui contourne le cache. La vérification n'a lieu qu'au chargement, jamais pendant une partie.


Pousser sur `main`, puis `Settings → Pages → Source: GitHub Actions`. Le workflow `.github/workflows/deploy-pages.yml` utilise `npm ci` et déploie `dist`. Le workflow `ci.yml` vérifie formatage, tests et build sur chaque pull request. Le `package-lock.json` est versionné ; `node_modules` et `dist` sont ignorés.
