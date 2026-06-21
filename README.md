# Ashvex — Site officiel (v2 — structure simplifiée)

Tous les fichiers sont à la racine du projet, sans sous-dossier. C'est fait exprès :
ça évite tout problème lors de l'upload sur GitHub depuis un téléphone.

## ÉTAPE 1 — Base de données (déjà faite normalement)

Si tu as déjà exécuté `setup.sql` dans Supabase lors de la première tentative,
**tu n'as pas besoin de le refaire**. La base existe déjà et fonctionne.

## ÉTAPE 2 — Nouveau repository GitHub

1. github.com → **New repository**
2. Nom : `ashvex-site-v2` (différent du premier pour éviter toute confusion)
3. Public, sans README/gitignore automatique → **Create repository**
4. **uploading an existing file**
5. **Sélectionne TOUS les fichiers de ce dossier en une seule fois** (ils sont
   tous au même niveau, donc le sélecteur mobile ne devrait avoir aucun mal) :
   - App.jsx
   - main.jsx
   - supabaseClient.js
   - index.html
   - package.json
   - vite.config.js
   - .gitignore
   - README.md
   - setup.sql
6. **Commit changes**

## ÉTAPE 3 — Déployer sur Vercel

1. vercel.com → **Add New Project**
2. Importe `ashvex-site-v2`
3. Réglages par défaut → **Deploy**

## Accès admin

- URL : `https://ashvex.online/#/valmond-nawens-40712070-hgvxy-outeygd`
- Mot de passe : `Valmond12+`
