import React from "react";
import { createRoot } from "react-dom/client";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

let savedViewport = null;

function getNodeKind(item) {
  if (item.kind) return item.kind;
  if (item.type) return item.type;
  return "unknown";
}

function getValidationLevel(type, id) {
  if (!window.validationState) return "";

  const owner =
    type === "entry"
      ? "entry:entry_point"
      : `${type}:${id}`;

  if (window.validationState.errors?.some((item) => item.owner === owner)) {
    return "error";
  }

  if (window.validationState.warnings?.some((item) => item.owner === owner)) {
    return "warning";
  }

  return "";
}

function isModified(type, id) {
  const owner =
    type === "entry"
      ? "entry:entry_point"
      : `${type}:${id}`;

  return window.modifiedItems?.has?.(owner);
}

function FlowNode({ data }) {
  return (
    <div className={[
      "rf-node-card",
      `rf-node-${data.category}`,
      `rf-type-${data.type}`,
      data.selected ? "rf-selected" : "",
      data.modified ? "rf-modified" : "",
      data.validationLevel ? `rf-${data.validationLevel}` : ""
    ].join(" ")}
    title={data.validationMessage || ""}
    >
      <Handle type="target" position={Position.Left} />

      <div className="rf-node-title">{data.label}</div>
      <div className="rf-node-id">{data.id}</div>
      <div className="rf-node-type">{data.type}</div>
      {data.extra && <div className="rf-node-extra">{data.extra}</div>}

      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = {
  flowNode: FlowNode
};

function getFirstValidationMessage(type, id) {
  if (!window.validationState) return "";

  const owner =
    type === "entry"
      ? "entry:entry_point"
      : `${type}:${id}`;

  const error = window.validationState.errors?.find(
    (item) => item.owner === owner
  );

  if (error) return `${error.code}: ${error.message}`;

  const warning = window.validationState.warnings?.find(
    (item) => item.owner === owner
  );

  if (warning) return `${warning.code}: ${warning.message}`;

  return "";
}

function toReactFlow(callFlow) {
  const nodes = [
    {
      id: "entry_point",
      type: "flowNode",
      position: { x: 0, y: 200 },
      data: {
        id: callFlow.entry_point.pilot_number,
        label: "Entry Point",
        type: "entry_point",
        category: "entry",
        extra: `Start: ${callFlow.entry_point.start_node_id}`,
        selected:
          window.selectedType === "entry" &&
          window.selectedId === "entry_point",
        hovered:
          window.hoveredType === "entry" &&
          window.hoveredId === "entry_point",
        modified: isModified("entry", "entry_point"),
        validationLevel: getValidationLevel("entry", "entry_point"),
        validationMessage: getFirstValidationMessage("entry", "entry_point")
      }
    },
    ...callFlow.nodes.map((node) => ({
      id: node.id,
      type: "flowNode",
      position: node.position || { x: 300, y: 100 },
      data: {
        id: node.id,
        label: node.label,
        type: node.type || "node",
        category: "node",
        extra: node.prompt ? `Prompt: ${node.prompt}` : "",
        selected:
          window.selectedType === "node" &&
          window.selectedId === node.id,
        hovered:
          window.hoveredType === "node" &&
          window.hoveredId === node.id,
        modified: isModified("node", node.id),
        validationLevel: getValidationLevel("node", node.id),
        validationMessage: getFirstValidationMessage("node", node.id)
      }
    })),
    ...callFlow.targets.map((target) => ({
      id: target.id,
      type: "flowNode",
      position: target.position || { x: 700, y: 100 },
      data: {
        id: target.id,
        label: target.label,
        type: target.type || "target",
        category: "target",
        extra: target.number || "",
        selected:
          window.selectedType === "target" &&
          window.selectedId === target.id,
        hovered:
          window.hoveredType === "target" &&
          window.hoveredId === target.id,
        modified: isModified("target", target.id),
        validationLevel: getValidationLevel("target", target.id),
        validationMessage: getFirstValidationMessage("target", target.id)
      }
    }))
  ];

  const edges = [
    {
      id: "entry-start",
      source: "entry_point",
      target: callFlow.entry_point.start_node_id,
      label: "start",
      type: "smoothstep"
    },
    ...callFlow.nodes.flatMap((node) =>
      Object.entries(node.dtmf || {}).map(([key, destination]) => ({
        id: `${node.id}-${key}-${destination}`,
        source: node.id,
        target: destination,
        label: key === "default" ? "default" : `DTMF ${key}`,
        type: "smoothstep"
      }))
    )
  ];

  return { nodes, edges };
}

function ReactFlowGraph({ callFlow }) {
  const { nodes, edges } = toReactFlow(callFlow);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={(event, node) => {
        if (node.id === "entry_point") {
          window.selectItem("entry", "entry_point");
        } else if (callFlow.nodes.some((item) => item.id === node.id)) {
          window.selectItem("node", node.id);
        } else {
          window.selectItem("target", node.id);
        }
      }}
      /*
      onNodeMouseEnter={(event, node) => {
        if (node.id === "entry_point") {
          window.setHover("entry", "entry_point");
        } else if (callFlow.nodes.some((item) => item.id === node.id)) {
          window.setHover("node", node.id);
        } else {
          window.setHover("target", node.id);
        }
      }}
      onNodeMouseLeave={() => {
        window.clearHover();
      }}
        */
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}

window.renderReactFlowGraph = function renderReactFlowGraph(callFlow) {
  const container = document.getElementById("graphCanvas");
  if (!container || !callFlow) return;

  container.innerHTML = "";

  const root = createRoot(container);
  root.render(<ReactFlowGraph callFlow={callFlow} />);
};
