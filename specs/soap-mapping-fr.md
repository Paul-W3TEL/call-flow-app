# SOAP Mapping

- **Titre du document** > SOAP Mapping
- **Version** > 1.1
- **Status** > Brouillon interne
- **Auteur** > Paul Koster
- **Date** > 29 avril 2026
- **Confidentialité** > Document interne – W3TEL / TEQTEL

------

## Historique des versions

| Version | Date          | Auteur      | Description          |
| ------- | ------------- | ----------- | -------------------- |
| 1.0     | 29 avril 2026 | Paul Koster | Version initial      |
| 1.1     | 30 avril 2026 | Paul Koster | Correction de fautes |

------

## Table des matières

[toc]

------

## 1. Contexte

Ce document décrit la correspondance entre les données récupérées via l’API SOAP EZVMS et le modèle interne utilisé par l’éditeur de Call Flow.
L’objectif est de rendre l’application indépendante du format EZVMS.

------

## 2. Principe général

Les données EZVMS sont récupérées via des appels SOAP, puis transformées en un modèle JSON interne.
Flux :

```txt
API SOAP EZVMS
    ↓
Parsing XML
    ↓
Objets EZVMS bruts
    ↓
Mapping
    ↓
Modèle interne Call Flow
```

------

## 3. Mapping principal

### 3.1 Entreprise

| Champ SOAP EZVMS | Champ interne        | Type     | Remarque           |
| ---------------- | -------------------- | -------- | ------------------ |
| `companyId`      | `company.company_id` | *string* | Identifiant unique |
| `companyName`    | `company.name`       | *string* | Nom affiché        |

### 3.2 Point d'entrée

| Champ SOAP EZVMS | Champ interne               | Type     | Remarque                        |
| ---------------- | --------------------------- | -------- | ------------------------------- |
| `pilotNumber`    | `entry_point.pilot_number`  | *string* | Numéro appelé par l'utilisateur |
| `mainMenuId`     | `entry_point.start_node_id` | *string* | Premier noeud du Call Flow      |

### 3.3 Noeuds

| Champ SOAP EZVMS | Champ interne              | Type     | Remarque              |
| ---------------- | -------------------------- | -------- | --------------------- |
| `nodeId`         | `nodes[].id`               | *string* | Identifiant unique    |
| `nodeType`       | `nodes[].type`             | *string* | Type de noeud         |
| `nodeName`       | `nodes[].label`            | *string* | Nom affiché           |
| `promptFile`     | `nodes[].prompt`           | *string* | Fichier audio associé |
| `timeout`        | `nodes[].settings.timeout` | *number* | Temps d'attente       |
| `retries`        | `nodes[].settings.retries` | *number* | Nombre d'essais       |

Les types accepté pour un noeud sont: 

| Type EZVMS      | Type interne | Description                                   |
| --------------- | ------------ | --------------------------------------------- |
| Menu interactif | `menu`       | Joue un prompt et attends une saisie DTMF     |
| Transfert       | `transfer`   | Redirigie immédiatement vers une cible        |
| Playback        | `playback`   | Joue un message puis continue automatiquement |

### 3.4 Cibles

| Champ SOAP EZVMS | Champ interne      | Type     | Remarque           |
| ---------------- | ------------------ | -------- | ------------------ |
| `targetId`       | `targets[].id`     | *string* | Identifiant unique |
| `targetNumber`   | `targets[].number` | *string* | Numéro appelé      |
| `targetType`     | `targets[].type`   | *string* | Type de cible      |
| `targetLabel`    | `targets[].label`  | *string* | Nom affiché        |

Les types accepté pour une cible sont: 

| Type EZVMS        | Type interne      | Description                            |
| ----------------- | ----------------- | -------------------------------------- |
| Extension         | `extension`       | Mets en contact avec un numéro interne |
| Messagerie vocale | `voicemail`       | Permet d'enregistrer une message       |
| Numéro externe    | `external_number` | Mets en contact avec un numéro externe |
| Fin d'appel       | `hangup`          | Stop l'appel en cours                  |

------

## 4. Données non exposées à l'utilisateur

Certains paramètres EZVMS peuvent être nécessaires techniquement mais ne doivent pas être affichés dans l'interface.

| Paramètres    | Utilisation interne      | Visible UI | Modifiable |
| ------------- | ------------------------ | ---------- | ---------- |
| `internalId`  | Technique de mapping     | *Non*      | *Non*      |
| `soapVersion` | Compatibilité de l'API   | *Non*      | *Non*      |
| `rawXML`      | Débug uniquement         | *Non*      | *Non*      |
| `menuOrder`   | Reconstruction du graphe | *Non*      | *Non*      |

------

## 5. Points à valider

- Liste exacte des appels SOAP disponibles
- Noms réels des champs EZVMS
- Structure XML retournée
- Types d'actions possibles
- Paramètres modifiables ou non
- Gestion des erreurs SOAP

------
