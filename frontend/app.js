
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

function render() {
  if (currentView === "selection") {
    renderSelectionPage();
    return;
  }

  renderEditorShell();

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

  canvas.style.height = `${(maxY + 220) * graphZoom}px`;
  canvas.style.minWidth = `${(maxX + 320) * graphZoom}px`;

  canvas.innerHTML = `
    <div
      class="graph-zoom-layer"
      style="
        transform: scale(${graphZoom});
        transform-origin: top left;
        width: ${maxX + 320}px;
        height: ${maxY + 220}px;
      "
    >
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
      ${validationTitle("entry", "entry_point")}
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
        ${validationTitle("node", node.id)}
        data-link-key="${linkKey("node", node.id)}"
        style="left: ${positions[node.id].x}px; top: ${positions[node.id].y}px;"
        onclick="selectItem('node', '${node.id}')"
        onmouseenter="setLinkedHover('node', '${node.id}', true)"
        onmouseleave="setLinkedHover('node', '${node.id}', false)"
      >
        <div class="graph-title">${node.label}</div>
        <div class="graph-id">${node.id}</div>
        <div class="helper">${node.type}</div>
        <div class="helper">Prompt: ${node.prompt || "None"}</div>
      </div>
    `).join("")}

    ${targets.map((target) => `
      <div
        class="graph-node ${graphTypeClass("target", target.type)} ${itemClasses("target", target.id)}"
        ${validationTitle("target", target.id)}
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
  </div>
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

        <div class="detail-section">
          <div class="panel-title">Validation</div>

          ${validationState.errors
            .filter((error) => error.owner === "entry:entry_point")
            .map(
              (error) => `
                <div class="validation-error">
                  ${error.code}: ${error.message}
                </div>
              `
            )
            .join("")}

          ${validationState.warnings
            .filter((warning) => warning.owner === "entry:entry_point")
            .map(
              (warning) => `
                <div class="validation-warning">
                  ${warning.code}: ${warning.message}
                </div>
              `
            )
            .join("")}

          ${
            validationState.errors.filter(
              (error) => error.owner === "entry:entry_point"
            ).length === 0 &&
            validationState.warnings.filter(
              (warning) => warning.owner === "entry:entry_point"
            ).length === 0
              ? `
                <div class="helper">
                  No validation issue.
                </div>
              `
              : ""
          }
        </div>
    `;

    return;
  }

  if (selectedType === "target") {
    const target = callFlow.targets.find(
      (item) => item.id === selectedId
    );

    detail.innerHTML = `
      <div class="detail-section">
        <div class="panel-title">Target</div>

        ${row("Target ID", target.id)}
        ${row("Type", target.type)}
        ${row("Label", target.label)}
        ${row("Number", target.number)}
      </div>

      <div class="detail-section">
        <div class="panel-title">Validation</div>

        ${validationState.errors
          .filter((error) => error.owner === targetKey(target.id))
          .map(
            (error) => `
              <div class="validation-error">
                ${error.code}: ${error.message}
              </div>
            `
          )
          .join("")}

        ${validationState.warnings
          .filter((warning) => warning.owner === targetKey(target.id))
          .map(
            (warning) => `
              <div class="validation-warning">
                ${warning.code}: ${warning.message}
              </div>
            `
          )
          .join("")}

        ${
          validationState.errors.filter(
            (error) => error.owner === targetKey(target.id)
          ).length === 0 &&
          validationState.warnings.filter(
            (warning) => warning.owner === targetKey(target.id)
          ).length === 0
            ? `
              <div class="helper">
                No validation issue.
              </div>
            `
            : ""
        }
      </div>
    `;

    return;
  }

  if (selectedType === "node") {
    const node = callFlow.nodes.find((item) => item.id === selectedId);

    const mappingKeys = [
      { key: "0", label: "Key 0" }, { key: "1", label: "Key 1" },
      { key: "2", label: "Key 2" }, { key: "3", label: "Key 3" },
      { key: "4", label: "Key 4" }, { key: "5", label: "Key 5" },
      { key: "6", label: "Key 6" }, { key: "7", label: "Key 7" },
      { key: "8", label: "Key 8" }, { key: "9", label: "Key 9" },
      { key: "*", label: "Key *" }, { key: "#", label: "Key #" },
      { key: "default", label: "Default route" }
    ];


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
      <div class="panel-title">DTMF & Fallback Actions</div>
      ${mappingKeys.map((item) => {
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

  modifiedItems.add(nodeKey(nodeId));
  saveCallFlowLocally();
  validateCallFlow();
  render();
}

function updateDtmf(nodeId, key, value) {
  const node = callFlow.nodes.find((item) => item.id === nodeId);
  if (!node) return;

  if (!node.dtmf) {
    node.dtmf = {};
  }

  if (!value) {
    delete node.dtmf[key];

    if (node.ezvms) {
      node.ezvms[`key${key}_value`] = null;
    }
  } else {
    node.dtmf[key] = value;

    if (node.ezvms) {
      node.ezvms[`key${key}_value`] = value;
    }
  }

  modifiedItems.add(nodeKey(nodeId));
  saveCallFlowLocally();
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

  modifiedItems.add(nodeKey(nodeId));
  saveCallFlowLocally();
  validateCallFlow();
  render();
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
  await loadCallFlow(companyId, { refresh: true });
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

    if (!response.ok || result.success === false) {
      throw new Error(result.message || "Apply failed");
    }

    modifiedItems.clear();
    clearCallFlowLocally(callFlow.company.company_id);
    originalCallFlow = structuredClone(callFlow);

    validateCallFlow();
    render();

    alert("Modifications have been sent!");
  } catch (error) {
    alert(`Apply failed: ${error.message}`);
  }
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

async function loadCallFlow(companyId, options = {}) {
  currentView = "editor";
  render();

  const shouldRefresh = options.refresh === true;

  if (!shouldRefresh) {
    const local = loadCallFlowLocally(companyId);

    if (local && !options.refresh) {
      callFlow = local.callFlow;
      modifiedItems = local.modifiedItems;

      originalCallFlow = structuredClone(callFlow);

      selectedType = null;
      selectedId = null;

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

    saveCallFlowLocally();

    selectedType = null;
    selectedId = null;

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

            <div class="zoom-controls">
              <button class="di-btn di-btn-light" onclick="zoomGraphIn()">+</button>
              <button class="di-btn di-btn-light" onclick="resetGraphZoom()">Reset</button>
              <button class="di-btn di-btn-light" onclick="zoomGraphOut()">-</button>
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

function setGraphZoom(nextZoom) {
  graphZoom = Math.min(1.6, Math.max(0.5, nextZoom));
  renderGraph();
}

function zoomGraphIn() {
  setGraphZoom(graphZoom + 0.1);
}

function zoomGraphOut() {
  setGraphZoom(graphZoom - 0.1);
}

function resetGraphZoom() {
  setGraphZoom(1);
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

render();
