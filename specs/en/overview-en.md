# Call Flow Editor - Overview

- **Document title** > Call Flow Editor - Overview
- **Version** > 1.1
- **Status** > Internal draft
- **Author** > Paul Koster
- **Date** > April 27th 2026
- **Confidentiality** > Internal document – W3TEL / TEQTEL

------

## Version history

| Version | Date            | Author      | Changelog           |
| ------- | --------------- | ----------- | ------------------- |
| 1.0     | April 27th 2026 | Paul Koster | Initial version     |
| 1.1     | April 29th 2026 | Paul Koster | Correcting mistakes |

------

## Table of contents

[toc]

------

## 1. Context

In the context of the development of the internal Diamy tool, this project aims to **create a new modern layer** to visualise and edit Call Flows for Centrex platforms based on the EZVMS6800 server.

The current tool (Menu Designer EZVMS) contains many limitations:

- Obsolete ergonomics
- Low readability
- Maintenance complexity
- No internal tool integration

The goal is to create a **modern, maintainable and integrable** interface in the Diamy ecosystem.

------

## 2. Definition of a Call Flow

A Call Flow represents the route of an incoming call in a telephone system.
It contains:

- An entry point (the called number)
- A series of nodes (menu, transfer...)
- Targets (possible destinations)

The Call Flow defines how a call is routed depending on:

- User choices (DTMF)
- System events (timeouts, errors...)
- Predefined routing logic

### 2.1 Entry Point

The entry point represents the initial access to the Call Flow.
It is typically defined by a **pilot number** or a **public phone number**

### 2.2 Nodes

A node is a functional element of the Call Flow.
Each node contains:

- An identifier
- A type
- Optional parameters (prompt, timeout, retries...)

Common node types include:

- *Menu* > plays a prompt and waits for user inputs
- *Transfer* > immediately redirects to a target
- *Playback* > Plays a message then automatically proceeds

### 2.3 Target

A target is a possible destination of a call.
Each target contains:

- An identifier
- A type
- A label

Common target types include:

- *Extension* > opens contact with an internal number
- *Voicemail* > asks to record a voicemail
- *External number* > opens contact with an external number
- *Hangup* > ends the call

### 2.4 Routing logic

The routing logic determines how the call progresses through the Call Flow.
It is based on:

- User choices
- Fallback rules
- Predefined destinations

### 2.5 Key characteristics

A Call Flow can be represented as a **directed graph**.
It has a single entry point and multiple possible exits.
It must guarantee a valid path for any user interaction.
It should avoid dead ends and inconsistent states.

------

## 3. Goals

### 3.1 Main goals

- Fetch Call Flows from the SOAP EZVMS API
- Turn the data into an independent internal model
- Render scenarios using a graphic tool
- Allow a partial and controlled editing mode

### 3.2 Side goals

- Create specifications in Markdown format (French & English)
- Define a generic and reusable data model
- Design an EZVMS decoupled architecture
- Respect the Diamy UI chart.

------

## 4. Production

### 4.1 Call Flow Reading

- Fetching data via the SOAP API
- Parsing XML answers
- Reconstructing full scenarios
- Transformation into an internal model

### 4.2 Visualisation

- Graph representation
- Display the nodes
- Display the transitions
- Fluid navigation in the Call Flow
- Contextual detail panel

### 4.3 Editing

Allowed features:

- Audio prompt modification
- DTMF action configuration
- Redirections
- Simple settings

Constraints:

- EZVMS settings are not exposed
- Some data must remain in read-only mode

------

## 5. Global architecture

The system rests on a decoupled layered architecture

### 5.1 SOAP layer

- Communication with EZVMS
- SOAP API calls
- XML parsing
- Error handling

### 5.2 Application layer

- Internal Call Flows models definition
- Transformation logic
- Data validation
- Application rule management

### 5.3 Internal API

- JSON data exposition
- Complete EZVMS abstraction
- Backend and Frontend interface

### 5.4 Frontend

- Call Flows graphic visualisation
- User interaction
- Controlled edition
- In accord with the Diamy UI chart

------

## 6. Data flow

The data must flow this way

EZVMS > SOAP API > XML parsing > Internal model > JSON API > Graphic interface

Key objective: Fully isolate the frontend from the complexity of EZVMS.

------

## 7. Design principles

### 7.1 Decoupling

The internal model must not directly depend from the EZVMS

### 7.2 Readability

The Call Flows must be visually understandable in just one look

### 7.3 Maintainability

The architecture must allow:

- Future evolutions
- Reusability in other projects
- A simple integration in the extranet

### 7.4 Control

Editing is voluntarily limited to:

- avoid critical mistakes
- guarantee coherence with EZVMS

------

## 8. Expected deliverables

### 8.1 Documentation

- Functional specifications
- Technical specifications
- Data models
- SOAP mapping
- Setting matrices

### 8.2 Prototype

- SOAP backend
- Internal API
- Visualisation frontend
- Limited editing feature

------

## 9. Project planning 

### 9.1 Specification

- EZVMS analysis
- SOAP cartography
- Model definition
- UI specifications

### 9.2 Coding

- Backend implementation
- Internal API development
- Frontend implementation
- Progressive integration

### 9.3 Finalisation

- Stabilisation
- Tests
- Preparing for extranet integration

------

## 10. Key principles

This project does not aim to recreate EZVMS.
The goal is the make:

- A new modern layer
- A clean abstraction
- A maintainable and evolutive tool

------

## 11. Target vision

Eventually, this tool will allow:

- A quick understanding of Call Flows
- A simplified and safe edition feature
- A complete integration in the Diamy ecosystem
- A reusable technical base for other Centrex tools

------
