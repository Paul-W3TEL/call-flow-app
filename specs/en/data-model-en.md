# Data model specification

- **Document title** > Data model specification
- **Version** > 1.1
- **Status** > Internal draft
- **Author** > Paul Koster
- **Date** > April 28th 2026
- **Confidentiality** > Document interne – W3TEL / TEQTEL

------

## Version history

| Version | Date            | Author      | Changelog           |
| ------- | --------------- | ----------- | ------------------- |
| 1.0     | April 28th 2026 | Paul Koster | Initial version     |
| 1.1     | April 30th 2026 | Paul Koster | Correcting mistakes |

------

## Table of content

[toc]

------

## 1. Goal

This project aims to define an internal data model to represent a Call Flow Centrex such as it is:

- Independent from EZVMS
- Exploitable by a JSON API
- Easily displayable in frontend
- Compatible with a partial and controlled edition feature

------

## 2. Conception principles

### 2.1 Independance

The model must **not directly reflect the EZVMS SOAP structure**.
It must instead show a **simplified application logic**:

- Entry point
- Nodes
- Targets

### 2.2 Graph structure

A Call Flow is modeled as an **oriented graph**:

- *Entry point* > start of the graph
- *Nodes* > steps of the scenario
- *Targets* > Final destinations

### 2.3 Responsibility separation

| Element     | Role                 |
|------------ |--------------------- |
| Entry point | Entering the graph   |
| Nodes       | Processing logic     |
| Targets     | External destination |

------

## 3. Global structure

```json
{
  "company": {},
  "entry_point": {},
  "nodes": [],
  "targets": []
}
```

------

## 4. Entities

### 4.1 Company

```json
{
  "company": {
    "company_id": "string",
    "name": "string"
  }
}
```

### 4.2 Entry point

```json
{
  "entry_point": {
    "pilot_number": "string",
    "start_node_id": "string"
  }
}
```

------

## 5. Nodes

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

## 6. Targets

```json
{
  "id": "string",
  "type": "extension | voicemail | external_number | hangup",
  "label": "string",
  "number": "string"
}
```

------

## 7. Parameters exposure

### 7.1 Categorisation

| Parameter      | Category  |
|--------------- |---------- |
| Prompt         | User      |
| DTMF           | User      |
| Id             | Read-only |
| Type           | Read-only |
| Internal flags | Hidden    |

### 7.2 Rules

- *User* > Modification through the UI
- *Read-Only* > Cannot be modified
- *Hidden* > Not exposed
- *Admin* > Future usage

------

## 8. Constraints

- Each node must have a unique `id`
- `start_node_id` must exist
- DTMFs must reference valid node or target `id`'s
- Each menu node must have at least one exit

------

## 9. Full example

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

To contact `Example Company`, you dial 01 23 45 67 89, which leads you to `menu_1`.
If the user enters 1, they are redirected to the `target_1001`, which puts them in contact with an employee

------

## 10. Planned evolution

- Support of advanced conditions
- Adding dynamique variables
- Managing multi-language prompts
- Call Flow versionning

------
