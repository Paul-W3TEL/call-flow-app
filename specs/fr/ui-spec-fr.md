# Spécifications de l'Interface Utilisateur

- **Titre du document** > Spécifications de l'Interface Utilisateur
- **Version** > 1.1
- **Status** > Brouillon interne
- **Auteur** > Paul Koster
- **Date** > 30 avril 2026
- **Confidentialité** > Document interne – W3TEL / TEQTEL

------

## Historique des versions

| Version | Date          | Auteur      | Description          |
| ------- | ------------- | ----------- | -------------------- |
| 1.0     | 30 avril 2026 | Paul Koster | Version initial      |
| 1.1     | 30 avril 2026 | Paul Koster | Correction de fautes |

------

## Table des matières

[toc]

------

## 1. Contexte

Ce document définit les spécifications UI du prototype d'éditeur de Call Flow EZVMS.
L'objectif est de remplacer l'interface EZVMS existante "Menu Designer" par une interface moderne, lisible et cohérente avec la charte Diamy.
Cette interface doit permettre de :

- visualiser graphiquement un Call Flow
- comprendre rapidement les menus et actions
- éditer uniquement les paramètres autorisés
- préparer une intégration future dans l'extranet Diamy

## 2. Principes UI

### 2.1 Clarté

L'utilisateur doit comprendre immédiatement :

- le point d'entrée du Call Flow
- les menus disponibles
- les touches DTMF configurées
- les destinations des appels
- les erreurs ou paramètres incomplets

### 2.2 Sobriété

L'interface doit rester technique, neutre et professionnelle.
Les effets visuels doivent être limités aux éléments utiles :

- sélection
- survol
- erreur
- validation
- état modifié

### 2.3 Cohérence Diamy

Tous les composants doivent respecter la charte Diamy :

- typographies : `Space Grotesk`, `Inter`, `IBM Plex Mono`
- couleur principale : Diamy Teal `#3FA99C`
- grille responsive
- composants prévus dans le UI Kit Diamy

### 2.4 Edition contrôlée

Tous les paramètres EZVMS ne doivent pas être exposés.
L'interface distingue clairement :

- les champs modifiables
- les champs en lecture seule
- les champs masqués
- les champs réservés administrateur

-----

## 3. Structure générale de l'écran

L'écran principal est composé de quatre zones.

```txt
+------------------------------------------------+
| Header                                         |
+----------------+---------------+---------------+
| Sidebar        | Graph Canvas  | Detail Panel  |
| Call Flow list | Visual editor | Node settings |
+----------------+---------------+---------------+
| Status / validation bar                        |
+------------------------------------------------+
```

-----

## 4. Header

### 4.1 Affichage

Le header contient :

- Le nom de l'application
- La société sélectionnée
- Le Call Flow sélectionné
- L'état de sauvegarde
- Les actions principales

### 4.2 Actions principales

| Action           | Description                             |
| ---------------- | --------------------------------------- |
| `Refresh`        | Recharge les données depuis EZVMS       |
| `Save draft`     | Sauvegarde localement les modifications |
| `Validate`       | Vérifie la cohérence du Call Flow       |
| `Export JSON`    | Exporte le modèle interne               |
| `Apply to EZVMS` | Envoie les modifications vers EZVMS     |

L'action `Apply to EZVMS` doit être protégé par une confirmation

-----

## 5. Sidebar

### 5.1 Généralitées

La sidebar permet de naviguer entre les éléments du Call Flow
Elle contient :

- La liste des menus
- Les points d'entrée
- Les prompts audio
- Les erreurs détectées
- Un champ de recherche

### 5.2 Affichage des menus

Chaque menu affiche :

- Son identifiant
- Son libellé
- Son type
- Son statut

### 5.3 Etats visuels

| Etat            | Affichage                 |
| --------------- | ------------------------- |
| `sélectionné`   | bordure ou fond accentué  |
| `modifié`       | indicateur visuel discret |
| `erreur`        | icône rouge               |
| `lecture seule` | opacité réduite           |
| `masqué`        | non affiché               |

-----

## 6. Graph Canvas

### 6.1 Généralitées

Le Graph Canvas est la zone principale de visualisation
Il affiche le Call Flow sous forme de graphe composé de :

- noeuds
- point d'entrée
- cibles
- connexions
- transitions DTMF

### 6.2 Types d'affichages

| Type           | Objet         | Description                            | Couleur d'affichage |
| -------------- | ------------- | -------------------------------------- | ------------------- |
| Point d'entrée | `entry_point` | Début du graphe                        | #4CAF50           |
| Menu           | `node`        | Menu vocal EZVMS                       | #3FA99C           |
| Transfert      | `node`        | Redirection vers une cible             | #2F8F83           |
| Playback       | `node`        | Joue un message                        | #25786E           |
| Extension      | `target`      | Mets en contact avec un numéro interne | #7D5BA6           |
| Numéro externe | `target`      | Mets en contact avec un numéro externe | #6A4C93           |
| Voicemail      | `target`      | Messagerie vocale                      | #593C82           |
| Hangup         | `target`      | Fin de l'appel                         | #482F6F           |
| Erreur         | autre         | Gestion des erreurs                    | #D64545           |
| Inconnu        | autre         | Si un objet n'est pas reconnu          | #6F7577           |

### 6.3 Contenu d'un noeud menu

Un noeud menu doit afficher :

- Le nom du menu
- L'Id du menu
- Le prompt principal
- Le nombre maximal de digits DTMF
- Le nombre de retries
- Les actions possibles

Exemple

```text
Main Menu
menu_1

Prompt: welcome.wav
Max DTMF: 1
Retry: 3

1 -> Sales
2 -> Support
# -> Operator 
```

-----

## 7. Detail panel

### 7.1 Sections d'un menu

Le panneau de détail affiche les paramètres du noeud sélectionné.
Il est organisé en sections

```text
General
Prompt
DTMF Actions
Fallback Actions
Advanced
Validation
```

### 7.2 General

| Champ         | Modifiable | Description               |
| ------------- | ---------- | ------------------------- |
| `Company ID`  | Non        | Identifiant société EZVMS |
| `Menu ID`     | Non        | Identifiant du menu       |
| `Menu Type`   | Oui, admin | Type de point d'entrée    |
| `Description` | Oui        | Description lisible       |
| `Max DTMF`    | Oui        | Nombre de digits max      |
| `Retry count` | Oui        | Nombre de retries max     |

### 7.3 Prompts

| Champ                          | Modifiable | Description                          |
| ------------------------------ | ---------- | ------------------------------------ |
| `Main Prompt`                  | Oui        | Prompt à l'entrée du menu            |
| `Retry Prompt`                 | Oui        | Prompt lors d'une nouvelle tentative |
| `Invalid Prompt`               | Oui        | Prompt si DTMF invalide              |
| `Ext. Not Found Prompt`        | Oui        | Prompt si extension inconnue         |
| `Transfer Prompt`              | Oui        | Prompt avant transfert               |
| `Default Leave Message Prompt` | Oui        | Prompt avant dépôt de message        |
| `Ext. No VMS Prompt`           | Oui        | Prompt si messagerie indisponible    |

Les prompts doivent être sélectionnés dans une liste contrôlée.
Aucun nom de fichier libre ne doit être saisi sans validation

### 7.4 DTMF actions

Chaque action DTMF est présenté dans un tableau.
Exemple :

| Input | Action                  | Valeur   | Modifiable |
| ----- | ----------------------- | -------- | ---------- |
| 1     | 'Transfer to Extension' | 1001     | Oui        |
| 2     | 'Jump to Menu'          | menu_2   | Oui        |
| 9     | 'Transfer to Operator'  | operator | Oui        |
| #     | 'Repeat Prompt'         | -        | Oui        |

### 7.5 Fallback actions

| Champ                   | Description                            |
| ----------------------- | -------------------------------------- |
| `Retry Fail Action`     | Action après nombre maximal de retries |
| `Default Action`        | Action si aucun DTMF n'est reçu        |
| `Ext. Busy Menu`        | Menu si extension occupée              |
| `Ext. No Answer Menu`   | Menu si pas de réponse                 |
| `Ext. Unavailable Menu` | Menu si extension indisponible         |
| `Operator Busy Menu`    | Menu si opérateur indisponible         |

-----

## 8. Formulaires

### 8.1 Règles générales

Les formulaires doivent :

- Afficher les champs par groupe logiques
- Indiquer les champs obligatoire
- Indiquer les erreurs au plus près du champ
- Empêcher la sauvegarde si les données sont invalides

### 8.2 Champs en lecture seule

Les champs non-modifiables utilisent un style read-only

```css
background: var(--neutral-100);
border: 1px dashed var(--neutral-300);
font-family: "IBM Plex Mono", monospace;
```

### 8.3 Champs modifiables

Les champs modifiables utilisent les composants standards Diamy :

- `DiInput`
- `DiSelect`
- `DiCheckbox`
- `DiTable`
- `DiButton`

-----

## 9. Validation

L'interface doit détecter les incohérences avant sauvegarde

### 9.1 Erreurs bloquantes

| Code                  | Description                                      |
| --------------------- | ------------------------------------------------ |
| `MissingMainPrompt`   | Menu sans prompt principal                       |
| `InvalidTarget`       | Action vers un menu ou une extension inexistante |
| `DuplicateEntryPoint` | Plusieurs menus pour le même type d'entrée       |
| `InvalidDTMF`         | Touche DTMF invalide                             |
| `EmptyAction`         | Action DTMF sans valeur attendue                 |

### 9.2 Avertissements

| Code                   | Description                                  |
| ---------------------- | -------------------------------------------- |
| `UnreachableMenu`      | Menu non accessible depuis le point d'entrée |
| `NoDefaultAction`      | Aucun fallback défini                        |
| `HighRetryCount`       | Retry Count anormalement élevé               |
| `UnknownPrompt`        | Prompt non trouvé dans la liste              |
| `HiddenEZVMSParameter` | Paramètre EZVMS non exposé dans l'UI         |

### 9.3 Affichage des erreurs

Les erreurs doivent être visibles :

- Dans le panneau de détail
- Dans la sidebar
- Sur le noeud concerné
- Dans la barre de validation

-----

## 10. Etats de modification

| Etat          | Description                            |
| ------------- | -------------------------------------- |
| `Clean`       | Données synchronisées avec EZVMS       |
| `Dirty`       | Modifications locales non sauvegardées |
| `Draft saved` | Brouillon local sauvegardé             |
| `Valid`       | Call Flow valide                       |
| `Invalid`     | Erreurs bloquantes                     |
| `Sync error`  | Erreur lors de l'appel SOAP            |
| `Applied`     | Modifications envoyées à EZVMS         |

-----

## 11. Actions utilisateur

### 11.1 Sélectionner un nœud

Quand l'utilisateur clique sur un noeud :

- Le noeud devient sélectionné
- Le panneau de détail affiche ses propriétés
- Les connexions entrantes et sortantes sont mises en évidence


### 11.2 Modifier une action DTMF

L'utilisateur peut :

- Ajouter une touche
- Modifier l'action
- Modifier la destination
- Supprimer l'action

Contraintes :

- Une touche ne peut pas être dupliquée dans un même menu
- La destination doit exister
- Les actions destructives nécessitent confirmation

### 11.3 Modifier un prompt

L'utilisateur peut sélectionner un prompt existant.
Le système doit afficher :

- Nom du fichier
- Type
- Disponibilité
- Eventuel statut d'erreur

-----

## 12. Modales

### 12.1 Confirmation d'application EZVMS

Avant d'appliquer les changements vers EZVMS, afficher une modale.
Contenu :

```text
Apply changes to EZVMS?

This action will update the remote EZVMS configuration.
Please verify the Call Flow before continuing.
```

Actions :

- `Cancel`
- `Apply changes`

### 12.2 Suppression d'action

Avant de supprimer une action DTMF :

```text
Delete DTMF action?

Key: 1
Action: Transfer to Extension
Target: 1001
```

Actions :

- `Cancel`
- `Delete`

-----

## 13. Responsive

### 13.1 Ordinateur

Vue complète :

- sidebar
- graph canvas
- detail panel
 
### 13.2 Tablette

La sidebar peut être repliable
Le panneau de détail peut s'afficher en drawer

-----

## 14. Accessibilité

L'interface doit respecter :

- contraste WCAG AA
- navigation clavier
- focus visible
- labels explicites
- messages d'erreur textuels
- pas d'information transmise uniquement par la couleur

Chaque noeud du graphe doit avoir un équivalent textuel accessible.

-----

## 15. Composants attendus

| Composant     | Usage                            |
| ------------- | -------------------------------- |
| `DiButton`    | Actions principales              |
| `DiInput`     | Champs texte                     |
| `DiSelect`    | Sélection d'action, menu, prompt |
| `DiCheckbox`  | Options booléennes               |
| `DiTable`     | Liste des actions DTMF           |
| `DiModal`     | Confirmations                    |
| `DiTooltip`   | Aide contextuelle                |
| `DiToast`     | Feedback temporaire              |
| `DiBadge`     | Statuts                          |
| `DiGraphNode` | Noeud de Call Flow               |
| `DiGraphEdge` | Connexion entre noeuds           |

-----

## 16. Tokens UI

```css
--diamy-color-primary: #3FA99C;
--diamy-color-primary-600: #2F8F83;
--diamy-color-error: #D64545;
--diamy-color-warning: #F5A623;
--diamy-color-info: #3A7BD5;

--diamy-radius-sm: 6px;
--diamy-radius-md: 10px;
--diamy-radius-lg: 16px;

--diamy-space-1: 4px;
--diamy-space-2: 8px;
--diamy-space-3: 12px;
--diamy-space-4: 16px;
--diamy-space-5: 24px;
--diamy-space-6: 32px;

--diamy-shadow-card:
  0px 2px 6px rgba(0,0,0,0.05),
  0px 6px 18px rgba(0,0,0,0.08);
```

-----

## 17. Hors périmètre UI

Les éléments suivants ne sont pas inclus dans cette première version :

- édition complète de tous les paramètres EZVMS
- gestion avancée des prompts audio
- éditeur audio
- monitoring temps réel
- gestion complète des droits utilisateurs
- publication automatique sans validation
- refonte complète de l'administration EZVMS

-----

## 18. Critères d'acceptation

La spécification UI est considérée valide si :

- l'écran principal est clairement défini
- les zones UI sont identifiées
- les composants Diamy sont utilisés
- les paramètres modifiables et non modifiables sont distingués
- les erreurs principales sont prévues
- le graphe permet de comprendre le Call Flow
- l'édition reste limitée et contrôlée
- l'interface respecte la charte Diamy

-----

## 19. Notes pour développement

Aucun développement frontend ne doit commencer sans validation de ce document.
Les étapes recommandées sont :

- valider cette spécification UI
- créer les wireframes
- définir le modèle JSON utilisé par l'interface
- créer les composants UI isolés
- intégrer la visualisation du graphe
- ajouter l'édition contrôlée
- connecter l'API interne
- ajouter validation et sauvegarde

-----
