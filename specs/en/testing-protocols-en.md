# Testing protocols

- **Document title** > Testing protocols
- **Version** > 1.4
- **Status** > Internal draft
- **Author** > Paul Koster
- **Date** > May 28th 2026
- **Confidentiality** > Internal document – W3TEL / TEQTEL

------

## Version history

| Version | Date          | Author      | Description                    |
| ------- | ------------- | ----------- | ------------------------------ |
| 1.0     | May 11th 2026 | Paul Koster | Initial version                |
| 1.1     | May 11th 2026 | Paul Koster | API testing protocols          |
| 1.2     | May 12th 2026 | Paul Koster | Frontend testing protocols     |
| 1.3     | May 28th 2026 | Paul Koster | Testing for the full app       |
| 1.4     | May 28th 2026 | Paul Koster | Local memory testing protocols |

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

-----

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
http://IP_SERVEUR:3000/api/call-flows/10072
```

Expected answer

The answer must contain

```json
{
  "company": {
    "company_id": "10072",
    "name": "Company 10072"
  },
  "entry_point": {
    "pilot_number": 8933100000001,
    "start_node_id": "100"
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
http://IP_SERVEUR:3000/api/call-flows/9999/
```

Or any invalid URL

Expected answer:

Same answer as a valid call flow, but this time the `nodes` and `targets` tables must be empty

------

## 5. Frontend testing protocols

### 5.1 Opening the frontend (Selection screen)

**Goal** - Check if the interface opens on available Call Flow list

From the local post, open:

```txt
frontend/index.html
```

Expected result:

- the selection screen is visible
- the title "Open a Call Flow" is displayed
- the entry field shows the default placeholder (10072)

### 5.2 Loading a Call Flow

**Goal** - Check if selecting a call flow switches to the editor

Actions :

- enter a valid call flow id (or leave 10072)
- click load

Expected result :

- the screen switches to the editor view
- data specific to the flow (company name, pilot number) are injected in the header
- the Graph Canvas displays the flow structure

### 5.3 Back to the selection

**Goal** - Check if the user can leave the editor and come back to the list

Action

- From the editor, click the "Back" button

Expected result :

- the editor interface disapears
- the selection screen is displayed
- the previous selection is reinitialised (no element is selected by default if the flow is re-entered)

### 5.4 Sidebar selection

**Goal** - Check if every sidebar element selects the correct blocks

Actions:

- click on the entry point
- click on each nodes
- click on each target

Expected result:

- the Detail Panel correctly displays informations about the selected element
- the selected element appears in the sidebar using the selection style
- the corresponding block appears in the graph using the selection style

### 5.5 Graph Canvas Selection 

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

### 5.6 Synchronised hover

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

### 5.7 Unselection

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

### 5.8 Audio prompt modification

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

### 5.9 Invalid audio prompt

**Goal** - Check if invalid files are rejected

Action :

- import an invalid file, sucha as `.txt`, `.pdf`, `.jpg`

Expected result:

```txt
Invalid prompt file. Allowed formats: MP3, MP4, WAV.
```

The existing prompt must not be replaced

### 5.10 Simple parameters modification

**Goal** - Check if editable fields can be modifiable

Actions:

- modify `Timeout`
- modify `Retries`

Expected result:

- the value is updated in the Detail Panel
- the node switches to a modified state
- no error is seen as long as entered values are valid

### 5.11 Incorrect modification

**Goal** - Check if entering negative values blocks modifications

Actions:

- enter a negative number in `Timeout`
- enter a negative number in `Retries`

Expected result:

- the node displays an error indicator
- the associated sidebar element displays an error indicator
- the Detail Panel show a validation error
- `Apply to EZVMS` is blocked

### 5.12 Incoherent modification

**Goal** - Check if entering incoherent values raises an alert

Actions :

- enter a very large number in `Retries`
- enter 0 in `Retries`
- enter 0 in `Timeout`

Expected result: 

- the node displays an alert indicator
- the associated sidebar element displays an alert indicator
- the Detail Panel show a validation alert
- `Apply to EZVMS` is not blocked

### 5.13 Valid DTMF modification

**Goal** - Check if a DTMF destination can be modified to an existing destination

Action :

- modify a DTMF destination with an existing ID

Expected result:

- the modification is accepted
- the node switches to a modified state
- the validation remains valid

### 5.14 Invalid DTMF

**Goal** - Check if an non-existant destination is detected

Action :

- modify a DTMF destination with a non-existant ID

Expected result:

- the node displays an error indicator
- the associated sidebar element displays an error indicator
- the Detail Panel show a validation error
- `Apply to EZVMS` is blocked

### 5.15 Duplicated DTMF

**Goal** - Check if a duplicate destination is detected

Action :

- give the same destination on two DTMF

Expected result:

- the node displays an alert indicator
- the associated sidebar element displays an alert indicator
- the Detail Panel show a validation alert
- `Apply to EZVMS` is not blocked

### 5.16 Reflexive DTMF

**Goal** - Check if a reflexive destination is detected

Action :

- give as a DTMF destination the origin of the link

Expected result:

- the node displays an alert indicator
- the associated sidebar element displays an alert indicator
- the Detail Panel show a validation alert
- `Apply to EZVMS` is not blocked

### 5.17 Isolated element

**Goal** - Check if an isolated element is detected

Action :

- modify DTMF links in order to have an isolated element

Expected result:

- the node displays an alert indicator
- the associated sidebar element displays an alert indicator
- the Detail Panel show a validation alert
- `Apply to EZVMS` is not blocked

### 5.18 Manual validation

**Goal** - Check the `Validate` button

Action :

- click `Validate`

Expected result is valid:

```txt
Validation passed.
```

Expected result if warnings:

```txt
Validation passed, but warnings have been found. Check highlighted blocks.
```

Expected result if errors:

```txt
Validation failed. Check highlighted blocks.
```

### 5.19 Local data refresh

**Goal** - Check if the `Refresh` button cancels all local modifications

Actions:

- modify a prompt or a DTMF destination
- click `Refresh`

Expected result:

- data come back to their initial state
- modification indicators disappear
- errors disappear
- no selection is active

### 5.20 Application to EZVMS

**Goal** - Check if the application asks for confirmation and blocks errors

Valid case:

- make a valid modification
- click `Apply to EZVMS`

Expected result:

```txt
Apply changes to EZVMS?
```

- confirm

Expected result:

```txt
Modifications have been sent!
```

Warning case:

- make a modification that raises a warning
- click `Apply to EZVMS`

Expected result:

```txt
Validation has found warnings that may block the application. Apply changes to EZVMS?
```

- confirm

Expected result:

```txt
Modifications have been sent!
```

Error case:

- create an error
- click `Apply to EZVMS`

Expected result:

```txt
Cannot apply: blocking validation errors exist.
```

### 5.21 Parameter Modification Tracking

**Goal** - Check if altering a simple setting or node prompt tags the affected block with a modified visual state and buffers changes locally.

Actions:

- Load a valid Call Flow (e.g., Company ID `10072`).
- Select a node from the Sidebar or Graph Canvas.
- Change the `Timeout` or `Retries` parameter to a valid alternative value.

Expected Result:

- The updated value is rendered in the Detail Panel.
- The altered node instantly shifts to a modified state, applying a dashed border style to both its Graph Node box and its corresponding Sidebar component.
- The global data structure preserves the update in memory

### 5.22 Local Client-Side Draft Persistence

**Goal** - Check if unsaved call flow mutations automatically mirror to browser storage and survive accidental page refreshes.

Actions:

- Select an active node and adjust its properties or DTMF routing tables.
- Open the browser's developer tools (F12) -> Application/Storage Tab -> Local Storage.
- Locate the entry matching key pattern `diamy.callFlow.<companyId>` (e.g., `diamy.callFlow.10072`).
- Refresh the web page completely (F5 or Ctrl+F5) and re-enter the exact same Company ID on the Selection Screen.

Expected Result:

- Upon modification, `localStorage` must instantly contain a serialized JSON payload carrying the mutated `callFlow` tree alongside an array representing `modifiedItems`.
- Following page reloading and re-selection of the company, the application bypasses remote server queries and restores state instantly from local disk memory.
- Dashed modification borders remain present on all altered nodes, demonstrating proper state recovery.

### 5.23 Cache Refresh

**Goal** - Check if choosing to manually synchronize remote data drops current local storage structures and resets client tracking back to ground truth.

Actions:

- Introduce several changes to a Call Flow configuration to establish an active local draft.
- Verify that `diamy.callFlow.<companyId>` populates `localStorage`.
- Click the `Refresh` action link located inside the application header layout, then validate the confirmation warning box dialog prompt.

Expected Result:

- Accepting the modal warning trigger forces a localized storage wipe operation, completely deleting the `diamy.callFlow.<companyId>` target string configuration key from the browser database.
- The application executes an HTTP GET transaction to the base API endpoint routing path (`/api/call-flows/:companyId/`).
- The `modifiedItems` selection registry drops all active tokens, removing dashed borders across UI components.

### 5.24 Cache Clearance Post Apply Transaction

**Goal** - Check if local memory records and serialized web databases clear cleanly once mutations successfully commit to the core engine platform.

Actions:

- Stage valid workflow modifications on an active flow configuration graph schema to construct a local modified cache draft.
- Review `localStorage` to confirm that the company draft block key is present.
- Click the `Apply to EZVMS` operational link, confirm the action inside the alert verification overlay, and wait for confirmation.

Expected Result:

- Upon validation acceptance, the engine initiates data submission protocols.
- Client logic triggers an explicit wipe statement against local records.
- The tracking engine unregisters dirty nodes from the runtime index.
- Visually, all dashed element rendering artifacts normalize into solid borders, indicating a state of synchronization.

------
