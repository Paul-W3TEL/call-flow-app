/*
    This interface does not yet communicate with the backend API
    We instead have declared a local call flow, that could be the result of an API call
    The next step will be to fetch API data, and turn them into this table to display
*/

const callFlow = {
  company: {
    company_id: "1001",
    name: "Example Company",
  },
  entry_point: {
    pilot_number: "0123456789",
    start_node_id: "menu_1",
  },
  nodes: [
    {
      id: "menu_1",
      type: "menu",
      label: "Main Menu",
      prompt: "welcome.wav",
      dtmf: {
        1: "menu_2",
        2: "playback_1",
        3: "transfer_1",
        9: "hangup"
      },
      settings: {
        timeout: 5,
        retries: 3,
      },
    },
    {
      id: "playback_1",
      type: "playback",
      label: "External transfer",
      prompt: "external.wav",
      dtmf: {
        1: "external_1",
        9: "menu_1"
      },
      settings: {
        timeout: 5,
        retries: 3,
      },
    },
    {
      id: "transfer_1",
      type: "transfer",
      label: "Transfer to voicemail",
      prompt: "voicemail.wav",
      dtmf: {
        1: "voicemail_1",
        9: "menu_1",
      },
      settings: {
        timeout: 5,
        retries: 3,
      },
    },
    {
      id: "menu_2",
      type: "menu",
      label: "Choose your correspondant",
      prompt: "choice.wav",
      dtmf: {
        1: "hr",
        2: "comptability",
        3: "production",
        9: "menu_1"
      },
      settings: {
        timeout: 5,
        retries: 3,
      },
    },
  ],
  targets: [
    {
      id: "hr",
      type: "extension",
      label: "Human Ressources",
      number: "1000",
    },
    {
      id: "comptability",
      type: "extension",
      label: "Comptability",
      number: "1001",
    },
    {
      id: "production",
      type: "extension",
      label: "Production",
      number: "1002",
    },
    {
      id: "voicemail_1",
      type: "voicemail",
      label: "Voicemail",
      number: "1003",
    },
    {
      id: "external_1",
      type: "external_number",
      label: "External partner",
      number: "1004",
    },
    {
      id: "hangup",
      type: "hangup",
      label: "End of call",
      number: "1005",
    },
  ],
};

const originalCallFlow = structuredClone(callFlow);

let validationState = {
  status: "valid",
  errors: [],
  warnings: [],
};

let selectedType = null;
let selectedId = null;

let hoveredType = null;
let hoveredId = null;

function render() {
  validateCallFlow();
  document.getElementById("companyName").textContent = callFlow.company.name;
  document.getElementById("pilotNumber").textContent =
    callFlow.entry_point.pilot_number;

  renderSidebar();
  renderGraph();
  renderDetails();
  renderStatusBar();
}

function renderSidebar() {
  const entryPointItem = document.getElementById("entryPointItem");
  const nodeList = document.getElementById("nodeList");
  const targetList = document.getElementById("targetList");

  entryPointItem.innerHTML = `
  <div
    class="list-item ${itemClasses("entry", "entry_point")}"
    data-link-key="${linkKey("entry", "entry_point")}"
    onclick="selectItem('entry', 'entry_point')"
    onmouseenter="setLinkedHover('entry', 'entry_point', true)"
    onmouseleave="setLinkedHover('entry', 'entry_point', false)"
  >
    <div class="list-title">Entry Point</div>
    <div class="list-meta">${callFlow.entry_point.pilot_number}</div>
  </div>
`;

  nodeList.innerHTML = callFlow.nodes
    .map(
      (node) => `
  <div
    class="list-item ${itemClasses("node", node.id)}"
    data-link-key="${linkKey("node", node.id)}"
    onclick="selectItem('node', '${node.id}')"
    onmouseenter="setLinkedHover('node', '${node.id}', true)"
    onmouseleave="setLinkedHover('node', '${node.id}', false)"
  >
    <div class="list-title">${node.label}</div>
    <div class="list-meta">${node.id} · ${node.type}</div>
  </div>
`,
    )
    .join("");

  targetList.innerHTML = callFlow.targets
    .map(
      (target) => `
  <div
    class="list-item ${itemClasses("target", target.id)}"
    data-link-key="${linkKey("target", target.id)}"
    onclick="selectItem('target', '${target.id}')"
    onmouseenter="setLinkedHover('target', '${target.id}', true)"
    onmouseleave="setLinkedHover('target', '${target.id}', false)"
  >
    <div class="list-title">${target.label}</div>
    <div class="list-meta">${target.id} · ${target.type}</div>
  </div>
`,
    )
    .join("");
}

function renderGraph() {
  const canvas = document.getElementById("graphCanvas");

  const nodes = callFlow.nodes;
  const targets = callFlow.targets;

  const nodeWidth = 210;
  const nodeHeight = 110;
  const columnGap = 300;
  const rowGap = 150;

  const entryX = 40;
  const nodeX = entryX + columnGap;
  const targetX = nodeX + columnGap * 2;

  const maxRows = Math.max(nodes.length, targets.length, 1);
  const canvasHeight = Math.max(700, maxRows * rowGap + 160);
  const canvasWidth = Math.max(1100, targetX + nodeWidth + 120);

  canvas.style.height = `${canvasHeight}px`;
  canvas.style.minWidth = `${canvasWidth}px`;

  const positions = {};

  positions.entry_point = {
    x: entryX,
    y: canvasHeight / 2 - nodeHeight / 2
  };

  nodes.forEach((node, index) => {
    positions[node.id] = {
      x: nodeX,
      y: 80 + index * rowGap
    };
  });

  targets.forEach((target, index) => {
    positions[target.id] = {
      x: targetX,
      y: 80 + index * rowGap
    };
  });

  const allObjects = {
    entry_point: callFlow.entry_point,
    ...Object.fromEntries(nodes.map((node) => [node.id, node])),
    ...Object.fromEntries(targets.map((target) => [target.id, target]))
  };

  const links = [];

  links.push({
    from: "entry_point",
    to: callFlow.entry_point.start_node_id,
    label: "start"
  });

  nodes.forEach((node) => {
    Object.entries(node.dtmf || {}).forEach(([key, destinationId]) => {
      if (!allObjects[destinationId]) return;

      links.push({
        from: node.id,
        to: destinationId,
        label: `DTMF ${key}`
      });
    });
  });

  canvas.innerHTML = `
    ${links.map((link, index) => {
      const from = positions[link.from];
      const to = positions[link.to];

      if (!from || !to) return "";

      return drawSmartLink(
        from.x,
        from.y,
        to.x,
        to.y,
        nodeWidth,
        nodeHeight,
        link.label,
        index
      );
    }).join("")}

    <div
      class="graph-node ${graphTypeClass("entry", "entry_point")} ${itemClasses("entry", "entry_point")}"
      data-link-key="${linkKey("entry", "entry_point")}"
      style="left: ${positions.entry_point.x}px; top: ${positions.entry_point.y}px;"
      onclick="selectItem('entry', 'entry_point')"
      onmouseenter="setLinkedHover('entry', 'entry_point', true)"
      onmouseleave="setLinkedHover('entry', 'entry_point', false)"
    >
      <div class="graph-title">Entry Point</div>
      <div class="graph-id">${callFlow.entry_point.pilot_number}</div>
      <div class="helper">Start node: ${callFlow.entry_point.start_node_id}</div>
    </div>

    ${nodes.map((node) => `
      <div
        class="graph-node ${graphTypeClass("node", node.type)} ${itemClasses("node", node.id)}"
        data-link-key="${linkKey("node", node.id)}"
        style="left: ${positions[node.id].x}px; top: ${positions[node.id].y}px;"
        onclick="selectItem('node', '${node.id}')"
        onmouseenter="setLinkedHover('node', '${node.id}', true)"
        onmouseleave="setLinkedHover('node', '${node.id}', false)"
      >
        <div class="graph-title">${node.label}</div>
        <div class="graph-id">${node.id}</div>
        <div class="helper">Prompt: ${node.prompt || "None"}</div>
        <div class="helper">Retries: ${node.settings?.retries ?? "-"}</div>
      </div>
    `).join("")}

    ${targets.map((target) => `
      <div
        class="graph-node ${graphTypeClass("target", target.type)} ${itemClasses("target", target.id)}"
        data-link-key="${linkKey("target", target.id)}"
        style="left: ${positions[target.id].x}px; top: ${positions[target.id].y}px;"
        onclick="selectItem('target', '${target.id}')"
        onmouseenter="setLinkedHover('target', '${target.id}', true)"
        onmouseleave="setLinkedHover('target', '${target.id}', false)"
      >
        <div class="graph-title">${target.label}</div>
        <div class="graph-id">${target.id}</div>
        <div class="helper">${target.type}</div>
        <div class="helper mono">${target.number}</div>
      </div>
    `).join("")}
  `;
}

function renderDetails() {
  const detail = document.getElementById("detailContent");

  if (!selectedType || !selectedId) {
    detail.innerHTML = `
    <div class="detail-section">
      <div class="panel-title">Waiting for selection</div>
      <div class="helper">
        Select the entry point, a node, or a target to inspect its parameters.
      </div>
    </div>
  `;

    return;
  }

  if (selectedType === "entry") {
    detail.innerHTML = `
        <div class="detail-section">
        <div class="panel-title">Entry Point</div>
        ${row("Company ID", callFlow.company.company_id)}
        ${row("Company", callFlow.company.name)}
        ${row("Pilot Number", callFlow.entry_point.pilot_number)}
        ${row("Start Node", callFlow.entry_point.start_node_id)}
        </div>
            
        <div class="detail-section">
        <div class="panel-title">Rules</div>
        ${row("Multiplicity", "Single entry point")}
        ${row("Editable", "No")}
        </div>
    `;
    return;
  }

  if (selectedType === "node") {
    const node = callFlow.nodes.find((item) => item.id === selectedId);

    detail.innerHTML = `
  <div class="detail-section">
    <div class="panel-title">General</div>
    ${row("Node ID", node.id)}
    ${row("Type", node.type)}
    ${row("Label", node.label)}
  </div>

  <div class="detail-section">
    <div class="panel-title">Editable Fields</div>

    <div class="edit-field">
      <label>Main Prompt</label>
      <input
        class="di-input"
        type="file"
        accept=".mp3,.mp4,.wav,audio/mpeg,audio/wav,video/mp4"
        onchange="updatePromptFile('${node.id}', this.files[0])"
        />

        <div class="helper">
        Current prompt: <span class="mono">${node.prompt || "No file selected"}</span>
        </div>
    </div>

    <div class="edit-field">
      <label>Timeout</label>
      <input
        class="di-input"
        type="number"
        value="${node.settings.timeout}"
        onchange="updateNodeField('${node.id}', 'timeout', this.value)"
      />
    </div>

    <div class="edit-field">
      <label>Retries</label>
      <input
        class="di-input"
        type="number"
        value="${node.settings.retries}"
        onchange="updateNodeField('${node.id}', 'retries', this.value)"
      />
    </div>
  </div>

  <div class="detail-section">
    <div class="panel-title">DTMF Actions</div>

    ${Object.entries(node.dtmf)
      .map(
        ([key, value]) => `
      <div class="edit-field">
        <label>Key ${key}</label>
        <input
          class="di-input"
          value="${value}"
          onchange="updateDtmf('${node.id}', '${key}', this.value)"
        />
      </div>
    `,
      )
      .join("")}
  </div>

  <div class="detail-section">
    <div class="panel-title">Validation</div>

    ${validationState.errors
      .filter((error) => error.owner === nodeKey(node.id))
      .map((error) => `<div class="validation-error">${error.code}: ${error.message}</div>`)
      .join("")}

    ${validationState.warnings
      .filter((warning) => warning.owner === nodeKey(node.id))
      .map((warning) => `<div class="validation-warning">${warning.code}: ${warning.message}</div>`)
      .join("")}

    ${
      validationState.errors.filter((error) => error.owner === nodeKey(node.id)).length === 0 &&
      validationState.warnings.filter((warning) => warning.owner === nodeKey(node.id)).length === 0
        ? `<div class="helper">No validation issue.</div>`
        : ""
    }
  </div>
`;

    return;
  }

  const target = callFlow.targets.find((item) => item.id === selectedId);

  detail.innerHTML = `
    <div class="detail-section">
      <div class="panel-title">Target</div>
      ${row("Target ID", target.id)}
      ${row("Type", target.type)}
      ${row("Label", target.label)}
      ${row("Number", target.number)}
    </div>
  `;
}

function row(label, value) {
  return `
    <div class="detail-row">
      <div class="detail-label">${label}</div>
      <div class="detail-value">${value}</div>
    </div>
  `;
}

function selectItem(type, id) {
  selectedType = type;
  selectedId = id;
  render();
}

function itemClasses(type, id) {
  const classes = [];

  if (selectedType === type && selectedId === id) {
    classes.push("active");
  }

  if (isModified(type, id)) {
    classes.push("modified");
  }

  if (hasError(type, id)) {
    classes.push("has-error");
  } else if (hasWarning(type, id)) {
    classes.push("has-warning");
  }

  return classes.join(" ");
}

function updateNodeField(nodeId, field, value) {
  const node = callFlow.nodes.find((item) => item.id === nodeId);

  if (!node) return;

  if (field === "prompt") {
    node.prompt = value;
  }

  if (field === "timeout") {
    node.settings.timeout = Number(value);
  }

  if (field === "retries") {
    node.settings.retries = Number(value);
  }

  validateCallFlow();
  render();
}

function updateDtmf(nodeId, key, value) {
  const node = callFlow.nodes.find((item) => item.id === nodeId);

  if (!node) return;

  node.dtmf[key] = value;

  validateCallFlow();
  render();
}

function updatePromptFile(nodeId, file) {
  const node = callFlow.nodes.find((item) => item.id === nodeId);
  if (!node || !file) return;

  const allowedExtensions = [".mp3", ".mp4", ".wav"];
  const fileName = file.name.toLowerCase();

  const isAllowed = allowedExtensions.some((extension) =>
    fileName.endsWith(extension),
  );

  if (!isAllowed) {
    validationState.errors.push({
      code: "InvalidPromptFile",
      owner: nodeKey(nodeId),
      message: "Invalid prompt file. Allowed formats: MP3, MP4, WAV.",
    });

    render();
    alert("Invalid prompt file. Allowed formats: MP3, MP4, WAV.");
    return;
  }

  node.prompt = file.name;
  validateCallFlow();
  render();
}

function refreshData() {
  const confirmed = confirm("Refresh data? Local modifications will be lost.");

  if (!confirmed) return;

  Object.assign(callFlow, structuredClone(originalCallFlow));

  validationState = {
    status: "valid",
    errors: [],
    warnings: [],
  };

  selectedType = null;
  selectedId = null;

  render();
  alert("Local mock data refreshed.");
}

function runManualValidation() {
  const result = validateCallFlow();
  render();

  if (result.status === "valid") {
    alert("Validation passed.");
  } else if (result.status === "warning") {
    alert("Validation passed, but warnings have been found. Check highlighted blocks.");
  } else {
    alert("Validation failed. Check highlighted blocks.");
  }
}

function applyToEzvms() {
  const result = validateCallFlow();
  render();

  if (result.status === "invalid") {
    alert("Cannot apply: blocking validation errors exist.");
    return;
  }

  const confirmed = (result.status === "warning") ? confirm("Validation has found warnings that may block the application. Apply changes to EZVMS?")
                                                  : confirm("Apply changes to EZVMS?");

  if (!confirmed) return;

  alert("Modifications have been sent!");
}

function linkKey(type, id) {
  return `${type}:${id}`;
}

function setLinkedHover(type, id, enabled) {
  const key = linkKey(type, id);
  const elements = document.querySelectorAll(`[data-link-key="${key}"]`);

  elements.forEach((element) => {
    element.classList.toggle("hover-linked", enabled);
  });
}

function clearSelection() {
  selectedType = null;
  selectedId = null;
  render();
}

function nodeKey(id) {
  return `node:${id}`;
}

function targetKey(id) {
  return `target:${id}`;
}

function entryKey() {
  return "entry:entry_point";
}

function isModified(type, id) {
  if (type !== "node") return false;

  const current = callFlow.nodes.find((node) => node.id === id);
  const original = originalCallFlow.nodes.find((node) => node.id === id);

  return JSON.stringify(current) !== JSON.stringify(original);
}

function hasError(type, id) {
  const key = type === "entry" ? entryKey() : `${type}:${id}`;
  return validationState.errors.some((error) => error.owner === key);
}

function hasWarning(type, id) {
  const key = type === "entry" ? entryKey() : `${type}:${id}`;

  return validationState.warnings.some((warning) => warning.owner === key);
}

function validateCallFlow() {
  const errors = [];
  const warnings = [];

  const nodeIds = callFlow.nodes.map((node) => node.id);
  const targetIds = callFlow.targets.map((target) => target.id);
  const validDestinations = [...nodeIds, ...targetIds];

  if (!nodeIds.includes(callFlow.entry_point.start_node_id)) {
    errors.push({
      code: "InvalidStartNode",
      owner: entryKey(),
      message: "Start node does not exist.",
    });
  }

  callFlow.nodes.forEach((node) => {
    const owner = nodeKey(node.id);

  const destinationToKeys = {};

  Object.entries(node.dtmf).forEach(([key, destination]) => {
    if (!destinationToKeys[destination]) {
      destinationToKeys[destination] = [];
    }

    destinationToKeys[destination].push(key);
  });

  Object.entries(destinationToKeys).forEach(([destination, keys]) => {
    if (keys.length > 1) {
      warnings.push({
        code: "DuplicateDTMFDestination",
        owner,
        message: `DTMF keys ${keys.join(", ")} point to the same destination: ${destination}.`
      });
    }
  });

    const timeout = Number(node.settings.timeout);
    const retries = Number(node.settings.retries);

    if (Number.isNaN(timeout)) {
      errors.push({
        code: "InvalidTimeout",
        owner,
        message: "Timeout must be a number.",
      });
    } else if (timeout < 0) {
      errors.push({
        code: "InvalidTimeout",
        owner,
        message: "Timeout cannot be negative.",
      });
    } else if (timeout === 0) {
      warnings.push({
        code: "ZeroTimeout",
        owner,
        message: "Timeout is set to 0 seconds.",
      });
    }

    if (Number.isNaN(retries)) {
      errors.push({
        code: "InvalidRetries",
        owner,
        message: "Retries must be a number.",
      });
    } else if (retries < 0) {
      errors.push({
        code: "InvalidRetries",
        owner,
        message: "Retries cannot be negative.",
      });
    } else if (retries === 0) {
      warnings.push({
        code: "ZeroRetries",
        owner,
        message: "Retries are disabled.",
      });
    } else if (retries > 5) {
      warnings.push({
        code: "HighRetryCount",
        owner,
        message: "Retry count is unusually high.",
      });
    }

    if (node.type === "menu" && (!node.prompt || node.prompt.trim() === "")) {
      errors.push({
        code: "MissingMainPrompt",
        owner,
        message: "Menu must have a main prompt.",
      });
    }

    if (node.type === "menu" && Object.keys(node.dtmf).length === 0) {
      errors.push({
        code: "EmptyAction",
        owner,
        message: "Menu must have at least one DTMF action.",
      });
    }

    Object.entries(node.dtmf).forEach(([key, destination]) => {
      if (!/^[0-9#*]$/.test(key)) {
        errors.push({
          code: "InvalidDTMF",
          owner,
          message: `Invalid DTMF key: ${key}`,
        });
      }

      if (!validDestinations.includes(destination)) {
        errors.push({
          code: "InvalidTarget",
          owner,
          message: `Invalid destination: ${destination}`,
        });
      }
    });
  });

  validationState = {
    status:
      errors.length > 0 ? "invalid" : warnings.length > 0 ? "warning" : "valid",
    errors,
    warnings,
  };

  return validationState;
}

function renderStatusBar() {
  const text = document.getElementById("validationStatusText");
  const chip = document.getElementById("statusChip");

  if (!text) return;

  if (validationState.status === "invalid") {
    text.textContent = `${validationState.errors.length} blocking error(s) detected`;
    chip.textContent = "Error";

    if (chip.classList.contains("chip-ok")) {
      chip.classList.remove("chip-ok");
    }
    if (chip.classList.contains("chip-info")) {
      chip.classList.remove("chip-info");
    }

    chip.classList.add("chip-warn");

    return;
  }

  if (validationState.status === "warning") {
    text.textContent = `${validationState.warnings.length} warning(s) detected`;
    chip.textContent = "Warning";

    if (chip.classList.contains("chip-ok")) {
      chip.classList.remove("chip-ok");
    }
    if (chip.classList.contains("chip-warn")) {
      chip.classList.remove("chip-warn");
    }

    chip.classList.add("chip-info");
    return;
  }

  text.textContent = "No blocking validation error detected";
  chip.textContent = "Clean";

  if (chip.classList.contains("chip-info")) {
    chip.classList.remove("chip-info");
  }
  if (chip.classList.contains("chip-warn")) {
    chip.classList.remove("chip-warn");
  }

  chip.classList.add("chip-ok");
}

function drawSmartLink(fromX, fromY, toX, toY, width, height, label, index) {
  const startX = fromX + width;
  const startY = fromY + height / 2;

  const endX = toX;
  const endY = toY + height / 2;

  const midX = startX + (endX - startX) / 2;
  const offset = (index % 4) * 10;

  const path = `
    M ${startX} ${startY}
    C ${midX + offset} ${startY},
      ${midX + offset} ${endY},
      ${endX} ${endY}
  `;

  const labelX = midX + offset - 24;
  const labelY = startY + (endY - startY) / 2 - 12;

  return `
    <svg class="graph-link-layer">
      <path
        d="${path}"
        class="graph-link-path"
      />
    </svg>

    <div
      class="graph-dtmf"
      style="left: ${labelX}px; top: ${labelY}px;"
    >
      ${label}
    </div>
  `;
}

function graphTypeClass(itemType, objectType) {
  if (itemType === "entry") return "type-entry";

  if (itemType === "node") {
    if (objectType === "menu") return "type-menu";
    if (objectType === "transfer") return "type-transfer";
    if (objectType === "playback") return "type-playback";
  }

  if (itemType === "target") {
    if (objectType === "extension") return "type-extension";
    if (objectType === "external_number") return "type-external";
    if (objectType === "voicemail") return "type-voicemail";
    if (objectType === "hangup") return "type-hangup";
  }

  return "type-unknown";
}

render();
