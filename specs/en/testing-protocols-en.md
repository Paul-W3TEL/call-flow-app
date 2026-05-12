# Testing protocols

- **Document title** > Testing protocols
- **Version** > 1.2
- **Status** > Internal draft
- **Author** > Paul Koster
- **Date** > May 12th 2026
- **Confidentiality** > Internal document – W3TEL / TEQTEL

------

## Version history

| Version | Date          | Author      | Description                |
| ------- | ------------- | ----------- | -------------------------- |
| 1.0     | May 11th 2026 | Paul Koster | Initial version            |
| 1.1     | May 11th 2026 | Paul Koster | API testing protocols      |
| 1.2     | May 12th 2026 | Paul Koster | Frontend testing protocols |

------

## Table of content

[toc]

------

## 1. Context

This document centralises different test protocols to respect.
It will often be updated depending on newly added features to the project.

-----

## 2. Prerequisites

### 2.1 Server access

Necessary informations:

```txt
Server IP: 172.16.100.251
API port: 3000
Usernames and password can be given by a server administrator
```

### 2.2 Necessary tools

From the local post:

- Git Bash
- SSH
- Web navigator

From the server:

- Node.js
- npm
- curl

---

## 3. Connection to the test server

From Git Bash

```bash
ssh utilisateur@IP_SERVEUR
```

Example :

```bash
ssh paul@172.16.100.251
```
Then enter a password

Expected result

```txt
SSH connection opened on the server
```

Possible errors:

```txt
Permission denied
Connection timed out
Host unreachable
```

Possible actions:

- check IP
- check the username
- check the password or the SSH key
- check if the server is on (see with the administrator)
- check if the SSH port is poen (see with the administrator)

-----

## 4. API testing protocols

### 4.1 API startup

From the server:

```bash
cd /home/paul/CallFlows/backend
npm install
npm run dev
```

Expected display:

```txt
Call Flow API running on http://localhost:3000
```

Possible errors:

```txt
npm: command not found
node: command not found
Cannot find module
EADDRINUSE
```

Possible actions:

- check if Node.js is installed (see with the administrator)
- check if the command is run from `backend/`
- check if `package.json` exists (run the command `ls`)
- check if `src/server.js` exists (run the command `ls ./src`)
- if the port is in use, stop the previous process or switch ports (see with the administrator)

### 4.2 Health Check

**Goal** - Check if the API replies

Navigator URL

```txt
http://IP_SERVEUR:3000/api/health
```

Expected answer

```json
{
  "status": "ok"
}
```

Expected status

```txt
HTTP 200
```

Possible errors:

```txt
Cannot GET /api/health
Connection refused
Timeout
```

If error, check:

- server was started
- correct port
- correct routing in `server.js`
- firewall if testing from an external navigator

### 4.3 API contract

**Goal** - Check if the API contract is accessible

Navigator URL

```txt
http://IP_SERVEUR:3000/api/contract
```

Expected answer

The JSON content of:

```txt
backend/src/api.json
```

The answer must at least contain:

```json
{
  "name": "Call Flow Internal API",
  "version": "0.1.0",
  "base_path": "/api"
}
```

Expected status

```txt
HTTP 200
```

### 4.4 Fetching of a valid Call Flow

**Goal** - Check if the API returns the example Call Flow data

Navigator URL

```txt
http://IP_SERVEUR:3000/api/call-flows/1001/0123456789
```

Expected answer

The answer must contain

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
  "nodes": [],
  "targets": []
}
```

The `nodes` and `targets` tables must not be empty

Expected status

```txt
HTTP 200
```

### 4.5 Fetching of an invalid Call Flow

**Goal** - Check if the API returns an error if the company ID and/or the pilot number is incorrect

Navigator URL

```txt
http://IP_SERVEUR:3000/api/call-flows/9999/0000000000
http://IP_SERVEUR:3000/api/call-flows/1001/0000000000
http://IP_SERVEUR:3000/api/call-flows/9999/0123456789
```

Or any invalid URL.
URLs follow this logic:
``.../call-flows/[company_id]/[pilot_number]``

Expected answer, in all 3 cases

```json
{
  "error": "CALL_FLOW_NOT_FOUND"
}
```

Expected status

```txt
HTTP 404
```

### 4.6 Validation of a Call Flow

**Goal** - Check if the validation endpoint replies

Server command

```bash
curl -X POST http://localhost:3000/api/call-flows/validate \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected answer

```json
{
  "status": "valid",
  "errors": [],
  "warnings": []
}
```

Expected status

```txt
HTTP 200
```

### 4.7 Updating an example node

**Goal** - Check if the API allows for a draft modification

Server command

```bash
curl -X PATCH http://localhost:3000/api/call-flows/1001/0123456789/nodes/menu_1 \
  -H "Content-Type: application/json" \
  -d '{"prompt":"new-welcome.wav"}'
```

Expected answer

```json
{
  "status": "draft_saved",
  "call_flow": {}
}
```

In `call_flow`, the `menu_1` node must contain:

```json
{
  "prompt": "new-welcome.wav"
}
```

Expected status

```txt
HTTP 200
```

### 4.8 Attempted modification of a read-only field

**Goal** - Vérifier que l’API refuse la modification d’un champ non éditable. / Check if the API refuses the modification of a read-only field

Server command

```bash
curl -X PATCH http://localhost:3000/api/call-flows/1001/0123456789/nodes/menu_1 \
  -H "Content-Type: application/json" \
  -d '{"id":"changed_id"}'
```

Expected answer

```json
{
  "error": "READ_ONLY_FIELD"
}
```

Expected status

```txt
HTTP 400
```

### 4.9 Example application to EZVMS

**Goal** - Check if the application endpoint requires a confirmation

Command without confirmation

```bash
curl -X POST http://localhost:3000/api/call-flows/1001/0123456789/apply \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected answer

```json
{
  "error": "CONFIRMATION_REQUIRED"
}
```

Command with confirmation

```bash
curl -X POST http://localhost:3000/api/call-flows/1001/0123456789/apply \
  -H "Content-Type: application/json" \
  -d '{"confirmed":true}'
```

Expected answer

```json
{
  "status": "applied",
  "message": "Mock apply only. No EZVMS SOAP call was made."
}
```

------

## 5. Frontend testing protocols

### 5.1 Opening the example frontend

**Goal** - Check if the example frontend opens correctly

From the local post, open:

```txt
frontend/index.html
```

Expected result:

- the Diamy header is visible
- the sidebar is visible
- the Graph Canvas is visible
- the Detail Panel is visible
- The status bar is visible

Possible errors:

```txt
blank page
styles not loaded
script not loaded
```

Possible actions:

- check if `index.html`, `styles.css` and `app.js` are all in the same folder
- open the navigator console
- check JavaScript errors

### 5.2 Sidebar selection

**Goal** - Check if every sidebar element selects the correct blocks

Actions:

- click on the entry point
- click on each nodes
- click on each target

Expected result:

- the Detail Panel correctly displays informations about the selected element
- the selected element appears in the sidebar using the selection style
- the corresponding block appears in the graph using the selection style

### 5.3 Graph Canvas Selection 

**Goal** - Check if graph blocks are interactives

Actions:

- click on the entry point
- click on each nodes
- click on each target

Expected result:

- the cursor becomes clickable on hover
- the Detail Panel displays correct information
- le selected block is visually identifiable
- the corresponding sidebar button is also selected

### 5.4 Synchronised hover

**Goal** - Check if the sidebar and graph hovers are synchronised

Actions:

- Hover a sidebar element
- Observe the corresponding graph block
- Hover a graph block
- Observe the corresponding sidebar button
- Stop hovering

Expected result:

- linked elements use the hover color
- the hover color is different than the selection color
- hovered states disappear when the mouse leaves the element
- the selected state remains visible after the hover

### 5.5 Unselection

**Goal** - Check if the user can go back to a selectionless state

Action :

- click the `Unselect` button

Expected result:

- no sidebar element is selected
- no graph block is selected
- the Detail panel displays:

```txt
Waiting for selection
```

### 5.6 Audio prompt modification

**Goal** - Check if a prompt can be replaced by a valid local file

Actions:

- select a node
- import an `.mp3`, `.mp4` or `.wav` file

Expected result:

- the displayed prompt is now the name of the imported file
- the node switches to a modified state
- the associated sidebar element shows a modified indicator
- no blocking error is seen

Formats autorisés :

```txt
.mp3
.mp4
.wav
```

### 5.7 Invalid audio prompt

**Goal** - Check if invalid files are rejected

Action :

- import an invalid file, sucha as `.txt`, `.pdf`, `.jpg`

Expected result:

```txt
Invalid prompt file. Allowed formats: MP3, MP4, WAV.
```

The existing prompt must not be replaced

### 5.8 Simple parameters modification

**Goal** - Check if editable fields can be modifiable

Actions:

- modify `Timeout`
- modify `Retries`

Expected result:

- the value is updated in the Detail Panel
- the node switches to a modified state
- no error is seen as long as entered values are valid

### 5.9 Excessive modification

**Goal** - Check if entering to many retries blocks validation

Actions :

- enter a very large number in `Retries`

Expected result: 

- the node displays an error indicator
- the associated sidebar element displays an error indicator
- the Detail Panem show a validation error
- `Apply to EZVMS` is blocked

### 5.10 Valid DTMF modification

**Goal** - Check if a DTMF destination can be modified to an existing destination

Action :

- modify a DTMF destination with an existing ID

Expected result:

- the modification is accepted
- the node switches to a modified state
- the validation remains valid

### 5.11 Invalid DTMF

**Goal** - Check if an non-existant destination is detected

Action :

- modify a DTMF destination with a non-existant ID

Expected result:

- the node displays an error indicator
- the associated sidebar element displays an error indicator
- the Detail Panem show a validation error
- `Apply to EZVMS` is blocked

### 5.12 Manual validation

**Goal** - Check the `Validate` button

Action :

- click `Validate`

Expected result is valid:

```txt
Validation passed.
```

Expected result if invalid

```txt
Validation failed. Check highlighted blocks.
```

### 5.13 Local data refresh

**Goal** - Check if the `Refresh` button cancels all local modifications

Actions:

- modify a prompt or a DTMF destination
- click `Refresh`

Expected result:

- data come back to their initial state
- modification indicators disappear
- errors disappear
- no selection is active

### 5.14 Application to EZVMS

**Goal** - Check if the application asks for confirmation and blocks errors

Valid case:

- make a valid modification
- click `Apply to EZVMS`
- confir

Expected result:

```txt
Modifications have been sent!
```

Invalid case:

- create an error
- click `Apply to EZVMS`

Expected result:

```txt
Cannot apply: blocking validation errors exist.
```

No application can be simulated if the validation is invalid

------
