# Call Flow Editor

Modern Call Flow visualisation and controlled edition platform for EZVMS-based Centrex systems.

## Overview

This project aims to create a modern abstraction layer over the EZVMS6800 ecosystem in order to:

- visualise Call Flows as readable graphs
- simplify Call Flow understanding
- isolate frontend applications from SOAP/XML complexity
- expose a clean internal JSON API
- support controlled and secure editing
- integrate into the Diamy ecosystem

The project does **not** aim to recreate EZVMS administration tools entirely.
The goal is to provide a maintainable, evolutive and modern interface layer.

---

## Global Architecture

```txt
EZVMS SOAP API
        ↓
SOAP/XML Parsing
        ↓
Raw EZVMS Objects
        ↓
Mapping Layer
        ↓
Internal JSON Model
        ↓
Frontend Graph UI
```

---

## Repository Structure

```txt
/
├── backend/
│   ├── package.json
|   ├── .env
│   └── src/
│       ├── api.json
│       ├── ezvms/
│       │   ├── ezvmsClient.js
│       │   ├── ezvmsMapper.js
│       │   └── ezvmsParser.js
│       ├── soapMapping.json
│       ├── uiExposureRules.json
│       ├── validationRules.json
│       └── server.js
│
├── frontend/
│   ├── app.js
│   ├── index.html
│   ├── package.json
│   ├── src/
│   │   └── reactFlowGraph.jsx
│   └── style.css
│
├── specs/
│   ├── en/
│   │   ├── data-model-en.md
│   │   ├── overview-en.md
│   │   ├── soap-mapping-en.md
│   │   └── ui-spec-en.md
│   └── fr/
│       ├── data-model-fr.md
│       ├── overview-fr.md
│       ├── soap-mapping-fr.md
│       └── ui-spec-fr.md
│
├── start.sh
└── README.md
```

---

## Specifications

The `specs/` folder contains:

- functional specifications
- UI specifications
- SOAP mapping documentation
- internal data model definitions
- architecture notes

All specifications are written in Markdown.

---

## Current Project State

### Backend

- Operationnal JSON API, asbtracting SOAP complexity
- Endpoints for recovery, validation and update of Call Flows
- Link to fetch call flows and their menus from the Centrex
- Link to send the local modifications for EZVMS sync

### Frontend

- Interface connected to the backend internal API
- Uses the given JSON model to generate a graph and detail panels
- Display using the ReactFlow library
- Dynamic display of nodes, selection states, hover states and validation infos in real time
- Modification of prompts and nodes parameters
- Local memory storage before EZVMS commit

### Service files

Files such as `start.sh` and `.env` are here to help open the app.
More informations in the testing protocols files, section 3.2

---

## Internal Model

The application uses a clean internal representation independent from EZVMS:

```json
{
  "company": {},
  "entry_point": {},
  "nodes": [],
  "targets": []
}
```

This model acts as the canonical application structure.

---

## Main Principles

- Decoupled architecture
- SOAP abstraction
- JSON-first design
- Controlled edition
- Readability of Call Flows
- Maintainability
- Progressive integration

---

## Current Project Phase

The main project is finished and functionnal
Additionnal features can still be added

Current work focuses on:

- Commit history feature
- Better endpoint features

---

## Author

Paul Koster  
W3TEL / TEQTEL
