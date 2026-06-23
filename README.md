diff --git a/README.md b/README.md
index 62fb47bc8065ff1da814a3b21afc05ba73e8c866..01baefebfe53880ae9f17b762590f46fcfd5c801 100644
--- a/README.md
+++ b/README.md
@@ -1,39 +1,64 @@
-# Ashvex — Site officiel (v2 — structure simplifiée)
+# Ashvex FamilyDesk — assistant familial anti-paperasse
 
-Tous les fichiers sont à la racine du projet, sans sous-dossier. C'est fait exprès :
-ça évite tout problème lors de l'upload sur GitHub depuis un téléphone.
+Ashvex FamilyDesk est une idée de business de service, pensée pour un débutant :
+aider les familles occupées à gérer la paperasse digitale et les rappels de leurs parents âgés.
 
-## ÉTAPE 1 — Base de données (déjà faite normalement)
+## Problème
 
-Si tu as déjà exécuté `setup.sql` dans Supabase lors de la première tentative,
-**tu n'as pas besoin de le refaire**. La base existe déjà et fonctionne.
+Tout devient digital : portails, mots de passe, formulaires, rendez-vous, documents, assurances,
+factures et rappels. Beaucoup de parents âgés sont dépassés, et leurs enfants adultes doivent gérer
+à distance en plus de leur travail et de leur vie personnelle.
 
-## ÉTAPE 2 — Nouveau repository GitHub
+## Solution
 
-1. github.com → **New repository**
-2. Nom : `ashvex-site-v2` (différent du premier pour éviter toute confusion)
-3. Public, sans README/gitignore automatique → **Create repository**
-4. **uploading an existing file**
-5. **Sélectionne TOUS les fichiers de ce dossier en une seule fois** (ils sont
-   tous au même niveau, donc le sélecteur mobile ne devrait avoir aucun mal) :
-   - App.jsx
-   - main.jsx
-   - supabaseClient.js
-   - index.html
-   - package.json
-   - vite.config.js
-   - .gitignore
-   - README.md
-   - setup.sql
-6. **Commit changes**
+FamilyDesk centralise et suit :
 
-## ÉTAPE 3 — Déployer sur Vercel
+- documents importants ;
+- portails et accès ;
+- rendez-vous ;
+- rappels ;
+- formulaires à préparer ;
+- tâches à confirmer ;
+- messages et dossiers administratifs.
 
-1. vercel.com → **Add New Project**
-2. Importe `ashvex-site-v2`
-3. Réglages par défaut → **Deploy**
+Important : FamilyDesk ne remplace pas un médecin, un avocat ou un conseiller financier.
+Le service organise, rappelle et prépare les informations.
 
-## Accès admin
+## Modèle économique
 
-- URL : `https://ashvex.online/#/valmond-nawens-40712070-hgvxy-outeygd`
-- Mot de passe : `Valmond12+`
+- Setup familial : 299€ à 599€
+- Suivi mensuel : 99€ à 199€/mois
+- Pack urgence paperasse : 79€ à 149€
+- Objectif : 34 familles × 149€/mois = 5 066€/mois
+
+## Pourquoi c'est défendable
+
+Ce n'est pas un simple outil IA. Le client achète :
+
+- confiance ;
+- patience ;
+- suivi humain ;
+- organisation ;
+- rappels ;
+- adaptation à la réalité familiale ;
+- aide bilingue possible pour diaspora / créole / français.
+
+## Déploiement simple
+
+Le site peut fonctionner avec un seul fichier principal : `index.html`.
+
+Sur GitHub :
+
+1. Ouvre `index.html`.
+2. Clique sur le crayon pour modifier.
+3. Remplace le contenu par la nouvelle version.
+4. Clique sur **Commit changes**.
+5. Attends 1 à 3 minutes que Vercel redéploie.
+
+## Commandes développeur
+
+```bash
+npm install
+npm run build
+npm run dev
+```
