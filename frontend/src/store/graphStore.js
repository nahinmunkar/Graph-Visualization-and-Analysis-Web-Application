import { create } from 'zustand';
import * as d3 from 'd3'; // d3 ইম্পোর্ট

export const useGraphStore = create((set, get) => ({
  edges: [],
  nodes: [],
  rootNode: null,
  algorithm: 'DFS',
  traversalState: {
    visited: [], // Changed from Set to Array
    visitOrder: [],
    current: null,
    currentEdge: null,
    callStack: [], // For DFS
    queue: [], // For BFS
    isRunning: false,
    isComplete: false,
    isAutoPlaying: false,
    phase: 'idle'
  },

  setEdges: (edges) => {
    const nodeSet = new Set();
    edges.forEach(([from, to]) => {
      nodeSet.add(from);
      nodeSet.add(to);
    });
    
    const nodeArray = Array.from(nodeSet).map(id => ({ id, data: { label: id } }));

    // d3 force simulation দিয়ে পজিশন সেট করা
    const simulation = d3.forceSimulation(nodeArray)
      .force("link", d3.forceLink(edges.map(e => ({ source: e[0], target: e[1] }))).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(400, 250))
      .stop() // সিমুলেশন না চালিয়ে শুধু পজিশন জেনারেট
      .tick(300); // 300 ইটারেশন চালানো

    const nodesWithPositions = nodeArray.map(node => ({
        id: node.id,
        position: { x: node.x, y: node.y },
        data: { label: node.id }
    }));
    
    set({ 
      edges: edges.map(([from, to, weight], index) => ({
        id: `${from}-${to}-${index}`,
        source: from,
        target: to,
        label: weight || '',
        labelStyle: { fontSize: 12, fontWeight: 'bold' }
      })),
      nodes: nodesWithPositions,
      rootNode: null,
      traversalState: {
        visited: [], // Changed from Set to Array
        visitOrder: [],
        current: null,
        currentEdge: null,
        callStack: [],
        queue: [],
        isRunning: false,
        isComplete: false,
        isAutoPlaying: false,
        phase: 'idle'
      }
    });
  },

  setRootNode: (nodeId) => set({ rootNode: nodeId }),
  
  setAlgorithm: (algorithm) => set({ algorithm }),

  resetTraversal: () => set({
    traversalState: {
      visited: [], // Changed from Set to Array
      visitOrder: [],
      current: null,
      currentEdge: null,
      callStack: [],
      queue: [],
      isRunning: false,
      isComplete: false,
      isAutoPlaying: false,
      phase: 'idle'
    }
  }),

  updateTraversalState: (newState) => set({
    traversalState: { ...get().traversalState, ...newState }
  })
}));