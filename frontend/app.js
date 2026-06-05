
const API_BASE_URL = "http://172.16.100.251:3000";
const DEFAULT_COMPANY_ID = "1001";
const DEFAULT_PILOT_NUMBER = "0123456789";

let modifiedItems = new Set();
let callFlow = null;
let originalCallFlow = null;
let graphZoom = 1;

let validationState = {
  status: "valid",
  errors: [],
  warnings: [],
};

let availableFlows = [];
let currentView = "selection";

let selectedType = null;
let selectedId = null;

let hoveredType = null;
let hoveredId = null;

// ─── panel collapse state ─────────────────────────────────────────────────────
// Keyed by panel title string. Persists in localStorage across selections,
// call flow changes, and page refreshes. Cleared by refreshData().
const PANELS_STORAGE_KEY = "diamy.collapsedPanels";

let collapsedPanels = {};

function loadCollapsedPanels() {
  try {
    const raw = localStorage.getItem(PANELS_STORAGE_KEY);
    collapsedPanels = raw ? JSON.parse(raw) : {};
  } catch {
    collapsedPanels = {};
  }
}

function saveCollapsedPanels() {
  localStorage.setItem(PANELS_STORAGE_KEY, JSON.stringify(collapsedPanels));
}

function clearCollapsedPanels() {
  collapsedPanels = {};
  localStorage.removeItem(PANELS_STORAGE_KEY);
}

function togglePanel(name) {
  collapsedPanels[name] = !collapsedPanels[name];
  saveCollapsedPanels();
  renderDetails();
}

// Wrap a detail-section with a collapsible header.
// name   – stable key used for storage (usually the panel title text)
// title  – display text shown in the header
// body   – inner HTML shown when expanded
function detailSection(name, title, body) {
  const collapsed = !!collapsedPanels[name];
  const icon = collapsed ? "+" : "−";
  return `
    <div class="detail-section${collapsed ? " detail-section-collapsed" : ""}">
      <div class="detail-section-header">
        <div class="panel-title">${title}</div>
        <button class="panel-collapse-btn" onclick="togglePanel('${name.replace(/'/g, "\\'")}')" title="${collapsed ? "Expand" : "Collapse"}">${icon}</button>
      </div>
      ${collapsed ? "" : `<div class="detail-section-body">${body}</div>`}
    </div>
  `;
}

loadCollapsedPanels();

window.selectItem = selectItem;
window.setHover = setHover;
window.clearHover = clearHover;

window.validationState = validationState;
window.modifiedItems = modifiedItems;
window.selectedType = selectedType;
window.selectedId = selectedId;
window.hoveredType = hoveredType;
window.hoveredId = hoveredId;

function render() {
  if (currentView === "selection") {
    renderSelectionPage();
    return;
  }

  if (!document.getElementById("graphCanvas")) {
    renderEditorShell();
  }

  if (!callFlow) return;

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

  if (!entryPointItem) return;

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
  if (!window.renderReactFlowGraph) {
    console.error("ReactFlow renderer is not loaded.");
    return;
  }

  window.renderReactFlowGraph(callFlow);
}

function renderDetails() {
  const detail = document.getElementById("detailContent");

  if (!selectedType || !selectedId) {
    detail.innerHTML = `
    <div class="detail-section">
      <div class="detail-section-header">
        <div class="panel-title">Waiting for selection</div>
      </div>
      <div class="detail-section-body">
        <div class="helper">
          Select the entry point, a node, or a target to inspect its parameters.
        </div>
      </div>
    </div>
  `;
    return;
  }

  if (selectedType === "entry") {
    detail.innerHTML =
      detailSection("Entry Point", "Entry Point", `
        ${row("Company ID", callFlow.company.company_id)}
        ${row("Company", callFlow.company.name)}
        ${row("Pilot Number", callFlow.entry_point.pilot_number)}
        ${row("Start Node", callFlow.entry_point.start_node_id)}
      `) +
      detailSection("Rules", "Rules", `
        ${row("Multiplicity", "Single entry point")}
        ${row("Editable", "No")}
      `) +
      detailSection("Validation", "Validation", (() => {
        const errors = validationState.errors.filter(e => e.owner === "entry:entry_point");
        const warnings = validationState.warnings.filter(w => w.owner === "entry:entry_point");
        if (errors.length === 0 && warnings.length === 0) return `<div class="helper">No validation issue.</div>`;
        return errors.map(e => `<div class="validation-error">${e.code}: ${e.message}</div>`).join("") +
               warnings.map(w => `<div class="validation-warning">${w.code}: ${w.message}</div>`).join("");
      })());
    return;
  }

  if (selectedType === "target") {
    const target = callFlow.targets.find(item => item.id === selectedId);
    const errors = validationState.errors.filter(e => e.owner === targetKey(target.id));
    const warnings = validationState.warnings.filter(w => w.owner === targetKey(target.id));

    detail.innerHTML =
      detailSection("Target", "Target", `
        ${row("Target ID", target.id)}
        ${row("Type", target.type)}
        ${row("Label", target.label)}
        ${row("Number", target.number)}
      `) +
      detailSection("Validation", "Validation", (() => {
        if (errors.length === 0 && warnings.length === 0) return `<div class="helper">No validation issue.</div>`;
        return errors.map(e => `<div class="validation-error">${e.code}: ${e.message}</div>`).join("") +
               warnings.map(w => `<div class="validation-warning">${w.code}: ${w.message}</div>`).join("");
      })());
    return;
  }

  if (selectedType === "node") {
    const node = callFlow.nodes.find(item => item.id === selectedId);
    const mappingKeys = [
      { key: "0", label: "Key 0" }, { key: "1", label: "Key 1" },
      { key: "2", label: "Key 2" }, { key: "3", label: "Key 3" },
      { key: "4", label: "Key 4" }, { key: "5", label: "Key 5" },
      { key: "6", label: "Key 6" }, { key: "7", label: "Key 7" },
      { key: "8", label: "Key 8" }, { key: "9", label: "Key 9" },
      { key: "*", label: "Key *" }, { key: "#", label: "Key #" },
      { key: "default", label: "Default route" }
    ];

    const nodeErrors = validationState.errors.filter(e => e.owner === nodeKey(node.id));
    const nodeWarnings = validationState.warnings.filter(w => w.owner === nodeKey(node.id));

    detail.innerHTML =
      detailSection("General", "General", `
        ${row("Node ID", node.id)}
        ${row("Type", node.type)}
        ${row("Label", node.label)}
      `) +
      detailSection("Editable Fields", "Editable Fields", `
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
      `) +
      detailSection("DTMF & Fallback Actions", "DTMF & Fallback Actions", `
        ${mappingKeys.map(item => {
          const value = node.dtmf?.[item.key] ?? "";
          return `
            <div class="edit-field">
              <label>${item.label}</label>
              <select class="di-input" onchange="updateDtmf('${node.id}', '${item.key}', this.value)">
                ${destinationOptions(value)}
              </select>
            </div>
          `;
        }).join("")}
      `) +
      detailSection("Validation", "Validation", (() => {
        if (nodeErrors.length === 0 && nodeWarnings.length === 0) return `<div class="helper">No validation issue.</div>`;
        return nodeErrors.map(e => `<div class="validation-error">${e.code}: ${e.message}</div>`).join("") +
               nodeWarnings.map(w => `<div class="validation-warning">${w.code}: ${w.message}</div>`).join("");
      })());
    return;
  }
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

  window.selectedType = selectedType;
  window.selectedId = selectedId;

  renderSidebar();
  renderGraph();
  renderDetails();
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

  modifiedItems.add(nodeKey(nodeId));
  window.modifiedItems = modifiedItems;
  saveCallFlowLocally();
  validateCallFlow();

  renderSidebar();
  renderGraph();
  renderStatusBar();
}

function updateDtmf(nodeId, key, value) {
  const node = callFlow.nodes.find((item) => item.id === nodeId);
  if (!node) return;
  if (!node.dtmf) node.dtmf = {};

  if (!value) {
    delete node.dtmf[key];
    if (node.ezvms) {
      if (key === "default") node.ezvms["default_action_value"] = null;
      else if (key === "*") node.ezvms["key_star_action_value"] = null;
      else if (key === "#") node.ezvms["key_hashtag_action_value"] = null;
      else node.ezvms[`key${key}_value`] = null;
    }
  } else {
    node.dtmf[key] = value;
    if (node.ezvms) {
      if (key === "default") node.ezvms["default_action_value"] = value;
      else if (key === "*") node.ezvms["key_star_action_value"] = value;
      else if (key === "#") node.ezvms["key_hashtag_action_value"] = value;
      else node.ezvms[`key${key}_value`] = value;
    }
  }
  modifiedItems.add(nodeKey(nodeId));
  window.modifiedItems = modifiedItems;
  saveCallFlowLocally();
  validateCallFlow();

  renderSidebar();
  renderGraph();
  renderStatusBar();
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

    renderSidebar();
    renderGraph();
    renderStatusBar();
    alert("Invalid prompt file. Allowed formats: MP3, MP4, WAV.");
    return;
  }

  node.prompt = file.name;

  modifiedItems.add(nodeKey(nodeId));
  window.modifiedItems = modifiedItems;
  saveCallFlowLocally();
  validateCallFlow();

  renderSidebar();
  renderGraph();
  renderStatusBar();
}

async function refreshData() {
  if (!callFlow?.company?.company_id) return;

  const confirmed = confirm(
    "Refresh from EZVMS? Local unsaved changes for this call flow will be replaced."
  );

  if (!confirmed) return;

  const companyId = callFlow.company.company_id;

  clearCallFlowLocally(companyId);
  modifiedItems.clear();
  clearCollapsedPanels();
  await loadCallFlow(companyId, { refresh: true });
}

function runManualValidation() {
  const result = validateCallFlow();
  renderSidebar();
  renderGraph();
  renderStatusBar();

  if (result.status === "valid") {
    alert("Validation passed.");
  } else if (result.status === "warning") {
    alert("Validation passed, but warnings have been found. Check highlighted blocks.");
  } else {
    alert("Validation failed. Check highlighted blocks.");
  }
}

async function applyToEzvms() {
  const result = validateCallFlow();

  if (result.status === "invalid") {
    alert("Cannot apply: blocking validation errors remain.");
    return;
  }

  const confirmed = (result.status === "warning") ? confirm("Validation has found warnings that may block the application. Apply changes to EZVMS?")
                                                  : confirm("Apply changes to EZVMS?");
  if (!confirmed) return;

  const modifiedNodes = callFlow.nodes
    .filter((node) => modifiedItems.has(nodeKey(node.id)))
    .map((node) => ({
      ...node,
      ezvms: {
        ...node.ezvms,
        menu_id: node.id,
        menu_desc: node.label,
        main_prompt: node.prompt,
        retry_cnt: node.settings?.retries,
        noans_timeout: node.settings?.timeout,
        ...Object.fromEntries(
          Array.from({ length: 10 }, (_, index) => {
            const key = String(index);
            return [`key${key}_value`, node.dtmf?.[key] || null];
          })
        ),
        "key_star_value": node.dtmf?.["*"] || null,
        "key_hashtag_value": node.dtmf?.["#"] || null,
        "default_action_value": node.dtmf?.["default"] || null
      }
    }));

  if (modifiedNodes.length === 0) {
    alert("No modifications to apply.");
    return;
  }

  try {
    const requestPayload = {
      company: callFlow.company,
      entry_point: callFlow.entry_point,
      nodes: modifiedNodes
    };

    const response = await fetch(
      `${API_BASE_URL}/api/call-flows/${encodeURIComponent(
        callFlow.company.company_id
      )}/apply`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
      }
    );

    const rawResponse = await response.text();
    let result;

    try {
      result = JSON.parse(rawResponse);
    } catch {
      throw new Error(
        `Backend did not return JSON. HTTP ${response.status}. Response starts with: ${rawResponse.slice(
          0,
          200
        )}`
      );
    }

    if (!response.ok || result.success === false) {
      throw new Error(result.message || "Apply failed");
    }

    modifiedItems.clear();
    window.modifiedItems = modifiedItems;
    clearCallFlowLocally(callFlow.company.company_id);
    originalCallFlow = structuredClone(callFlow);

    validateCallFlow();
    renderSidebar();
    renderGraph();
    renderStatusBar();

    alert("Modifications have been sent!");
  } catch (error) {
    alert(`Apply failed: ${error.message}`);
  }
}

function linkKey(type, id) {
  return `${type}:${id}`;
}

function setLinkedHover(type, id, enabled) {
  if (enabled) {
    window.hoveredType = type;
    window.hoveredId = id;
  } else {
    window.hoveredType = null;
    window.hoveredId = null;
  }

  const key = linkKey(type, id);
  document.querySelectorAll(`[data-link-key="${key}"]`).forEach((el) => {
    el.classList.toggle("hover-linked", enabled);
  });
}

function clearSelection() {
  selectedType = null;
  selectedId = null;
  window.selectedType = null;
  window.selectedId = null;
  renderSidebar();
  renderGraph();
  renderDetails();
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
  const key = type === "entry" ? entryKey() : `${type}:${id}`;
  return modifiedItems.has(key);
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

  const reachableIds = new Set();

  reachableIds.add(callFlow.entry_point.start_node_id);

  callFlow.nodes.forEach((node) => {
    Object.values(node.dtmf || {}).forEach((destination) => {
      reachableIds.add(destination);
    });
  });

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
      if (key === "default") {
        return; 
      }
      if (!/^[0-9#*]$/.test(key)) {
        errors.push({
          code: "InvalidDTMF",
          owner,
          message: `Invalid DTMF key: ${key}`,
        });
      }

      if (destination === node.id) {
          warnings.push({
            code: "SelfReferencingDTMF",
            owner,
            message: `DTMF key ${key} links back to its origin node: ${node.id}.`,
          });
        }
    });
  });

  callFlow.nodes.forEach((node) => {
    if (
      node.id !== callFlow.entry_point.start_node_id &&
      !reachableIds.has(node.id)
    ) {
      warnings.push({
        code: "UnreachableNode",
        owner: nodeKey(node.id),
        message: `Node ${node.id} is unreachable.`,
      });
    }
  });

  callFlow.targets.forEach((target) => {
    if (!reachableIds.has(target.id)) {
      warnings.push({
        code: "UnreachableTarget",
        owner: targetKey(target.id),
        message: `Target ${target.id} is unreachable.`,
      });
    }
  });

  validationState = {
    status:
      errors.length > 0 ? "invalid" : warnings.length > 0 ? "warning" : "valid",
    errors,
    warnings,
  };

  window.validationState = validationState;

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

async function loadCallFlow(companyId, options = {}) {
  currentView = "editor";
  render();

  const graphCanvas = document.getElementById("graphCanvas");
  const shouldRefresh = options.refresh === true;

  if (!shouldRefresh) {
    const local = loadCallFlowLocally(companyId);

    if (local && !options.refresh) {
      callFlow = local.callFlow;
      modifiedItems = local.modifiedItems;
      window.modifiedItems = modifiedItems;

      originalCallFlow = structuredClone(callFlow);

      selectedType = null;
      selectedId = null;
      window.selectedType = null;
      window.selectedId = null;

      validateCallFlow();
      render();
      return;
    }
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/call-flows/${encodeURIComponent(companyId)}/`
    );

    if (!response.ok) {
      throw new Error(`API returned HTTP ${response.status}`);
    }

    callFlow = await response.json();
    originalCallFlow = structuredClone(callFlow);
    modifiedItems = new Set();
    window.modifiedItems = modifiedItems;

    saveCallFlowLocally();

    selectedType = null;
    selectedId = null;
    window.selectedType = null;
    window.selectedId = null;

    validateCallFlow();
    render();
    }
    catch (error) {
      if (graphCanvas) {
        graphCanvas.innerHTML = `
          <div class="detail-section">
            <div class="panel-title">API loading error</div>
            <div class="validation-error">${error.message}</div>
          </div>
        `;
    }
  }
}

function renderSelectionPage() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="selection-page">
      <div class="selection-card">
        <div class="brand large">Di<span>amy</span></div>

        <div class="panel-title">Open a Call Flow</div>

        <div class="helper">
          Enter a company ID to retrieve its call flow from EZVMS.
        </div>

        <div class="selector-row">
          <input
            id="companyIdInput"
            class="di-input mono"
            type="text"
            placeholder="Company ID"
            value="10072"
            onkeydown="handleCompanyInputKeydown(event)"
          />

          <button class="di-btn di-btn-primary" onclick="loadCompanyFromInput()">
            Load
          </button>
        </div>

        <div id="selectionError" class="validation-error"></div>
      </div>
    </div>
  `;
}

function loadCompanyFromInput() {
  const input = document.getElementById("companyIdInput");
  const error = document.getElementById("selectionError");

  const companyId = input.value.trim();

  error.textContent = "";

  if (!companyId) {
    error.textContent = "Please enter a company ID.";
    return;
  }

  loadCallFlow(companyId);
}

function handleCompanyInputKeydown(event) {
  if (event.key === "Enter") {
    loadCompanyFromInput();
  }
}

function renderEditorShell() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="app-shell">
      <header class="app-header">
        <div>
          <div class="brand">Di<span>amy</span></div>
          <div class="subtitle">Call Flow Editor</div>
        </div>

        <div class="header-context">
          <span class="chip chip-info">Mock API</span>
          <span id="companyName">Example Company</span>
          <span class="mono" id="pilotNumber">0123456789</span>
        </div>

        <div class="header-actions">
          <button class="di-btn di-btn-light" onclick="clearSelection()">Unselect</button>
          <button class="di-btn di-btn-light" onclick="goBackToSelection()">Back</button>
          <button class="di-btn di-btn-secondary" onclick="refreshData()">Refresh</button>
          <button class="di-btn di-btn-secondary" onclick="runManualValidation()">Validate</button>
          <button class="di-btn di-btn-primary" onclick="applyToEzvms()">Apply to EZVMS</button>
        </div>
      </header>

      <main class="layout">
        <aside class="sidebar">
          <div class="sidebar-header">
            <div class="panel-title">Call Flow</div>
          </div>

          <div class="section-label">Entry point</div>
          <div id="entryPointItem"></div>

          <div class="section-label">Nodes</div>
          <div id="nodeList"></div>

          <div class="section-label">Targets</div>
          <div id="targetList"></div>
        </aside>

        <section class="canvas-panel">
          <div class="panel-toolbar">
            <div>
              <div class="panel-title">Graph Canvas</div>
              <div class="helper">Visual mock of the internal Call Flow model</div>
            </div>
          </div>

          <div class="graph-canvas" id="graphCanvas"></div>
        </section>

        <aside class="detail-panel">
          <div class="panel-title">Detail Panel</div>
          <div id="detailContent" class="detail-content"></div>
        </aside>
      </main>

      <footer class="status-bar">
        <span id="statusChip" class="chip chip-ok">Clean</span>
        <span id="validationStatusText">No blocking validation error detected</span>
      </footer>
    </div>
  `;
}

function goBackToSelection() {
  currentView = "selection";
  callFlow = null;
  selectedType = null;
  selectedId = null;
  window.selectedType = null;
  window.selectedId = null;
  
  render();
}

function getCallFlowStorageKey(companyId) {
  return `diamy.callFlow.${companyId}`;
}

function saveCallFlowLocally() {
  if (!callFlow?.company?.company_id) return;

  localStorage.setItem(
    getCallFlowStorageKey(callFlow.company.company_id),
    JSON.stringify({
      callFlow,
      modifiedItems: [...modifiedItems]
    })
  );
}

function loadCallFlowLocally(companyId) {
  const raw = localStorage.getItem(getCallFlowStorageKey(companyId));
  if (!raw) return null;

  try {
    const stored = JSON.parse(raw);

    return {
      callFlow: stored.callFlow || stored,
      modifiedItems: new Set(stored.modifiedItems || [])
    };
  } catch {
    clearCallFlowLocally(companyId);
    return null;
  }
}

function clearCallFlowLocally(companyId) {
  localStorage.removeItem(getCallFlowStorageKey(companyId));
}

function itemKey(type, id) {
  return type === "entry" ? entryKey() : `${type}:${id}`;
}

function firstValidationMessage(type, id) {
  const key = itemKey(type, id);

  const error = validationState.errors.find((item) => item.owner === key);
  if (error) return `${error.code}: ${error.message}`;

  const warning = validationState.warnings.find((item) => item.owner === key);
  if (warning) return `${warning.code}: ${warning.message}`;

  return "";
}

function validationTitle(type, id) {
  const message = firstValidationMessage(type, id);
  return message ? `title="${message.replaceAll('"', "&quot;")}"` : "";
}

function destinationOptions(selectedValue) {
  const normalizedValue = selectedValue ?? "";

  const destinations = [
    ...callFlow.nodes.map((node) => ({
      value: node.id,
      label: `${node.id} · ${node.label}`
    })),
    ...callFlow.targets.map((target) => ({
      value: target.id,
      label: `${target.id} · ${target.label}`
    }))
  ];

  return `
    <option value="" ${normalizedValue === "" ? "selected" : ""}>
      -
    </option>

    ${destinations
      .map(
        (destination) => `
          <option
            value="${destination.value}"
            ${String(destination.value) === String(normalizedValue) ? "selected" : ""}
          >
            ${destination.label}
          </option>
        `
      )
      .join("")}
  `;
}

function setHover(type, id) {
  hoveredType = type;
  hoveredId = id;

  window.hoveredType = hoveredType;
  window.hoveredId = hoveredId;

  const key = linkKey(type, id);
  document.querySelectorAll(`[data-link-key="${key}"]`).forEach((el) => {
    el.classList.add("hover-linked");
  });
}

function clearHover() {
  const key = hoveredType && hoveredId ? linkKey(hoveredType, hoveredId) : null;

  hoveredType = null;
  hoveredId = null;

  window.hoveredType = null;
  window.hoveredId = null;

  if (key) {
    document.querySelectorAll(`[data-link-key="${key}"]`).forEach((el) => {
      el.classList.remove("hover-linked");
    });
  }
}

window.setHover = setHover;
window.clearHover = clearHover;
window.selectItem = selectItem;
window.saveCallFlowLocally = saveCallFlowLocally;
window.togglePanel = togglePanel;

render();
