# Testing protocols

- **Document title** > Testing protocols
- **Version** > 1.1
- **Status** > Internal draft
- **Author** > Paul Koster
- **Date** > May 11th 2026
- **Confidentiality** > Internal document – W3TEL / TEQTEL

------

## Version history

| Version | Date          | Author      | Description           |
| ------- | ------------- | ----------- | --------------------- |
| 1.0     | May 11th 2026 | Paul Koster | Initial version       |
| 1.1     | May 11th 2026 | Paul Koster | API Testing protocols |

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

-----
