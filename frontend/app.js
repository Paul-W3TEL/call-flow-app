/*
    This interface does not yet communicate with the backend API
    We instead have declared a local call flow, that could be the result of an API call
    The next step will be to fetch API data, and turn them into this table to display
*/

const callFlow = {
  "company": {
    "company_id": "acme-fr-001",
    "name": "Acme Services France"
  },
  "entry_point": {
    "pilot_number": "+33186260000",
    "start_node_id": "main_menu"
  },
  "nodes": [
    {
      "id": "main_menu",
      "type": "menu",
      "label": "Main welcome menu",
      "prompt": "welcome.wav",
      "dtmf": {
        "1": "sales_menu",
        "2": "support_menu",
        "3": "billing_transfer",
        "4": "info_playback",
        "9": "operator_transfer"
      },
      "settings": {
        "timeout": 8,
        "retries": 2
      }
    },
    {
      "id": "sales_menu",
      "type": "menu",
      "label": "Sales department menu",
      "prompt": "sales_menu.wav",
      "dtmf": {
        "1": "new_sales_transfer",
        "2": "renewals_transfer",
        "3": "partner_transfer",
        "0": "main_menu"
      },
      "settings": {
        "timeout": 7,
        "retries": 2
      }
    },
    {
      "id": "support_menu",
      "type": "menu",
      "label": "Customer support menu",
      "prompt": "support_menu.wav",
      "dtmf": {
        "1": "outage_notice",
        "2": "technical_support_transfer",
        "3": "order_status_transfer",
        "0": "main_menu"
      },
      "settings": {
        "timeout": 7,
        "retries": 2
      }
    },
    {
      "id": "outage_notice",
      "type": "playback",
      "label": "Service outage advisory",
      "prompt": "outage_notice.wav",
      "dtmf": {
        "1": "priority_support_transfer",
        "2": "outage_voicemail",
        "0": "support_menu"
      },
      "settings": {
        "timeout": 6,
        "retries": 1
      }
    },
    {
      "id": "info_playback",
      "type": "playback",
      "label": "Opening hours and address",
      "prompt": "info.wav",
      "dtmf": {
        "0": "main_menu",
        "1": "operator_transfer"
      },
      "settings": {
        "timeout": 10,
        "retries": 1
      }
    },
    {
      "id": "billing_transfer",
      "type": "transfer",
      "label": "Transfer to billing",
      "prompt": "billing.wav",
      "dtmf": {},
      "settings": {
        "timeout": 5,
        "retries": 1
      }
    },
    {
      "id": "new_sales_transfer",
      "type": "transfer",
      "label": "Transfer to new sales",
      "prompt": "new_sales.wav",
      "dtmf": {},
      "settings": {
        "timeout": 5,
        "retries": 1
      }
    },
    {
      "id": "renewals_transfer",
      "type": "transfer",
      "label": "Transfer to renewals",
      "prompt": "renewals.wav",
      "dtmf": {},
      "settings": {
        "timeout": 5,
        "retries": 1
      }
    },
    {
      "id": "partner_transfer",
      "type": "transfer",
      "label": "Transfer to partnerships",
      "prompt": "partner.wav",
      "dtmf": {},
      "settings": {
        "timeout": 5,
        "retries": 1
      }
    },
    {
      "id": "technical_support_transfer",
      "type": "transfer",
      "label": "Transfer to technical support",
      "prompt": "tech_support.wav",
      "dtmf": {},
      "settings": {
        "timeout": 5,
        "retries": 1
      }
    },
    {
      "id": "priority_support_transfer",
      "type": "transfer",
      "label": "Transfer to priority outage support",
      "prompt": "priority_support.wav",
      "dtmf": {},
      "settings": {
        "timeout": 5,
        "retries": 1
      }
    },
    {
      "id": "order_status_transfer",
      "type": "transfer",
      "label": "Transfer to order status team",
      "prompt": "order_status.wav",
      "dtmf": {},
      "settings": {
        "timeout": 5,
        "retries": 1
      }
    },
    {
      "id": "operator_transfer",
      "type": "transfer",
      "label": "Transfer to reception",
      "prompt": "operator.wav",
      "dtmf": {},
      "settings": {
        "timeout": 5,
        "retries": 1
      }
    }
  ],
  "targets": [
    {
      "id": "billing_transfer",
      "type": "extension",
      "label": "Billing Queue",
      "number": "2300"
    },
    {
      "id": "new_sales_transfer",
      "type": "extension",
      "label": "New Sales Queue",
      "number": "2100"
    },
    {
      "id": "renewals_transfer",
      "type": "extension",
      "label": "Renewals Queue",
      "number": "2110"
    },
    {
      "id": "partner_transfer",
      "type": "extension",
      "label": "Partnerships Queue",
      "number": "2120"
    },
    {
      "id": "technical_support_transfer",
      "type": "extension",
      "label": "Technical Support Queue",
      "number": "2200"
    },
    {
      "id": "priority_support_transfer",
      "type": "extension",
      "label": "Priority Outage Queue",
      "number": "2299"
    },
    {
      "id": "order_status_transfer",
      "type": "extension",
      "label": "Order Status Queue",
      "number": "2210"
    },
    {
      "id": "operator_transfer",
      "type": "extension",
      "label": "Reception",
      "number": "2000"
    },
    {
      "id": "outage_voicemail",
      "type": "voicemail",
      "label": "Outage Voicemail Box",
      "number": "vm-2299"
    }
  ],
  "validation": {
    "status": "valid",
    "errors": [],
    "warnings": []
  }
}

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

  const allIds = new Set([
    "entry_point",
    ...nodes.map((node) => node.id),
    ...targets.map((target) => target.id)
  ]);

  const links = [];

  if (allIds.has(callFlow.entry_point.start_node_id)) {
    links.push({
      from: "entry_point",
      to: callFlow.entry_point.start_node_id,
      label: "start"
    });
  }

  nodes.forEach((node) => {
    Object.entries(node.dtmf || {}).forEach(([key, destinationId]) => {
      if (!allIds.has(destinationId)) return;

      links.push({
        from: node.id,
        to: destinationId,
        label: `DTMF ${key}`
      });
    });
  });

  const positions = computeGraphLayout(nodes, targets, links);

  const maxX = Math.max(...Object.values(positions).map((p) => p.x));
  const maxY = Math.max(...Object.values(positions).map((p) => p.y));

  canvas.style.height = `${maxY + 220}px`;
  canvas.style.minWidth = `${maxX + 320}px`;

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
        210,
        110,
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

function computeGraphLayout(nodes, targets, links) {
  const g = new dagre.graphlib.Graph();

  g.setGraph({
    rankdir: "LR",
    nodesep: 90,
    ranksep: 170,
    marginx: 40,
    marginy: 40
  });

  g.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 210;
  const nodeHeight = 110;

  g.setNode("entry_point", {
    width: nodeWidth,
    height: nodeHeight
  });

  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight
    });
  });

  targets.forEach((target) => {
    g.setNode(target.id, {
      width: nodeWidth,
      height: nodeHeight
    });
  });

  links.forEach((link) => {
    g.setEdge(link.from, link.to);
  });

  dagre.layout(g);

  const positions = {};

  g.nodes().forEach((id) => {
    const layoutNode = g.node(id);

    positions[id] = {
      x: layoutNode.x - nodeWidth / 2,
      y: layoutNode.y - nodeHeight / 2
    };
  });

  return positions;
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
    <svg
      class="graph-link-layer"
      style="
        width: ${Math.max(startX, endX) + 400}px;
        height: ${Math.max(startY, endY) + 400}px;
      "
    >
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
