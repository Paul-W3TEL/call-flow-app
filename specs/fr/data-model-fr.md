# Spécifications modèles de données

- **Titre du document** > Spécifications modèles de données
- **Version** > 1.1
- **Status** > Brouillon interne
- **Auteur** > Paul Koster
- **Date** > 28 avril 2026
- **Confidentialité** > Document interne – W3TEL / TEQTEL

------

## Historique des versions

| Version | Date          | Auteur      | Description          |
| ------- | ------------- | ----------- | -------------------- |
| 1.0     | 28 avril 2026 | Paul Koster | Version initial      |
| 1.1     | 30 avril 2026 | Paul Koster | Correction de fautes |

------

## Table des matières

[toc]

------

## 1. Objectif

Ce projet cherche à définir un modèle de données interne permettant de représenter un Call Flow Centrex de manière :

- indépendante d’EZVMS
- exploitable par une API JSON
- facilement visualisable en frontend
- compatible avec une édition partielle contrôlée

------

## 2. Principes de conception

### 2.1 Indépendance

Le modèle ne doit **pas refléter directement la structure SOAP EZVMS**.
Il doit représenter une **logique métier simplifiée** :

- Point d'entrée
- Noeuds
- Cibles

### 2.2 Structure en graphe

Un Call Flow est modélisé comme un **graphe orienté** :

- *Point d'entrée* > départ du graphe
- *Noeuds* > étapes du scénario
- *Cibles* > destinations finales

### 2.3 Séparation des responsabilités

| Elément        | Rôle                  |
|--------------- |---------------------- |
| Point d'entrée | Entrée dans le graphe |
| Noeuds         | Logique de traitement |
| Cibles         | Destinations externes |

------

## 3. Structure globale

```json
{
  "company": {},
  "entry_point": {},
  "nodes": [],
  "targets": []
}
```

------

## 4. Entités

### 4.1 Entreprise (Company)

```json
{
  "company": {
    "company_id": "string",
    "name": "string"
  }
}
```

### 4.2 Point d'entrée (Entry point)

```json
{
  "entry_point": {
    "pilot_number": "string",
    "start_node_id": "string"
  }
}
```

------

## 5. Noeuds (Nodes)

```json
{
  "id": "string",
  "type": "menu | transfer | playback",
  "label": "string",
  "prompt": "string | null",
  "dtmf": {},
  "settings": {}
}
```

------

## 6. Cibles (Targets)

```json
{
  "id": "string",
  "type": "extension | voicemail | external_number | hangup",
  "label": "string",
  "number": "string"
}
```

------

## 7. Exposabilité des paramètres

### 7.1 Catégorisation

| Paramètre      | Catégorie     |
|--------------- |-------------- |
| Prompt         | Utilisateur   |
| DTMF           | Utilisateur   |
| Id             | Lecture seule |
| Type           | Lecture seule |
| Internal flags | Caché         |

### 7.2 Règles

- *Utilisateur* > Modifiable via UI
- *Lecture seule* > Visible uniquement
- *Caché* > Non exposé
- *Admin* > Usage futur

------

## 8. Contraintes

- Chaque noeud doit avoir un `id` unique
- Le `start_node_id` doit exister
- Les DTMF doivent référencer des id de noeuds ou de cibles valides
- Chaque noeud menu doit avoir au moins une sortie

------

## 9. Exemple complet

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
  
  "nodes": [
    {
      "id": "menu_1",
      "type": "menu",
      "label": "Main Menu",
      "prompt": "welcome.wav",
      "dtmf": {
        "1": "target_1001"
      },
      "settings": {
        "timeout": 5,
        "retries": 3
      }
    }
  ],
  
  "targets": [
    {
      "id": "target_1001",
      "type": "extension",
      "label": "Contact",
      "number": "1001"
    }
  ]
}
```

Pour contacter l'entreprise Example Company, on appelle le 01 23 45 67 89, qui mène au noeud menu_1.
Si l'utilisateur entre le 1, il est ensuite redirigé vers la cible target_1001, qui le met en contact avec un employé.

------

## 10. Evolutions prévues

- Support des conditions avancées
- Ajout de variables dynamiques
- Gestion multi-langue des prompts
- Versionnage des Call Flow

------
