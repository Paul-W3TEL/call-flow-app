# Editeur de Call Flow - Spécifications

- **Titre du document** > Editeur de Call Flow - Spécifications
- **Version** > 1.1
- **Status** > Brouillon interne
- **Auteur** > Paul Koster
- **Date** > 27 avril 2026
- **Confidentialité** > Document interne – W3TEL / TEQTEL

------

## Historique des versions

| Version | Date          | Auteur      | Description          |
| ------- | ------------- | ----------- | -------------------- |
| 1.0     | 27 avril 2026 | Paul Koster | Version initial      |
| 1.1     | 29 avril 2026 | Paul Koster | Correction de fautes |

------

## Table des matières

[toc]

------

## 1. Contexte

Pour le développement d'un outil interne Diamy, ce projet a pour but de **créer une surcouche moderne** afin de visualiser et de modifier des Call Flows pour les plateformes Centrex basées sur le serveur EZVMS6800.

L'outil actuel (Menu Designer EZVMS) est limité

- Ergonomie obsolète
- Faible lisibilité
- Difficulté de maintenance
- Pas d'intégration avec les outils internes

Le but est donc de créer une interface **moderne, maintenable et intégrable** dans l'écosystème Diamy.

------

## 2. Définition d'un Call Flow

Un Call Flow représente le chemin d'un appel entrant dans un système de téléphonie.
Il comprend:

- Un point d'entrée (le numéro appelé)
- Une série de noeuds (menu, transfert...)
- Des cibles (destinations possibles)

Le Call Flow définit le chemin d'un appel en fonction:

- des choix utilisateurs (DTMF)
- des événements systèmes (timeouts, erreurs...)
- d'une logique de routage prédéfinie.

### 2.1 Point d'entrée

Le point d'entrée représente l'accès initial du Call Flow.
Il est souvent définie par un **numéro pilote** ou un **numéro de téléphone public**.

### 2.2 Noeuds

Un noeud est un élément fonctionnel d'un Call Flow.
Chaque noeud contient:

- Un identifiant
- Un type
- Des paramètres optionnels (prompt, timeout...)
 
Les types courants de noeuds incluent :

- *Menu* > joue un prompt et attends une entrée utilisateur
- *Transfert* > redirige immédiatement vers une cible
- *Lecture simple* > joue un message puis continue automatiquement

### 2.3 Cible

Une cible est une destination possible d'un appel
Chaque cible contient :

- Un identifiant
- Un type
- Un label

Les types courants de cibles incluent :

- *Extension* > mets en contact avec un numéro interne
- *Messagerie vocale* > permet d'enregister un message
- *Numéro externe* > mets en contact avec un numéro externe
- *Fin d'appel* > stop l'appel en cours

### 2.4 Logique de routage

La logique de routage détermine la façon dont l'appel progresse à travers le Call Flow.
Elle se base sur:

- Les choix de l'utilisateurs
- Les règles de secours
- Des destinations prédéfinies

### 2.5 Caractéristiques clés

Un Call Flow peut être représenté par un graphe orienté.
Il compte un seul point d'entrée et plusieurs sorties possibles.
Il doit garantir un chemin valide pour n'importe quelle interaction utilisateur.
Il doit éviter les impasses et les états incohérents.

------

## 3. Objectifs

### 3.1 Objectifs principaux

- Récupérer les Call Flows depuis l'API SOAP EZVMS.
- Transformer les données en un modèle interne indépendant.
- Afficher les scénarios graphiquement.
- Permettre une modification partielle et contrôlée.

### 3.2 Objectifs secondaires

- Ecrire les spécifications en format Markdown (Français & Anglais)
- Définir un modèle de données générique et réutilisable
- Concevoir une architecture EZVMS découplée
- Respecter la charte UI Diamy

------

## 4. Production

### 4.1 Lecture des Call Flow

- Récupérer les données depuis l'API SOAP
- Parsing des réponses XML
- Reconstruction de scénarios complets
- Transformation en un modèle interne

### 4.2 Visualisation

- Représentation en graphe
- Afficher les noeuds
- Afficher les transitions
- Navigation fluide dans le Call Flow
- Panneau de détail contextuel

### 4.3 Edition

Fonctionnalités autorisés:

- Modification des prompts audios
- Configuration des actions DTMF
- Redirections
- Paramètres simples

Contraintes:

- Les paramètres EZVMS ne sont pas exposés
- Certaines données doivent rester en lecture seule

------

## 5. Architecture global

Le système repose sur une architecture en couche découplées.

### 5.1 Couche SOAP

- Communication avec EZVMS
- Appels API SOAP
- Parsing XML
- Gestion des erreurs

### 5.2 Couche métier

- Définition du modèle interne des Call Flows
- Logique de transformation
- Validation des données
- Gestion des règles de métiers

### 5.3 API Interne

- Exposition des données en JSON
- Abstraction complete d'EZVMS
- Interface entre backend et frontend

### 5.4 Frontend

- Visualisation graphique des Call Flows
- Interaction utilisateur
- Edition contrôlée
- Respect de la charte UI Diamy

------

## 6. Flux de données

Le flux de données est le suivant :

EZVMS > API SOAP > Parsing XML > Modèle interne > API JSON > Interface graphique

**Objectif clé** : Isoler entièrement le frontend de la complexité EZVMS.

------

## 7. Principes de conception

### 7.1 Découplage

Le modèle interne ne doit pas dépendre directement d'EZVMS

### 7.2 Lisibilité

Les Call Flows doivent être visuellement compréhensible en un coup d'oeil

### 7.3 Maintenabilité

L'architecture doit permettre:

- Des évolutions futures
- Une réutilisation dans d'autres projets
- Une intégration simple dans l'extranet

### 7.4 Contrôle

L'édition est volontairement limité pour :

- éviter les erreurs critiques
- garantir la cohérence avec EZVMS

------

## 8. Livrables attendus

### 8.1 Documentation

- Spécifications fonctionnels
- Spécifications techniques
- Modèles de données
- Mapping SOAP
- Matrices des paramètres

### 8.2 Prototype

- Backend SOAP
- API interne
- Frontend de visualisation
- Fonctionnalité d'édition limitée

------

## 9. Organisation du projet

### 9.1 Spécification

- Analyse EZVMS
- Cartographie SOAP
- Définition du modèle
- Spécifications UI

### 9.2 Développement

- Implémentation backend
- Création API interne
- Développement frontend
- Intégration progressive

### 9.3 Finalisation

- Stabilisation
- Tests
- Préparation intégration extranet

------

## 10. Principes clés

Ce projet n'a pas pour but de reproduire EZVMS.
L'objectif est de concevoir:

- Une surcouche moderne
- Une abstraction propre
- Un outil maintenable et évolutif

------

## 11. Vision cible

A terme, l'outil permettra:

- Une compréhension rapide des Call Flows
- Une édition simplifiée et sécurisée
- Une intégration complète dans l'écosystème Diamy
- Une base technique réutilisable pour d'autres outils Centrex

------
