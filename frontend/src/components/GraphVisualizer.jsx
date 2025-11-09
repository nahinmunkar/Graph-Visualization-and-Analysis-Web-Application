import React, { useCallback, useMemo } from "react";
import { Card } from "antd";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { useGraphStore } from "../store/graphStore";
import { TraversalPath } from "./TraversalPath";

const nodeTypes = {};

export const GraphVisualizer = () => {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    traversalState,
  } = useGraphStore();

  const initialNodes = useMemo(() => {
    return storeNodes.map((node) => {
      const visitIndex = traversalState.visitOrder.indexOf(node.id);
      const displayLabel = visitIndex >= 0 ? `${node.data.label}(${visitIndex + 1})` : node.data.label;
      
      return {
        id: node.id,
        position: node.position,
        data: { label: displayLabel },
        style: {
          background: getNodeColor(node.id, traversalState),
          color: "#fff",
          border: "2px solid #222",
          borderRadius: "50%",
          width: 60,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: "bold",
          transition: "all 0.3s ease",
        },
        type: "default",
      };
    });
  }, [storeNodes, traversalState]);

  const initialEdges = useMemo(() => {
    return storeEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'straight',
      style: {
        stroke: getEdgeColor(edge, traversalState),
        strokeWidth: 2,
        transition: "all 0.3s ease",
      },
      labelStyle: {
        fontSize: 12,
        fontWeight: "bold",
        background: "#fff",
        padding: "2px 4px",
        borderRadius: "4px",
      },
      animated: isEdgeAnimated(edge, traversalState),
    }));
  }, [storeEdges, traversalState]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Update nodes and edges when store changes
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  if (storeNodes.length === 0) {
    return (
      <Card
        title="Graph Visualization"
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e8e8e8",
        }}
      >
        <div
          style={{
            height: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8fafc",
            borderRadius: "8px",
            color: "#64748b",
            fontSize: "16px",
            fontWeight: "500",
          }}
        >
          Please input a graph to visualize
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Interactive Graph Visualization"
      style={{
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e8e8e8",
      }}
    >
      <div style={{ height: 500, background: "#f8fafc", borderRadius: "8px" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          {traversalState.isComplete ? (
            <div style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              zIndex: 1000,
              maxWidth: 300
            }}>
              <TraversalPath />
            </div>
          ) : (
            <MiniMap
              nodeColor={(node) => getNodeColor(node.id, traversalState)}
              nodeStrokeWidth={3}
              zoomable
              pannable
            />
          )}
        </ReactFlow>
      </div>
    </Card>
  );
};

function getNodeColor(nodeId, traversalState) {
  if (traversalState.current === nodeId) {
    return "#ff6b6b"; // Current node - red
  }
  if (traversalState.visited.has(nodeId)) {
    return "#51cf66"; // Visited node - green
  }
  return "#339af0"; // Unvisited node - blue
}

function getEdgeColor(edge, traversalState) {
  // Current edge being traversed
  if (traversalState.currentEdge && traversalState.currentEdge === edge.id) {
    return "#ff6b6b"; // Current edge - red
  }
  
  // Edge between visited nodes (traversed edge)
  if (traversalState.visited.has(edge.source) && traversalState.visited.has(edge.target)) {
    return "#51cf66"; // Traversed edge - green
  }
  
  // Edge connected to current node
  if (traversalState.current && 
      (edge.source === traversalState.current || edge.target === traversalState.current)) {
    return "#ffd43b"; // Connected to current - yellow
  }
  
  return "#b1b1b7"; // Default edge - gray
}

function isEdgeAnimated(edge, traversalState) {
  return traversalState.currentEdge && traversalState.currentEdge === edge.id;
}
