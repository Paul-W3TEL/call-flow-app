# Protocoles de test

- **Titre du document** > Protocol de test
- **Version** > 1.1
- **Status** > Brouillon interne
- **Auteur** > Paul Koster
- **Date** > 11 mai 2026
- **Confidentialité** > Document interne – W3TEL / TEQTEL

------

## Historique des versions

| Version | Date        | Auteur      | Description            |
| ------- | ----------- | ----------- | ---------------------- |
| 1.0     | 11 mai 2026 | Paul Koster | Version initial        |
| 1.1     | 11 mai 2026 | Paul Koster | Protocoles de test API |

------

## Table des matières

[toc]

------

## 1. Contexte

Ce document centralise les différents protocoles de test à respecter.
Il sera régulièrement mis à jour selon les fonctionnalités ajouté au projet.

-----

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

---

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

-----

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

-----
