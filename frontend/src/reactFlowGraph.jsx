import React from "react";
import { createRoot } from "react-dom/client";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

let reactFlowRoot = null;

function toReactFlow(callFlow) {
  const nodes = [
    {
      id: "entry_point",
      position: { x: 0, y: 200 },
      data: {
        label: `Entry Point\n${callFlow.entry_point.pilot_number}`
      }
    },
    ...callFlow.nodes.map((node) => ({
      id: node.id,
      position: node.position || { x: 300, y: 100 },
      data: {
        label: `${node.label}\n${node.id}\n${node.type}`
      }
    })),
    ...callFlow.targets.map((target) => ({
      id: target.id,
      position: target.position || { x: 700, y: 100 },
      data: {
        label: `${target.label}\n${target.id}\n${target.type}`
      }
    }))
  ];

  const edges = [
    {
      id: "entry-start",
      source: "entry_point",
      target: callFlow.entry_point.start_node_id,
      label: "start"
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
      fitView
      onNodeClick={(event, node) => {
        if (node.id === "entry_point") {
          window.selectItem("entry", "entry_point");
        } else if (callFlow.nodes.some((item) => item.id === node.id)) {
          window.selectItem("node", node.id);
        } else {
          window.selectItem("target", node.id);
        }
      }}
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

  if (!reactFlowRoot) {
    reactFlowRoot = createRoot(container);
  }

  reactFlowRoot.render(<ReactFlowGraph callFlow={callFlow} />);
};