import { create } from 'zustand';

export const useGraphStore = create((set, get) => ({
  edges: [],
  nodes: [],
  rootNode: null,
  algorithm: 'DFS',
  traversalState: {
    visited: new Set(),
    visitOrder: [], // Track order of node visits
    current: null,
    currentEdge: null,
    callStack: [], // For DFS recursion simulation
    queue: [], // For BFS
    isRunning: false,
    isComplete: false,
    isAutoPlaying: false,
    phase: 'idle' // 'visiting', 'exploring', 'backtracking'
  },
  
  // Shortest path state
  shortestPath: {
    start: null,
    end: null,
    path: [],
    length: -1,
    edges: [],
    isCalculating: false,
    error: null
  },

  setEdges: (edges) => {
    const nodeSet = new Set();
    edges.forEach(([from, to]) => {
      nodeSet.add(from);
      nodeSet.add(to);
    });
    
    // Force-directed layout
    const nodeArray = Array.from(nodeSet);
    const nodePositions = {};
    const minDistance = 120;
    const width = 500;
    const height = 350;
    
    // Initialize random positions
    nodeArray.forEach(id => {
      nodePositions[id] = {
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50
      };
    });
    
    // Force-directed algorithm iterations
    for (let iter = 0; iter < 100; iter++) {
      const forces = {};
      nodeArray.forEach(id => {
        forces[id] = { x: 0, y: 0 };
      });
      
      // Repulsive forces between all nodes
      for (let i = 0; i < nodeArray.length; i++) {
        for (let j = i + 1; j < nodeArray.length; j++) {
          const node1 = nodeArray[i];
          const node2 = nodeArray[j];
          const dx = nodePositions[node2].x - nodePositions[node1].x;
          const dy = nodePositions[node2].y - nodePositions[node1].y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          if (distance < minDistance) {
            const force = (minDistance - distance) / distance * 0.5;
            forces[node1].x -= dx * force;
            forces[node1].y -= dy * force;
            forces[node2].x += dx * force;
            forces[node2].y += dy * force;
          }
        }
      }
      
      // Attractive forces for connected nodes
      edges.forEach(([from, to]) => {
        const dx = nodePositions[to].x - nodePositions[from].x;
        const dy = nodePositions[to].y - nodePositions[from].y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const idealDistance = 150;
        const force = (distance - idealDistance) / distance * 0.1;
        
        forces[from].x += dx * force;
        forces[from].y += dy * force;
        forces[to].x -= dx * force;
        forces[to].y -= dy * force;
      });
      
      // Apply forces
      nodeArray.forEach(id => {
        nodePositions[id].x += forces[id].x;
        nodePositions[id].y += forces[id].y;
        
        // Keep within bounds
        nodePositions[id].x = Math.max(30, Math.min(width - 30, nodePositions[id].x));
        nodePositions[id].y = Math.max(30, Math.min(height - 30, nodePositions[id].y));
      });
    }
    
    const nodes = nodeArray.map(id => ({
      id,
      position: nodePositions[id],
      data: { label: id }
    }));
    
    set({ 
      edges: edges.map(([from, to, weight], index) => ({
        id: `${from}-${to}-${index}`,
        source: from,
        target: to,
        label: weight || '',
        labelStyle: { fontSize: 12, fontWeight: 'bold' }
      })),
      nodes,
      rootNode: null,
      traversalState: {
        visited: new Set(),
        visitOrder: [],
        current: null,
        currentEdge: null,
        callStack: [],
        queue: [],
        isRunning: false,
        isComplete: false,
        isAutoPlaying: false,
        phase: 'idle'
      },
      shortestPath: {
        start: null,
        end: null,
        path: [],
        length: -1,
        edges: [],
        isCalculating: false,
        error: null
      }
    });
  },

  setRootNode: (nodeId) => set({ rootNode: nodeId }),
  
  setAlgorithm: (algorithm) => set({ algorithm }),

  resetTraversal: () => set({
    traversalState: {
      visited: new Set(),
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
  }),
  
  // Shortest path methods
  setShortestPathNodes: (start, end) => set({
    shortestPath: {
      ...get().shortestPath,
      start,
      end,
      path: [],
      length: -1,
      edges: [],
      error: null
    }
  }),
  
  setShortestPathResult: (result) => set({
    shortestPath: {
      ...get().shortestPath,
      ...result,
      isCalculating: false
    }
  }),
  
  setShortestPathCalculating: (isCalculating) => set({
    shortestPath: {
      ...get().shortestPath,
      isCalculating
    }
  }),
  
  clearShortestPath: () => set({
    shortestPath: {
      start: null,
      end: null,
      path: [],
      length: -1,
      edges: [],
      isCalculating: false,
      error: null
    }
  })
}));