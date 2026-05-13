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
│       ├── exampleSoap.json
│       ├── soapMapping.json
│       ├── uiExposureRules.json
│       ├── validationRules.json
│       └── server.js
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
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

- JSON definition of endpoints, methods, and error codes
- Functional Express server for health checks
- Initial structures for companies, entry points, nodes, and targets
- Mapping definitions for SOAP-to-JSON conversion, UI exposure permissions, and validation rules

---

## Frontend

The frontend is a modern, interactive Single Page Application (SPA) built with the Diamy UI design language.
It provides a visual abstraction layer that allows users to understand and manage complex Call Flows without needing to navigate the underlying EZVMS SOAP complexity.

- graph visualisation
- node interaction
- detail panels
- validation feedback
- controlled editing features
- Diamy UI integration

### Current Frontend State

- dynamic "Graph Canvas" that renders Call Flow nodes and their DTMF transitions
- synchronized sidebar and canvas that highlight nodes on hover and selection
- contextual panel that displays technical parameters for the selected node
- integrated status bar and chips indicating the current validity and synchronization state
- currently uses a local representation of the internal JSON model for testing visual states and UI logic.

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

- Better graph visualisation
- Live API Integration
- EZVMS synchronization
- Multi-language Support

---

## Current Project Phase

Current work focuses on:

- Better Frontend visuals
- Frontend/Backend Connection
- Backend communication with EZVMS

---

## Author

Paul Koster  
W3TEL / TEQTEL
