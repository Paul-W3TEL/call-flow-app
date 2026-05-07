# UI Specs

- **Document title** > UI Specs
- **Version** > 1.1
- **Status** > Internal draft
- **Author** > Paul Koster
- **Date** > April 30th 2026
- **Confidentiality** > Internal document – W3TEL / TEQTEL

------

## Version history

| Version | Date            | Author      | Changelog           |
| ------- | --------------- | ----------- | ------------------- |
| 1.0     | April 30th 2026 | Paul Koster | Initial version     |
| 1.1     | April 30th 2026 | Paul Koster | Correcting mistakes |

------

## Table of contents

[toc]

------

## 1. Context


This document defines UI specifications for the EZVMS Call Flow editor.
It aims to replace the current EZVMS "Menu Designer" interface with a more modern, readable and coherent interface.
This new interface will be used to

- Display a Call Flow as a graph
- Quickly understand menus and actions
- Edit only certain parameters
- Prepare a future integration in the Diamy extranet

## 2. UI principles

### 2.1 Clarity

The user must immediatly understand:

- The entry point of a Call Flow
- Available menus
- Configured DTMF inputs
- Call destinations
- Errors or incomplete parameters

### 2.2 Sobriety

The interface must remain technical, neutral and professional.
Visual effects should stay limited to useful elements:

- Selection
- Hovering
- Error
- Validation
- Modified state

### 2.3 Diamy coherence

Every component must respect the Diamy chart

- police font: `Space Grotesk`, `Inter`, `IBM Plex Mono`
- Main color : Diamy Teal `#3FA99C`
- Responsive grid
- Component in the Diamy UI Kit

### 2.4 Controlled edition

Not every EZVMS parameters can be exposed.
The interface should clearly distinguish:

- Editable fields
- Read-only fields
- Masked fields
- Admin-only fields

-----

## 3. Overall screen structure

The main screen is made of four panels

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

### 4.1 Display

The header presents:

- The name of the application
- The selected company
- The selected Call Flow
- The save state
- The main actions

### 4.2 Main actions

| Action           | Description                              |
| ---------------- | ---------------------------------------- |
| `Refresh`        | Refreshes data from EZVMS                |
| `Save draft`     | Saves the modifications to a local state |
| `Validate`       | Checks the Call Flow coherence           |
| `Export JSON`    | Exports the internal model               |
| `Apply to EZVMS` | Sends modifications to EZVMS             |

`Apply to EZVMS` must be protected by a confirmation

-----

## 5. Sidebar

### 5.1 Generalities

The sidebar allows navigation between elements of the Call Flow
It contains:

- The menu list
- Entry points
- Audio prompts
- Detected errors
- A search field

### 5.2 Menu display

Each menu must display:

- Its Id
- Its label
- Its type
- Its status

### 5.3 Visual states

| State       | Display                           |
| ----------- | --------------------------------- |
| `selected`  | accentuated border or background  |
| `modified`  | discreet visual indicator         |
| `error`     | red icon                          |
| `read-only` | reduced opacity                   |
| `masked`    | no display                        |

-----

## 6. Graph Canva

### 6.1 Generalities

The Graph Canvas is the main visualisation zone
If displays the Call Flow in a graph state with: 

- nodes
- entry points
- targets
- connections
- DTMF transitions

### 6.2 Display types

| Type            | Object        | Description                           | Display color       |
| --------------- | ------------- | ------------------------------------- | ------------------- |
| Entry point     | `entry_point` | Start of the graph                    | #4CAF50           |
| Menu            | `node`        | Vocal EZVMS menu                      | #3FA99C           |
| Transfer        | `node`        | Redirection to a target               | #2F8F83           |
| Playback        | `node`        | Plays a message                       | #25786E           |
| Extension       | `target`      | Opens contact with an internal number | #7D5BA6           |
| External number | `target`      | Opens contact with an external number | #6A4C93           |
| Voicemail       | `target`      | Record a voicemail                    | #593C82           |
| Hangup          | `target`      | Call end                              | #482F6F           |
| Error           | other         | Error handling                        | #D64545           |
| Unknown         | other         | If an object is not recognised        | #6F7577           |

### 6.3 Content of a menu node

A menu node must display:

- The name of the menu
- The id of the menu
- The main prompt
- The max number of DTMF digit
- The number of retries
- Possible actions

Example

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

### 7.1 Menu sections

The detail panel displays the parameters of the selected node.
It is organised in sections

```text
General
Prompt
DTMF Actions
Fallback Actions
Advanced
Validation
```

### 7.2 General

| Field         | Editable   | Description          |
| ------------- | ---------- | -------------------- |
| `Company ID`  | No         | EZVMS company ID     |
| `Menu ID`     | No         | Menu ID              |
| `Menu Type`   | Yes, admin | Entry point type     |
| `Description` | Yes        | Readable description |
| `Max DTMF`    | Yes        | Max digits           |
| `Retry count` | Yes        | Number of retries    |

### 7.3 Prompts

| Field                          | Editable | Description                       |
| ------------------------------ | -------- | --------------------------------- |
| `Main Prompt`                  | Yes      | Prompt when entering the menu     |
| `Retry Prompt`                 | Yes      | Prompt when trying again          |
| `Invalid Prompt`               | Yes      | Prompt if invalid DTMF            |
| `Ext. Not Found Prompt`        | Yes      | Prompt if unknown extension       |
| `Transfer Prompt`              | Yes      | Prompt before transfer            |
| `Default Leave Message Prompt` | Yes      | Prompt before recording a message |
| `Ext. No VMS Prompt`           | Yes      | Prompt if unavailable messaging   |

Prompts must be selected from a controlled list.
No free file name must be entered without validation.

### 7.4 DTMF actions

Every DTMF action must be presented in a table.
Example:

| Input | Action                  | Value    | Editability |
| ----- | ----------------------- | -------- | ----------- |
| 1     | 'Transfer to Extension' | 1001     | Yes         |
| 2     | 'Jump to Menu'          | menu_2   | Yes         |
| 9     | 'Transfer to Operator'  | operator | Yes         |
| #     | 'Repeat Prompt'         | -        | Yes         |

### 7.5 Fallback actions

| Field                   | Description                       |
| ----------------------- | --------------------------------- |
| `Retry Fail Action`     | Action after maximal retry number |
| `Default Action`        | Action if no DTMF is entered      |
| `Ext. Busy Menu`        | Menu if extension is busy         |
| `Ext. No Answer Menu`   | Menu if no reply                  |
| `Ext. Unavailable Menu` | Menu if unavailable extension     |
| `Operator Busy Menu`    | Menu si unavailable operator      |

-----

## 8. Forms

### 8.1 Overall rules

Forms must:

- Display fields by logical groups
- Mark mandatory fields
- Display errors close to the field
- Prevent saving if there are invalid data

### 8.2 Read-only fields

Read-only fields use a specific style

```css
background: var(--neutral-100);
border: 1px dashed var(--neutral-300);
font-family: "IBM Plex Mono", monospace;
```

### 8.3 Editable fields

Editable fields use the standard Diamy components

- `DiInput`
- `DiSelect`
- `DiCheckbox`
- `DiTable`
- `DiButton`

-----

## 9. Validation

The interface must detect incoherences before saving

### 9.1 Blocking errors

| Code                  | Description                            |
| --------------------- | -------------------------------------- |
| `MissingMainPrompt`   | Menu without main prompt               |
| `InvalidTarget`       | Action to an invalid menu or extension |
| `DuplicateEntryPoint` | Multiple menu for the same entry       |
| `InvalidDTMF`         | Invalid DTMF input                     |
| `EmptyAction`         | DTMF action with no output             |

### 9.2 Warnings

| Code                   | Description                            |
| ---------------------- | -------------------------------------- |
| `UnreachableMenu`      | Unaccessible menu from the entry point |
| `NoDefaultAction`      | Undefined fallback                     |
| `HighRetryCount`       | Abnormally high Retry Count            |
| `UnknownPrompt`        | Prompt not found in the list           |
| `HiddenEZVMSParameter` | EZVMS parameter not exposed in the UI  |

### 9.3 Error display

Errors must be visible:

- In the detail pannel
- In the sider
- On the targeted node
- In the validation bar

-----

## 10. Editing states

| State         | Description                   |
| ------------- | ----------------------------- |
| `Clean`       | Data synchronised with EZVMS  |
| `Dirty`       | Local modifications not saved |
| `Draft saved` | Saved local draft             |
| `Valid`       | Valid Call Flow               |
| `Invalid`     | Blocking errors               |
| `Sync error`  | SOAP call error               |
| `Applied`     | Modifications sent to EZVMS   |

-----

## 11. User action

### 11.1 Select a node

When the user clicks on a node:

- The node becomes selected
- The detail pannel displays its properties
- In and Out connections are highlighted

### 11.2 Edit a DTMF action

The user can:

- Add an input
- Edit the action
- Edit the destination
- Delete the action

Constraints:

- An input cannot be duplicated in the same menu
- All destinations must exist
- Any deletion must require a confirmation

### 11.3 Edit a prompt

The user can select an existing prompt
The system must display:

- Its name file
- Its type
- Its availability
- Optionnaly, its error status

-----

## 12. Modals

### 12.1 Confirmation d'application EZVMS

Before saving changes to EZVMS, display a modal.
Content:

```text
Apply changes to EZVMS?

This action will update the remote EZVMS configuration.
Please verify the Call Flow before continuing.
```

Actions :

- `Cancel`
- `Apply changes`

### 12.2 Deleting an action

Before deleting a DTMF action:

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

### 13.1 Desktop

Full display :

- sidebar
- graph canvas
- detail panel
 
### 13.2 Tablet

The sidebar can fold away
The detail panel can display in drawer

-----

## 14. Accessibility

The interface must include:

- A WCAG AA contrast
- A keyboard navigation
- Visible focus
- Explicit labels
- Textual error messages
- No information transmitted only by their color

Eache node of the graph must have an accessible textual equivalent

-----

## 15. Expected components

| Component     | Usage                          |
| ------------- | ------------------------------ |
| `DiButton`    | Main action                    |
| `DiInput`     | Champs Text field              |
| `DiSelect`    | Selecting action, menu, prompt |
| `DiCheckbox`  | Boolean options                |
| `DiTable`     | DTMF actions list              |
| `DiModal`     | Confirmations                  |
| `DiTooltip`   | Contextual help                |
| `DiToast`     | Temporary feedback             |
| `DiBadge`     | Status                         |
| `DiGraphNode` | Call Flow node                 |
| `DiGraphEdge` | Connection between nodes       |

-----

## 16. UI tokens

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

## 17. Outside the UI perimeter

The following elements are not included in this first version:

- Complete edition of all EZVMS parameters
- Advanced audio prompt management
- Audio editor
- Real time monitoring
- Full user permissions management
- Automatic publication with no validation
- Complete recreation of the EZVMS administration

-----

## 18. Acceptation criterias

The UI specification is considered valid if:

- The main screen is clearly defined
- UI Zones are identified
- Diamy components are used
- Editable and Read-only parameters are distinguishable
- Main errors are prevented
- The graph allows a coherent understanding of the Call Flow
- Edition remains limited and controlled
- The interface respects the Diamy chart

-----

## 19. Developpement notes

No frontend developpement can start without the validation of this document
Recommended steps are:

- Validate this UI specification
- Create wireframes
- Define JSON models used in the interface
- Create isolated UI components
- Integrate graph visualisation
- Add controlled edition
- Connect the internal API
- Add validation and save

-----
