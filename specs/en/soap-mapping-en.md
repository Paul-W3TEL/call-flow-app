# SOAP Mapping

- **Document title** > SOAP Mapping
- **Version** > 1.1
- **Status** > Internal draft
- **Author** > Paul Koster
- **Date** > April 29th 2026
- **Confidentiality** > Internal document – W3TEL / TEQTEL

------

## Version history

| Version | Date            | Author      | Changelog           |
| ------- | --------------- | ----------- | ------------------- |
| 1.0     | April 29th 2026 | Paul Koster | Initial version     |
| 1.1     | April 30th 2026 | Paul Koster | Correcting mistakes |

------

## Table of contents

[toc]

------

## 1. Context

This document aims to describe the links between data fetched from the EZVMS SOAP API and the internal model used by the Call Flow Editor.
The application must be independent from the EZVMS format.

------

## 2. Overall principles

The EZMVS data are fetch from SOAP calls, then turned into an internal JSON model.
Flow:

```txt
API SOAP EZVMS
    ↓
XML Parsing
    ↓
Crude EZVMS objects
    ↓
Mapping
    ↓
Internal Call Flow model
```

------

## 3. Main mapping

### 3.1 Company

| SOAP EZVMS field | Internal field       | Type     | Comment        |
| ---------------- | -------------------- | -------- | -------------- |
| `companyId`      | `company.company_id` | *string* | Unique Id      |
| `companyName`    | `company.name`       | *string* | Displayed name |

### 3.2 Entry point

| SOAP EZVMS field | Internal field              | Type     | Comment                     |
| ---------------- | --------------------------- | -------- | --------------------------- |
| `pilotNumber`    | `entry_point.pilot_number`  | *string* | Number called by the user   |
| `mainMenuId`     | `entry_point.start_node_id` | *string* | First node of the Call Flow |

### 3.3 Nodes

| SOAP EZVMS field | Internal field             | Type     | Comment                      |
| ---------------- | -------------------------- | -------- | ---------------------------- |
| `nodeId`         | `nodes[].id`               | *string* | Unique Id                    |
| `nodeType`       | `nodes[].type`             | *string* | Node type                    |
| `nodeName`       | `nodes[].label`            | *string* | Displayed name               |
| `promptFile`     | `nodes[].prompt`           | *string* | Associated audio file        |
| `timeout`        | `nodes[].settings.timeout` | *number* | Waiting time                 |
| `retries`        | `nodes[].settings.retries` | *number* | Number of tries              |

Allowed node types are:

| EZVMS type        | Internal type | Description                                 |
| ----------------- | ------------- | ------------------------------------------- |
| Interactive menu  | `menu`        | Plays a prompt and waits for a DTMF input   |
| Transfer          | `transfer`    | Immediately redirects to a target           |
| Audio play        | `playback`    | Plays a message then automatically proceeds |

### 3.4 Targets

| SOAP EZVMS field | Internal field     | Type     | Comments       |
| ---------------- | ------------------ | -------- | -------------- |
| `targetId`       | `targets[].id`     | *string* | Unique Id      |
| `targetNumber`   | `targets[].number` | *string* | Called number  |
| `targetType`     | `targets[].type`   | *string* | Target type    |
| `targetLabel`    | `targets[].label`  | *string* | Displayed name |

Allowed target types are:

| EZVMS type      | Internal type     | Description                           |
| --------------- | ----------------- | ------------------------------------- |
| Extension       | `extension`       | Opens contact with an internal number |
| Voicemail       | `voicemail`       | Asks to record a voicemail            |
| External number | `external_number` | Opens contact with an external number |
| Hangup          | `hangup`          | Ends the call                         |

------

## 4. Data not exposed to users

Some EZVMS parameters are necessary to the app but must not be displayed in the UI

| Parameter     | Internal use         | UI visibility | Editability |
| ------------- | -------------------- | ------------- | ----------- |
| `internalId`  | Mapping technique    | *No*          | *No*        |
| `soapVersion` | API compatibility    | *No*          | *No*        |
| `rawXML`      | Debugging only       | *No*          | *No*        |
| `menuOrder`   | Graph reconstruction | *No*          | *No*        |

------

## 5. Elements to check

- Exact list of available SOAP calls
- True EZVMS field names
- Reversed XML structure
- Available action types
- Editability of parameters
- SOAP error handling

------
