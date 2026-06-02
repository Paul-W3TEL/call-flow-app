# Protocoles de test

- **Titre du document** > Protocoles de test
- **Version** > 1.4
- **Status** > Brouillon interne
- **Auteur** > Paul Koster
- **Date** > 28 mai 2026
- **Confidentialité** > Document interne – W3TEL / TEQTEL

------

## Historique des versions

| Version | Date        | Auteur      | Description                       |
| ------- | ----------- | ----------- | --------------------------------- |
| 1.0     | 11 mai 2026 | Paul Koster | Version initial                   |
| 1.1     | 11 mai 2026 | Paul Koster | Protocoles de test API            |
| 1.2     | 12 mai 2026 | Paul Koster | Protocoles de test frontend       |
| 1.3     | 28 mai 2026 | Paul Koster | Tests pour l'app complète         |
| 1.4     | 28 mai 2026 | Paul Koster | Protocoles de test mémoire locale |

------

## Table des matières

[toc]

------

## 1. Contexte

Ce document centralise les différents protocoles de test à respecter.
Il sera régulièrement mis à jour selon les fonctionnalités ajouté au projet.

------

## 2. Pré-requis

### 2.1 Accès serveur

Informations nécessaires :

```txt
IP serveur: 172.16.100.251
Port API: 3000
Les noms d'utilisateurs et mots de passes peuvent être fourni par un administrateur du serveur.
```

### 2.2 Outils nécessaires

Depuis le poste local :

- Git Bash
- SSH
- Navigateur web

Depuis le serveur :

- Node.js
- npm
- curl

------

## 3. Connexion au serveur de test

Depuis Git Bash :

```bash
ssh utilisateur@IP_SERVEUR
```

Exemple :

```bash
ssh paul@172.16.100.251
```
Puis entrer son mot de passe.

Résultat attendu :

```txt
Connexion SSH ouverte sur le serveur
```

Erreurs possibles :

```txt
Permission denied
Connection timed out
Host unreachable
```

Actions possibles :

- vérifier l’IP
- vérifier l’utilisateur
- vérifier le mot de passe ou la clé SSH
- vérifier que le serveur est allumé (voir avec l'administrateur)
- vérifier que le port SSH est ouvert (voir avec l'administrateur)

------

## 4. Protocoles de tests API

### 4.1 Démarrage de l'API

Depuis le serveur :

```bash
cd /home/paul/CallFlows/backend
npm install
npm run dev
```

Affichage attendu :

```txt
Call Flow API running on http://localhost:3000
```

Erreurs possibles :

```txt
npm: command not found
node: command not found
Cannot find module
EADDRINUSE
```

Actions possibles :

- vérifier que Node.js est installé (voir avec l'administrateur)
- vérifier que la commande est lancée depuis `backend/`
- vérifier que `package.json` existe (avec la commande `ls`)
- vérifier que `src/server.js` existe (avec la commande `ls ./src`)
- si port occupé, arrêter l’ancien process ou changer le port (voir avec l'administrateur)

### 4.2 Health Check

**Objectif** - Vérifier que l’API répond.

URL navigateur

```txt
http://IP_SERVEUR:3000/api/health
```

Réponse attendue

```json
{
  "status": "ok"
}
```

Statut attendu

```txt
HTTP 200
```

Erreurs possibles :

```txt
Cannot GET /api/health
Connection refused
Timeout
```

Si erreur, vérifier :

- serveur démarré
- bon port
- bonne route dans `server.js`
- pare-feu si test depuis navigateur externe

### 4.3 Contrat API

**Objectif** - Vérifier que le contrat API est accessible.

URL navigateur

```txt
http://IP_SERVEUR:3000/api/contract
```

Réponse attendue

Le contenu JSON de :

```txt
backend/src/api.json
```

La réponse doit contenir au minimum :

```json
{
  "name": "Call Flow Internal API",
  "version": "0.1.0",
  "base_path": "/api"
}
```

Statut attendu

```txt
HTTP 200
```

### 4.4 Récupération d’un Call Flow valide

**Objectif** - Vérifier que l’API retourne les données d'exemple du Call Flow.

URL navigateur

```txt
http://IP_SERVEUR:3000/api/call-flows/100072
```

Réponse attendue

La réponse doit contenir :

```json
{
  "company": {
    "company_id": "10072",
    "name": "Company 10072"
  },
  "entry_point": {
    "pilot_number": 8933100000001,
    "start_node_id": "100"
  },
  "nodes": [],
  "targets": []
}
```

Les tableaux `nodes` et `targets` ne doivent pas être vides.

Statut attendu

```txt
HTTP 200
```

### 4.5 Récupération d’un Call Flow inexistant

**Objectif** - Vérifier que l’API retourne une erreur si l’identifiant société et/ou le numéro pilote est incorrect.

URL navigateur

```txt
http://IP_SERVEUR:3000/api/call-flows/9999/
```

Ou n'importe quel URL non valide

Réponse attendue :

Même réponse qu'un Call Flow valide, mais cette fois les tableaux `nodes` et `targets` doivent être vides.

------

## 5. Protocoles de tests Frontend

### 5.1 Ouverture du frontend (Écran de sélection)

**Objectif** – Vérifier que l’interface s’ouvre sur la liste des Call Flows disponibles.

Depuis le poste local, ouvrir :

```text
frontend/index.html
```

Résultat attendu :

- L'écran de sélection est visible.
- Le titre "Open a Call Flow" est présent.
- Le champ d'entré est visible avec la valeur par défaut (10072)

### 5.2 Chargement d'un Call Flow

**Objectif** – Vérifier que la sélection d'un flux bascule vers l'éditeur.

Actions :

- entrer une ID de Call Flow valide (ou laisser 10072)
- clicker sur load

Résultat attendu :

- L'affichage bascule vers la vue éditeur.
- Les données spécifiques au flux (Nom entreprise, Numéro pilote) sont injectées dans le header.
- Le Graph Canvas affiche la structure du flux.

### 5.3 Retour à la sélection (Back Button)

**Objectif** – Vérifier que l'utilisateur peut quitter l'éditeur pour revenir à la liste.

Action :

- Depuis l'éditeur, cliquer sur le bouton "Back".

Résultat attendu :

- L'interface de l'éditeur disparaît.
- L'écran de sélection est de nouveau visible.
- La sélection précédente est réinitialisée (aucun élément sélectionné par défaut si l'on revient dans un flux).

### 5.4 Sélection depuis la sidebar

**Objectif** - Vérifier que les éléments de la sidebar sélectionnent les bons blocs.

Actions :

- cliquer sur le point d'entrée
- cliquer sur chaque noeud
- cliquer sur chaque cible

Résultat attendu :

- le Detail Panel affiche les informations de l’élément sélectionné
- l’élément sélectionné dans la sidebar utilise le style sélectionné
- le bloc correspondant dans le graph utilise le style sélectionné

### 5.5 Sélection depuis le Graph Canvas

**Objectif** - Vérifier que les blocs du graph sont interactifs.

Actions :

- cliquer sur le point d'entrée
- cliquer sur chaque noeud
- cliquer sur chaque cible

Résultat attendu :

- le curseur devient cliquable au survol
- le Detail Panel affiche les bonnes informations
- le bloc sélectionné est visuellement identifiable
- l’élément correspondant dans la sidebar est aussi sélectionné

### 5.6 Survol synchronisé

**Objectif** - Vérifier que le survol sidebar/graph est synchronisé.

Actions :

- survoler un élément de la sidebar
- observer le bloc correspondant dans le graph
- survoler un bloc du graph
- observer l’élément correspondant dans la sidebar
- quitter le survol

Résultat attendu :

- les deux éléments liés utilisent la couleur de survol
- la couleur de survol est différente de la couleur de sélection
- l’état de survol disparaît quand la souris quitte l’élément
- l’état sélectionné reste visible même après le survol

### 5.7 Désélection

**Objectif** - Vérifier que l’utilisateur peut revenir à un état sans sélection.

Action :

- cliquer sur le bouton `Unselect`

Résultat attendu :

- aucun élément sidebar n’est sélectionné
- aucun bloc graph n’est sélectionné
- le Detail Panel affiche :

```txt
Waiting for selection
```

### 5.8 Options de zoom

**Objectif** - Vérifier que le canva du graph peut être zoomé

Action : 

- cliquer sur le bouton `+`
- cliquer sur le bouton `-`
- cliquer sur le bouton `reset`

Résultat attendu :

- le canva peut zoomer en avant et en arrière selon les entrées utilisateurs

### 5.9 Modification du prompt audio

**Objectif** - Vérifier qu’un prompt peut être remplacé par un fichier local autorisé.

Actions :

- sélectionner un node
- importer un fichier `.mp3`, `.mp4` ou `.wav`

Résultat attendu :

- le prompt affiché prend le nom du fichier importé
- le noeud passe en état modifié
- le bouton/sidebar associé montre un indicateur de modification
- aucune erreur bloquante n’est affichée

Formats autorisés :

```txt
.mp3
.mp4
.wav
```

### 5.10 Refus d’un prompt invalide

**Objectif** - Vérifier que les fichiers non autorisés sont refusés.

Action :

- importer un fichier non autorisé, par exemple `.txt`, `.pdf`, `.jpg`

Résultat attendu :

```txt
Invalid prompt file. Allowed formats: MP3, MP4, WAV.
```

Le prompt existant ne doit pas être remplacé.

### 5.11 Modification des paramètres simples

**Objectif** - Vérifier que les champs éditables peuvent être modifiés.

Actions :

- modifier `Timeout`
- modifier `Retries`

Résultat attendu :

- la valeur est mise à jour dans le Detail Panel
- le noeud passe en état modifié
- aucune erreur n’apparaît si les valeurs restent valides

### 5.12 Modification incorrect

**Objectif** - Vérifier qu'entrer des valeurs négatives bloque la validation

Actions : 

- entrer un nombre négatif dans `Timeout`
- entrer un nombre négatif dans `Retries`

Résultat attendu :

- le noeud concerné affiche un indicateur d’erreur
- l’élément sidebar correspondant affiche un indicateur d’erreur
- le Detail Panel affiche une erreur de validation
- `Apply to EZVMS` est bloqué

### 5.13 Modification incohérente

**Objectif** - Vérifier qu'entrer des valeurs incohérente lève une alerte

Actions :

- entrer un nombre très large dans `Retries`
- entrer 0 dans `Retries`
- entrer 0 dans `Timeout`

Résultat attendu : 

- le noeud concerné affiche un indicateur d'alerte
- l’élément sidebar correspondant affiche un indicateur d’alerte
- le Detail Panel affiche une alerte de validation
- `Apply to EZVMS` n'est pas bloqué

### 5.14 Modification DTMF valide

**Objectif** - Vérifier qu’une destination DTMF peut être modifiée vers une destination existante.

Action :

- modifier une destination DTMF avec un ID existant

Résultat attendu :

- le graph se met à jour
- la modification est acceptée
- le noeud passe en état modifié
- la validation reste valide

### 5.15 DTMF dupliquée

**Objectif** - Vérifier qu'une destination dupliquée est détectée.

Action :

- donner la même destination sur deux DTMF

Résultat attendu :

- le noeud concerné affiche un indicateur d'alerte
- l’élément sidebar correspondant affiche un indicateur d’alerte
- le Detail Panel affiche une alerte de validation
- `Apply to EZVMS` n'est pas bloqué

### 5.16 DTMF réflexif

**Objectif** - Vérifier qu'une destination réflexive est détectée.

Action :

- donner comme destination DTMF l'élément d'origine du lien

Résultat attendu :

- le noeud concerné affiche un indicateur d'alerte
- l’élément sidebar correspondant affiche un indicateur d’alerte
- le Detail Panel affiche une alerte de validation
- `Apply to EZVMS` n'est pas bloqué

### 5.17 Element isolé

**Objectif** - Vérifier qu'un élément inaccessible est détecté

Action :

- modifier les liens DTMF de sorte à avoir un élément isolé

Résultat attendu :

- le noeud concerné affiche un indicateur d'alerte
- l’élément sidebar correspondant affiche un indicateur d’alerte
- le Detail Panel affiche une alerte de validation
- `Apply to EZVMS` n'est pas bloqué

### 5.18 Validation manuelle

**Objectif** - Vérifier le bouton `Validate`.

Action :

- cliquer sur `Validate`

Résultat attendu si valide :

```txt
Validation passed.
```

Résultat attendu si alerte :

```txt
Validation passed, but warnings have been found. Check highlighted blocks.
```

Résultat attendu si erreur :

```txt
Validation failed. Check highlighted blocks.
```

### 5.19 Refresh des données locales

**Objectif** - Vérifier que le bouton `Refresh` annule les modifications locales.

Actions :

- modifier un prompt ou une destination DTMF
- cliquer sur `Refresh`

Résultat attendu :

- les données reviennent à l’état initial
- les indicateurs de modification disparaissent
- les erreurs disparaissent
- aucune sélection n’est active

### 5.20 Application vers EZVMS

**Objectif** - Vérifier que l’application demande confirmation et bloque les erreurs.

Cas valide :

- effectuer une modification valide
- cliquer sur `Apply to EZVMS`

Résultat attendu :

```txt
Apply changes to EZVMS?
```

- confirmer

Résultat attendu :

```txt
Modifications have been sent!
```

*Pensez à vérifier le Centrex EZVMS pour voir si les modifications ont correctement été appliqués*

Cas alerte :

- effectuer une modification qui lève une alerte
- cliquer sur `Apply to EZVMS`

Résultat attendu :

```txt
Validation has found warnings that may block the application. Apply changes to EZVMS?
```

- confirmer

Résultat attendu :

```txt
Modifications have been sent!
```

*Pensez à vérifier le Centrex EZVMS pour voir si les modifications ont correctement été appliqués*

Cas erreur :

- créer une erreur
- cliquer sur `Apply to EZVMS`

Résultat attendu :

```txt
Cannot apply: blocking validation errors exist.
```

### 5.21 Suivi des Modifications de Paramètres

**Objectif** – Vérifier que l'altération d'un paramètre simple ou d'un prompt applique un état visuel modifié au bloc concerné et l'enregistre en mémoire locale.

Actions :

- Charger un Call Flow valide (ex: Société ID `10072`).
- Sélectionner un noeud depuis la Sidebar ou le Graph Canvas.
- Modifier la valeur numérique du champ `Timeout` ou `Retries` par une autre valeur valide.

Résultat attendu :

- Le nouveau paramètre est rendu et mis à jour au sein du Detail Panel.
- Le noeud bascule instantanément en état modifié : une bordure en pointillés habille le bloc du Graph Canvas ainsi que le bouton correspondant dans la Sidebar.
- L'arborescence globale intègre la valeur révisée, et l'identifiant technique de suivi est poussé au sein de la collection d'indexation `modifiedItems`.

### 5.22 Persistance du Brouillon Client

**Objectif** – Vérifier qu'un brouillon de modification non publié est automatiquement préservé sur le stockage navigateur et survit à un rechargement accidentel de page.

Actions :

- Sélectionner un noeud actif et effectuer une modification de prompt ou de routage DTMF.
- Ouvrir l'outil de développement du navigateur (F12) -> Onglet Application/Stockage -> Local Storage.
- Repérer l'entrée associée à la clé `diamy.callFlow.<companyId>` (ex: `diamy.callFlow.10072`).
- Rafraîchir entièrement la page du navigateur (F5 ou Ctrl+F5) puis ressaisir le même Identifiant Entreprise sur l'Écran de Sélection.

Résultat attendu :

- Dès la modification d'un champ, le `localStorage` doit contenir l'objet JSON sérialisé incluant l'arbre `callFlow` modifié et la liste d'éléments `modifiedItems`.
- Après rechargement et re-sélection, l'application court-circuite l'appel serveur réseau et charge les données directement depuis la mémoire du disque local client.
- L'habillage graphique en pointillés des blocs modifiés reste actif, démontrant la bonne restauration de l'état de session.

### 5.23 Invalidation du Cache (Refresh)

**Objectif** – Vérifier que l'activation du rafraîchissement manuel écrase le stockage temporaire local et réinitialise l'application sur les données serveur distantes.

Actions :

- Réaliser plusieurs modifications pour générer un état de brouillon local actif (présence de bordures en pointillés).
- Valider la présence de l'objet de stockage temporaire `diamy.callFlow.<companyId>` au sein du `localStorage`.
- Cliquer sur l'action `Refresh` présente dans la barre d'en-tête, puis accepter les termes du message d'avertissement de la modale de confirmation.

Résultat attendu :

- La confirmation de l'action entraîne la suppression immédiate de l'enregistrement de clé `diamy.callFlow.<companyId>` de la table `localStorage` navigateur.
- L'application relance une transaction HTTP GET distante vers l'API centrale sur la route `/api/call-flows/:companyId/`.
- L'index technique de modification locale est intégralement réinitialisé, provoquant le retour au style graphique nominal sans pointillés.

### 5.24 Validation Distante

**Objectif** – Vérifier que les tables de stockage temporaire local sont supprimé une fois les modifications appliquées vers le moteur distant.

Actions :

- Mettre en place des modifications structurelles valides sur le graphe d'appel pour basculer l'application en état de cache local modifié.
- Confirmer la présence de la clé associée dans le `localStorage` du navigateur.
- Déclencher le processus d'envoi en cliquant sur le bouton `Apply to EZVMS`, valider l'alerte d'avertissement et intercepter la confirmation positive.

Résultat attendu :

- Suite à l'acceptation de la modale, l'application procède à la soumission des données vers le moteur.
- Une routine interne s'exécute automatiquement, entraînant le nettoyage complet de la clé de cache du `localStorage`.
- L'ensemble des entrées d'indexation temporaires stockées en mémoire est purgé.
- À l'écran, toutes les bordures en pointillés se figent à nouveau en bordures pleines nominales, indiquant une synchronisation parfaite avec EZVMS.

------
