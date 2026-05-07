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
│   └── src/
│       ├── api.json
│       ├── exampleData.json
│       ├── soapExample.json
│       ├── soapMapping.json
│       ├── validationRules.json
│       └── server.js
│
├── frontend/
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

## Backend

The backend is responsible for:

- communicating with EZVMS SOAP services
- parsing XML responses
- reconstructing Call Flow graphs
- mapping SOAP structures into internal models
- validating Call Flow consistency
- exposing a clean JSON API

### Current Backend State

Currently implemented:

- internal API contract
- mock Call Flow data
- SOAP mapping model
- validation rules
- architecture structure

Planned later:

- real SOAP integration
- XML parsing
- authentication
- persistence
- REST endpoints
- synchronization workflow

---

## Frontend

The frontend will provide:

- graph visualisation
- node interaction
- detail panels
- validation feedback
- controlled editing features
- Diamy UI integration

Current state:

```txt
Frontend structure prepared
Implementation pending
```

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

## Planned Features

- Graph visualisation
- Prompt editing
- DTMF action editing
- Validation engine
- EZVMS synchronization
- Export features
- Multi-language prompt support
- Future versioning support

---

## Current Project Phase

Current work focuses on:

- architecture
- specifications
- internal models
- backend structure
- SOAP mapping
- validation rules
- mock data

---

## Author

Paul Koster  
W3TEL / TEQTEL
