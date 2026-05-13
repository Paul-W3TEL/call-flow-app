# Protocoles de test

- **Titre du document** > Protocoles de test
- **Version** > 1.2
- **Status** > Brouillon interne
- **Auteur** > Paul Koster
- **Date** > 12 mai 2026
- **Confidentialité** > Document interne – W3TEL / TEQTEL

------

## Historique des versions

| Version | Date        | Auteur      | Description                 |
| ------- | ----------- | ----------- | --------------------------- |
| 1.0     | 11 mai 2026 | Paul Koster | Version initial             |
| 1.1     | 11 mai 2026 | Paul Koster | Protocoles de test API      |
| 1.2     | 12 mai 2026 | Paul Koster | Protocoles de test frontend |

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
http://IP_SERVEUR:3000/api/call-flows/1001/0123456789
```

Réponse attendue

La réponse doit contenir :

```json
{
  "company": {
    "company_id": "1001",
    "name": "Example Company"
  },
  "entry_point": {
    "pilot_number": "0123456789",
    "start_node_id": "menu_1"
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
http://IP_SERVEUR:3000/api/call-flows/9999/0000000000
http://IP_SERVEUR:3000/api/call-flows/1001/0000000000
http://IP_SERVEUR:3000/api/call-flows/9999/0123456789
```

Ou n'importe quel URL non valide
Les URLs suivent cette logique :
``.../call-flows/[company_id]/[pilot_number]``

Réponse attendue, dans les 3 cas

```json
{
  "error": "CALL_FLOW_NOT_FOUND"
}
```

Statut attendu

```txt
HTTP 404
```

### 4.6 Validation d’un Call Flow

**Objectif** - Vérifier que l’endpoint de validation répond.

Commande serveur

```bash
curl -X POST http://localhost:3000/api/call-flows/validate \
  -H "Content-Type: application/json" \
  -d '{}'
```

Réponse attendue

```json
{
  "status": "valid",
  "errors": [],
  "warnings": []
}
```

Statut attendu

```txt
HTTP 200
```

### 4.7 Mise à jour d’un noeud d'exemple

**Objectif** - Vérifier que l’API accepte une modification autorisée en mode brouillon.

Commande serveur

```bash
curl -X PATCH http://localhost:3000/api/call-flows/1001/0123456789/nodes/menu_1 \
  -H "Content-Type: application/json" \
  -d '{"prompt":"new-welcome.wav"}'
```

Réponse attendue

```json
{
  "status": "draft_saved",
  "call_flow": {}
}
```

Dans `call_flow`, le noeud `menu_1` doit contenir :

```json
{
  "prompt": "new-welcome.wav"
}
```

Statut attendu

```txt
HTTP 200
```

### 4.8 Tentative de modification d’un champ interdit

**Objectif** - Vérifier que l’API refuse la modification d’un champ non éditable.

Commande serveur

```bash
curl -X PATCH http://localhost:3000/api/call-flows/1001/0123456789/nodes/menu_1 \
  -H "Content-Type: application/json" \
  -d '{"id":"changed_id"}'
```

Réponse attendue

```json
{
  "error": "READ_ONLY_FIELD"
}
```

Statut attendu

```txt
HTTP 400
```

### 4.9 Application d'exemple vers EZVMS

**Objectif** - Vérifier que l’endpoint d’application demande une confirmation.

Commande sans confirmation

```bash
curl -X POST http://localhost:3000/api/call-flows/1001/0123456789/apply \
  -H "Content-Type: application/json" \
  -d '{}'
```

Réponse attendue

```json
{
  "error": "CONFIRMATION_REQUIRED"
}
```

Commande avec confirmation

```bash
curl -X POST http://localhost:3000/api/call-flows/1001/0123456789/apply \
  -H "Content-Type: application/json" \
  -d '{"confirmed":true}'
```

Réponse attendue

```json
{
  "status": "applied",
  "message": "Mock apply only. No EZVMS SOAP call was made."
}
```

------

## 5. Protocoles de tests Frontend

### 5.1 Ouverture du frontend d'exemple

**Objectif** - Vérifier que l’interface mock s’ouvre correctement.

Depuis le poste local, ouvrir :

```txt
frontend/index.html
```

Résultat attendu :

- le header Diamy est visible
- la sidebar est visible
- le Graph Canvas est visible
- le Detail Panel est visible
- la barre de statut est visible

Erreurs possibles :

```txt
page blanche
styles non chargés
script non chargé
```

Actions possibles :

- vérifier que `index.html`, `styles.css` et `app.js` sont dans le même dossier
- ouvrir la console navigateur
- vérifier les erreurs JavaScript

### 5.2 Sélection depuis la sidebar

**Objectif** - Vérifier que les éléments de la sidebar sélectionnent les bons blocs.

Actions :

- cliquer sur le point d'entrée
- cliquer sur chaque noeud
- cliquer sur chaque cible

Résultat attendu :

- le Detail Panel affiche les informations de l’élément sélectionné
- l’élément sélectionné dans la sidebar utilise le style sélectionné
- le bloc correspondant dans le graph utilise le style sélectionné

### 5.3 Sélection depuis le Graph Canvas

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

### 5.4 Survol synchronisé

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

### 5.5 Désélection

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

### 5.6 Modification du prompt audio

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

### 5.7 Refus d’un prompt invalide

**Objectif** - Vérifier que les fichiers non autorisés sont refusés.

Action :

- importer un fichier non autorisé, par exemple `.txt`, `.pdf`, `.jpg`

Résultat attendu :

```txt
Invalid prompt file. Allowed formats: MP3, MP4, WAV.
```

Le prompt existant ne doit pas être remplacé.

### 5.8 Modification des paramètres simples

**Objectif** - Vérifier que les champs éditables peuvent être modifiés.

Actions :

- modifier `Timeout`
- modifier `Retries`

Résultat attendu :

- la valeur est mise à jour dans le Detail Panel
- le noeud passe en état modifié
- aucune erreur n’apparaît si les valeurs restent valides

### 5.9 Modification incorrect

**Objectif** - Vérifier qu'entrer des valeurs négatives bloque la validation

Actions : 

- entrer un nombre négatif dans `Timeout`
- entrer un nombre négatif dans `Retries`

Résultat attendu :

- le noeud concerné affiche un indicateur d’erreur
- l’élément sidebar correspondant affiche un indicateur d’erreur
- le Detail Panel affiche une erreur de validation
- `Apply to EZVMS` est bloqué

### 5.10 Modification incohérente

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

### 5.11 Modification DTMF valide

**Objectif** - Vérifier qu’une destination DTMF peut être modifiée vers une destination existante.

Action :

- modifier une destination DTMF avec un ID existant

Résultat attendu :

- la modification est acceptée
- le noeud passe en état modifié
- la validation reste valide

### 5.12 Erreur DTMF invalide

**Objectif** - Vérifier qu’une destination inexistante est détectée.

Action :

- modifier une destination DTMF avec une valeur inexistante

Résultat attendu :

- le noeud concerné affiche un indicateur d’erreur
- l’élément sidebar correspondant affiche un indicateur d’erreur
- le Detail Panel affiche une erreur de validation
- `Apply to EZVMS` est bloqué

### 5.13 DTMF dupliquée

**Objectif** - Vérifier qu'une destination dupliquée est détectée.

Action :

- donner la même destination sur deux DTMF

Résultat attendu :

- le noeud concerné affiche un indicateur d'alerte
- l’élément sidebar correspondant affiche un indicateur d’alerte
- le Detail Panel affiche une alerte de validation
- `Apply to EZVMS` n'est pas bloqué

### 5.14 Validation manuelle

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

### 5.15 Refresh des données locales

**Objectif** - Vérifier que le bouton `Refresh` annule les modifications locales.

Actions :

- modifier un prompt ou une destination DTMF
- cliquer sur `Refresh`

Résultat attendu :

- les données reviennent à l’état initial
- les indicateurs de modification disparaissent
- les erreurs disparaissent
- aucune sélection n’est active

### 5.16 Application vers EZVMS

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

Cas erreur :

- créer une erreur
- cliquer sur `Apply to EZVMS`

Résultat attendu :

```txt
Cannot apply: blocking validation errors exist.
```

------
