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

let selectedType = "entry";
let selectedId = "entry_point";

let hoveredType = null;
let hoveredId = null;

function render() {
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
        <div class="panel-title">Prompt</div>
        ${row("Main Prompt", node.prompt)}
      </div>
            
      <div class="detail-section">
        <div class="panel-title">DTMF Actions</div>
        ${Object.entries(node.dtmf)
          .map(([key, value]) => row(key, value))
          .join("")}
      </div>
            
      <div class="detail-section">
        <div class="panel-title">Settings</div>
        ${row("Timeout", node.settings.timeout)}
        ${row("Retries", node.settings.retries)}
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

  return classes.join(" ");
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

render();
