Nom : SY
Prénom : Sokhna
Groupe : Alaa - Sokhna - Fulbert
# ShopNow JS — Application sous test Selenium

Mini application e-commerce en **JavaScript / Node.js / Express**, destinée au TP INF243.

## Fonctionnalités
- Créer un compte
- Se connecter / se déconnecter
- Consulter le catalogue
- Consulter un produit
- Ajouter au panier
- Modifier la quantité
- Supprimer un produit
- Vider le panier
- Calculer le total
- API REST


# ShopNow — Tests fonctionnels Selenium (INF243)
## Installation du projet
```bash

# Se placer dans le dossier du projet
cd shopnow-app

# Installer les dépendances (Express, Mocha, Chai, Selenium WebDriver)
npm install
```

## Lancer ShopNow

```bash
npm start
```

L'application est alors accessible sur [http://localhost:3000](http://localhost:3000). Laisser ce terminal ouvert pendant toute la durée des tests.

## Lancer les tests

Dans un second terminal, à la racine du projet :

```bash
npm test
```

Cette commande s'appuie sur la configuration `.mocharc.json`, qui exécute automatiquement l'ensemble des fichiers `*.test.js` présents dans `tests/e2e/` (aucun argument supplémentaire à fournir).

## Navigateur utilisé

**Google Chrome**, piloté via `selenium-webdriver` (v4.49). Le driver Chrome (ChromeDriver) est géré automatiquement par le *Selenium Manager* intégré : aucune installation manuelle du driver n'a été nécessaire.

## Nombre de tests réalisés

| | |
|---|---|
| Fichiers de test (`*.test.js`) | 14 |
| Scénarios (`it`) | 41 |
| Assertions (`expect`) | 51 |
| Page Objects | 3 (`LoginPage`, `ProductsPage`, `CartPage`) |

Couverture fonctionnelle : accueil, catalogue produits, détail produit, connexion (réussie et refusée), création de compte, panier (ajout, quantité, calcul du total, suppression, vidage), déconnexion, attente explicite, et un scénario End-to-End complet reliant toutes ces étapes.

## Difficultés rencontrées et solutions apportées

### 1. Politique d'exécution PowerShell bloquant `npx`
**Difficulté :** `npx` refusait de s'exécuter (`UnauthorizedAccess`, scripts désactivés par défaut sous Windows).
**Solution :** exécution de `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, limitée au compte utilisateur courant (sans droits administrateur).

### 2. Fenêtre Chrome se fermant "trop vite"
**Difficulté :** les tests semblaient échouer car la fenêtre Chrome s'ouvrait et se refermait en une fraction de seconde.
**Solution :** ce n'était pas une erreur — les tests réussissaient simplement en moins de 200 ms. Un `driver.sleep()` temporaire a été ajouté en phase de mise au point pour visualiser le déroulement, puis retiré avant le rendu final (une pause fixe n'a pas sa place dans un test automatisé fiable).

### 3. Alerte JavaScript native bloquant Selenium
**Difficulté :** l'ajout d'un produit au panier déclenche un `window.alert()` de confirmation. Toute commande Selenium suivante échouait avec `UnexpectedAlertOpenError`.
**Solution :** ajout d'une attente explicite `driver.wait(until.alertIsPresent())` suivie de `alert.accept()` immédiatement après chaque clic sur "Ajouter au panier".

### 4. Élément présent dans le DOM mais pas encore visible
**Difficulté :** le message de confirmation d'inscription (`register-message`) était détecté par Selenium (`elementLocated`) mais son `isDisplayed()` renvoyait `false`, le contenu étant inséré par JavaScript après la réponse du serveur.
**Solution :** remplacement de l'attente de simple présence par une attente explicite de visibilité : `driver.wait(until.elementIsVisible(element))`.

### 5. Éléments du panier devenant obsolètes après chaque action
**Difficulté :** le panier est entièrement régénéré (`innerHTML`) à chaque clic sur `+`/`−`/`Supprimer`, ce qui invalidait toute référence Selenium conservée sur un ancien élément (`StaleElementReferenceError` potentielle).
**Solution :** re-localisation systématique des éléments (boutons, quantité) juste avant chaque interaction, plutôt que de réutiliser une référence acquise plus tôt.

### 6. Vérification du calcul du total, pas seulement de son affichage
**Difficulté :** l'énoncé demandait de vérifier le résultat *fonctionnel* du total, pas uniquement sa présence à l'écran.
**Solution :** extraction du prix unitaire réel (page détail produit) et de la quantité affichée, conversion du texte de prix en nombre (`parsePrice`), puis comparaison du total affiché au calcul `prix × quantité` avec une tolérance de 0,01 (pour absorber les arrondis d'affichage).

### 7. Module Page Object introuvable (`MODULE_NOT_FOUND`)
**Difficulté :** le chemin relatif `require('../pages/LoginPage')` échouait car le fichier `tests/pages/LoginPage.js` n'existait pas encore physiquement dans l'arborescence du projet.
**Solution :** création du dossier `tests/pages/` et des fichiers `LoginPage.js`, `ProductsPage.js`, `CartPage.js`, en respectant strictement la casse (Node.js étant sensible à la casse des noms de fichiers).

### 8. Sélecteurs de quantité mal identifiés
**Difficulté :** `quantity-{id}` avait été supposé être un champ de saisie modifiable, alors qu'il s'agissait en réalité d'un simple `<span>` d'affichage, la modification se faisant via deux boutons distincts (`data-action="increase"` / `"decrease"`).
**Solution :** lecture du HTML/JS réel de l'application (`cart.js`) avant d'écrire le test définitif, pour cibler les vrais sélecteurs plutôt que de deviner la structure.
