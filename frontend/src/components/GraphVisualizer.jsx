import React, { useMemo } from "react";
import { Card } from "antd";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { useGraphStore } from "../store/graphStore";
import { TraversalPath } from "./TraversalPath";

const nodeTypes = {};

export const GraphVisualizer = () => {
  const storeNodes = useGraphStore(state => state.nodes);
  const storeEdges = useGraphStore(state => state.edges);
  const traversalState = useGraphStore(state => state.traversalState);

  const nodes = useMemo(() => {
    return storeNodes.map((node) => {
      const visitIndex = traversalState.visitOrder.indexOf(node.id);
      const displayLabel = visitIndex >= 0 ? `${node.data.label} (${visitIndex + 1})` : node.data.label;
      
      return {
        ...node,
        data: { label: displayLabel },
        style: {
          background: getNodeColor(node.id, traversalState),
          color: "#fff",
          border: "2px solid #222",
          borderRadius: "50%",
          width: 50,
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: "bold",
          transition: "background-color 0.3s ease",
        },
      };
    });
  }, [storeNodes, traversalState]);

  const edges = useMemo(() => {
    return storeEdges.map((edge) => ({
      ...edge,
      type: 'straight',
      style: {
        stroke: getEdgeColor(edge, traversalState),
        strokeWidth: 3,
        transition: "stroke 0.3s ease",
      },
      animated: isEdgeAnimated(edge, traversalState),
    }));
  }, [storeEdges, traversalState]);

  if (storeNodes.length === 0) {
    return (
      <Card title="Graph Visualization" style={{ height: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
          Please input a graph to visualize
        </div>
      </Card>
    );
  }

  return (
    <Card title="Interactive Graph Visualization" style={{ height: 600, padding: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => getNodeColor(node.id, traversalState)}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        {traversalState.isComplete && <TraversalPath />}
      </ReactFlow>
    </Card>
  );
};

function getNodeColor(nodeId, traversalState) {
  if (traversalState.current === nodeId) {
    return "#ff6b6b";
  }
  if (traversalState.visited.includes(nodeId)) {
    return "#51cf66";
  }
  return "#339af0";
}

function getEdgeColor(edge, traversalState) {
  if (traversalState.currentEdge && traversalState.currentEdge === edge.id) {
    return "#ff6b6b";
  }
  if (traversalState.visited.includes(edge.source) && traversalState.visited.includes(edge.target)) {
    return "#51cf66";
  }
  return "#b1b1b7";
}

function isEdgeAnimated(edge, traversalState) {
  return traversalState.currentEdge && traversalState.currentEdge === edge.id;
}
