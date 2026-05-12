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
        1: "target_sales",
        2: "target_support",
        9: "target_operator",
      },
      settings: {
        timeout: 5,
        retries: 3,
      },
    },
  ],
  targets: [
    {
      id: "target_sales",
      type: "extension",
      label: "Sales",
      number: "1001",
    },
    {
      id: "target_support",
      type: "extension",
      label: "Support",
      number: "1002",
    },
    {
      id: "target_operator",
      type: "extension",
      label: "Operator",
      number: "1000",
    },
  ],
};

const originalCallFlow = structuredClone(callFlow);

let validationState = {
  status: "valid",
  errors: [],
  warnings: [],
};

let selectedType = "entry";
let selectedId = "entry_point";

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

  const menu = callFlow.nodes[0];
  const targets = callFlow.targets;

  canvas.innerHTML = `
    <div
      class="graph-node entry ${itemClasses("entry", "entry_point")}"
      data-link-key="${linkKey("entry", "entry_point")}"
      style="left: 40px; top: 250px;"
      onclick="selectItem('entry', 'entry_point')"
      onmouseenter="setLinkedHover('entry', 'entry_point', true)"
      onmouseleave="setLinkedHover('entry', 'entry_point', false)"
    >
      <div class="graph-title">Entry Point</div>
      <div class="graph-id">${callFlow.entry_point.pilot_number}</div>
      <div class="helper">Start node: ${callFlow.entry_point.start_node_id}</div>
    </div>

    <div class="graph-line" style="left: 250px; top: 310px; width: 150px;"></div>

    <div
      class="graph-node ${itemClasses("node", menu.id)}"
      data-link-key="${linkKey("node", menu.id)}"
      style="left: 400px; top: 220px;"
      onclick="selectItem('node', '${menu.id}')"
      onmouseenter="setLinkedHover('node', '${menu.id}', true)"
      onmouseleave="setLinkedHover('node', '${menu.id}', false)"
    >
      <div class="graph-title">${menu.label}</div>
      <div class="graph-id">${menu.id}</div>
      <div class="helper">Prompt: ${menu.prompt}</div>
      <div class="helper">Retries: ${menu.settings.retries}</div>
    </div>

    ${targets
      .map((target, index) => {
        const y = 90 + index * 170;
        const key =
          Object.keys(menu.dtmf).find((k) => menu.dtmf[k] === target.id) || "?";

        return `
          <div class="graph-line" style="left: 610px; top: ${290}px; width: 150px; transform: rotate(${index === 0 ? -38 : index === 1 ? 0 : 38}deg);"></div>
          <div class="graph-dtmf" style="left: 690px; top: ${y + 70}px;">DTMF ${key}</div>

          <div
            class="graph-node target ${itemClasses("target", target.id)}"
            data-link-key="${linkKey("target", target.id)}"
            style="left: 780px; top: ${y}px;"
            onclick="selectItem('target', '${target.id}')"
            onmouseenter="setLinkedHover('target', '${target.id}', true)"
            onmouseleave="setLinkedHover('target', '${target.id}', false)"
          >
            <div class="graph-title">${target.label}</div>
            <div class="graph-id">${target.id}</div>
            <div class="helper">${target.type}</div>
            <div class="helper mono">${target.number}</div>
          </div>
        `;
      })
      .join("")}
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
    ${
      validationState.errors
        .filter((error) => error.owner === nodeKey(node.id))
        .map(
          (error) =>
            `<div class="validation-error">${error.code}: ${error.message}</div>`,
        )
        .join("") || `<div class="helper">No blocking error.</div>`
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

function refreshData() {
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

  const confirmed = confirm("Apply changes to EZVMS?");

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

    if (node.settings.retries > 5) {
      warnings.push({
        code: "HighRetryCount",
        owner,
        message: "Retry count is unusually high.",
      });
    }
  });

  validationState = {
    status:
      errors.length > 0 ? "invalid" : warnings.length > 0 ? "warning" : "valid",
    errors,
    warnings,
  };

  return validationState;
}

render();
