import React, { useMemo, useEffect, useRef, useState } from "react";
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
import { useNodesState, useEdgesState } from "@xyflow/react";

function getValidationLevel(type, id) {
  if (!window.validationState) return "";
  const owner = type === "entry" ? "entry:entry_point" : `${type}:${id}`;
  if (window.validationState.errors?.some((item) => item.owner === owner)) return "error";
  if (window.validationState.warnings?.some((item) => item.owner === owner)) return "warning";
  return "";
}

function isModified(type, id) {
  const owner = type === "entry" ? "entry:entry_point" : `${type}:${id}`;
  return window.modifiedItems?.has?.(owner) ?? false;
}

function getFirstValidationMessage(type, id) {
  if (!window.validationState) return "";
  const owner = type === "entry" ? "entry:entry_point" : `${type}:${id}`;
  const error = window.validationState.errors?.find((item) => item.owner === owner);
  if (error) return `${error.code}: ${error.message}`;
  const warning = window.validationState.warnings?.find((item) => item.owner === owner);
  if (warning) return `${warning.code}: ${warning.message}`;
  return "";
}

function FlowNode({ data }) {
  return (
    <div
      className={[
        "rf-node-card",
        `rf-node-${data.category}`,
        `rf-type-${data.type}`,
        data.selected   ? "rf-selected"              : "",
        data.modified   ? "rf-modified"              : "",
        data.validationLevel ? `rf-${data.validationLevel}` : ""
      ].filter(Boolean).join(" ")}
      title={data.validationMessage || ""}
      data-link-key={data.linkKey}
    >
      {data.validationLevel === "error"   && <div className="rf-status rf-status-error">!</div>}
      {data.validationLevel === "warning" && <div className="rf-status rf-status-warning">⚠</div>}
      <Handle type="target" position={Position.Left} />
      <div className="rf-node-title">{data.label}</div>
      <div className="rf-node-id">{data.id}</div>
      <div className="rf-node-type">{data.type}</div>
      {data.extra && <div className="rf-node-extra">{data.extra}</div>}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { flowNode: FlowNode };

function toReactFlow(callFlow) {
  const nodes = [
    {
      id: "entry_point",
      type: "flowNode",
      position: callFlow.entry_point.position || { x: 0, y: 200 },
      data: {
        id: callFlow.entry_point.pilot_number,
        label: "Entry Point",
        type: "entry_point",
        category: "entry",
        extra: `Start: ${callFlow.entry_point.start_node_id}`,
        linkKey: "entry:entry_point",
        selected: window.selectedType === "entry" && window.selectedId === "entry_point",
        modified: isModified("entry", "entry_point"),
        validationLevel:   getValidationLevel("entry", "entry_point"),
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
        linkKey: `node:${node.id}`,
        selected: window.selectedType === "node" && window.selectedId === node.id,
        modified: isModified("node", node.id),
        validationLevel:   getValidationLevel("node", node.id),
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
        linkKey: `target:${target.id}`,
        selected: window.selectedType === "target" && window.selectedId === target.id,
        modified: isModified("target", target.id),
        validationLevel:   getValidationLevel("target", target.id),
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

function ReactFlowGraph({ callFlow, version }) {
  const callFlowRef = useRef(callFlow);

  // Build initial node/edge set once on mount
  const initial = useMemo(() => toReactFlow(callFlow), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  useEffect(() => { callFlowRef.current = callFlow; }, [callFlow]);

  useEffect(() => {
    const updated = toReactFlow(callFlowRef.current);
    setNodes((prevNodes) =>
      updated.nodes.map((updatedNode) => {
        const existing = prevNodes.find((n) => n.id === updatedNode.id);
        if (existing) {
          updatedNode.position = existing.position;
        }
        return updatedNode;
      })
    );
    setEdges(updated.edges);
  }, [version]);

  const saveTimer = useRef(null);

  const handleNodesChange = (changes) => {
    const filtered = changes.filter((c) => c.type !== "select");
    onNodesChange(filtered);

    changes.forEach((change) => {
      if (change.type === "position" && change.position) {
        const cf = callFlowRef.current;
        if (change.id === "entry_point") {
          cf.entry_point.position = change.position;
        } else {
          const node = cf.nodes?.find((n) => n.id === change.id);
          if (node) node.position = change.position;
          const target = cf.targets?.find((t) => t.id === change.id);
          if (target) target.position = change.position;
        }

        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          if (window.saveCallFlowLocally) window.saveCallFlowLocally();
        }, 400);
      }
    });
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={handleNodesChange}
      onEdgesChange={onEdgesChange}
      nodesDraggable={true}
      nodesConnectable={false}
      elementsSelectable={false}
      onNodeClick={(event, node) => {
        event.stopPropagation();
        if (node.id === "entry_point") {
          window.selectItem("entry", "entry_point");
        } else if (callFlowRef.current.nodes.some((n) => n.id === node.id)) {
          window.selectItem("node", node.id);
        } else {
          window.selectItem("target", node.id);
        }
      }}
      onPaneClick={() => {
      }}
      onNodeMouseEnter={(event, node) => {
        let type = "target";
        if (node.id === "entry_point") type = "entry";
        else if (callFlowRef.current.nodes.some((n) => n.id === node.id)) type = "node";
        if (window.setHover) window.setHover(type, node.id);
      }}
      onNodeMouseLeave={() => {
        if (window.clearHover) window.clearHover();
      }}
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}

let reactFlowRoot = null;
let lastContainer = null;
let renderVersion = 0;

window.renderReactFlowGraph = function renderReactFlowGraph(callFlow) {
  const container = document.getElementById("graphCanvas");
  if (!container || !callFlow) return;

  if (!reactFlowRoot || container !== lastContainer) {
    reactFlowRoot = createRoot(container);
    lastContainer = container;
  }

  renderVersion += 1;
  reactFlowRoot.render(<ReactFlowGraph callFlow={callFlow} version={renderVersion} />);
};
