import { useCallback, useEffect, useRef } from 'react';
import { useGraphStore } from '../store/graphStore';

export const useTraversal = () => {
  const { 
    edges, 
    rootNode, 
    algorithm, 
    traversalState, 
    updateTraversalState, 
    resetTraversal 
  } = useGraphStore();

  const buildAdjacencyList = useCallback(() => {
    const adjList = {};
    edges.forEach(({ source, target }) => {
      if (!adjList[source]) adjList[source] = [];
      if (!adjList[target]) adjList[target] = [];
      adjList[source].push(target);
      adjList[target].push(source);
    });
    return adjList;
  }, [edges]);

  const stepDFS = useCallback(() => {
    const { callStack, visited, visitOrder } = traversalState;
    const adjList = buildAdjacencyList();
    
    if (callStack.length === 0) {
      updateTraversalState({ isComplete: true, isRunning: false, current: null, currentEdge: null, phase: 'idle' });
      return;
    }

    const currentFrame = callStack[callStack.length - 1];
    const { node, parent, children, childIndex } = currentFrame;

    if (currentFrame.phase === 'start') {
      // Mark node as visited and highlight it
      const newVisited = new Set(visited);
      const newVisitOrder = [...visitOrder];
      
      if (!newVisited.has(node)) {
        newVisited.add(node);
        newVisitOrder.push(node);
      }
      
      // Get unvisited children
      const unvisitedChildren = (adjList[node] || []).filter(child => !newVisited.has(child));
      
      const newCallStack = [...callStack];
      newCallStack[newCallStack.length - 1] = {
        ...currentFrame,
        children: unvisitedChildren,
        phase: 'exploring'
      };

      updateTraversalState({
        visited: newVisited,
        visitOrder: newVisitOrder,
        current: node,
        currentEdge: null,
        callStack: newCallStack,
        phase: 'visiting'
      });
    } else if (currentFrame.phase === 'exploring') {
      if (childIndex < children.length) {
        // Highlight edge to child
        const child = children[childIndex];
        const edgeId = edges.find(edge => 
          (edge.source === node && edge.target === child) ||
          (edge.source === child && edge.target === node)
        )?.id;

        const newCallStack = [...callStack];
        newCallStack[newCallStack.length - 1] = {
          ...currentFrame,
          childIndex: childIndex + 1
        };
        
        // Add child to call stack
        newCallStack.push({
          node: child,
          parent: node,
          children: [],
          childIndex: 0,
          phase: 'start'
        });

        updateTraversalState({
          currentEdge: edgeId,
          callStack: newCallStack,
          phase: 'exploring'
        });
      } else {
        // Done exploring children, start backtracking
        const newCallStack = [...callStack];
        newCallStack[newCallStack.length - 1] = {
          ...currentFrame,
          phase: 'backtracking'
        };

        updateTraversalState({
          callStack: newCallStack,
          phase: 'backtracking'
        });
      }
    } else if (currentFrame.phase === 'backtracking') {
      // Highlight edge back to parent and remove current frame
      const edgeId = parent ? edges.find(edge => 
        (edge.source === node && edge.target === parent) ||
        (edge.source === parent && edge.target === node)
      )?.id : null;

      const newCallStack = callStack.slice(0, -1);
      
      updateTraversalState({
        current: parent,
        currentEdge: edgeId,
        callStack: newCallStack,
        phase: newCallStack.length > 0 ? 'exploring' : 'idle'
      });
    }
  }, [traversalState, buildAdjacencyList, updateTraversalState, edges]);

  const stepBFS = useCallback(() => {
    const { queue, visited, visitOrder } = traversalState;
    const adjList = buildAdjacencyList();
    
    if (queue.length === 0) {
      updateTraversalState({ isComplete: true, isRunning: false, current: null, currentEdge: null, phase: 'idle' });
      return;
    }

    const { node: currentNode, parent } = queue.shift();
    const newVisited = new Set(visited);
    const newVisitOrder = [...visitOrder];
    
    if (!newVisited.has(currentNode)) {
      newVisited.add(currentNode);
      newVisitOrder.push(currentNode);
    }

    // Find edge from parent to current node
    let currentEdge = null;
    if (parent) {
      currentEdge = edges.find(edge => 
        (edge.source === parent && edge.target === currentNode) ||
        (edge.source === currentNode && edge.target === parent)
      )?.id || null;
    }

    const neighbors = (adjList[currentNode] || []).filter(neighbor => 
      !newVisited.has(neighbor) && 
      !queue.some(item => item.node === neighbor)
    );
    const newQueue = [...queue, ...neighbors.map(neighbor => ({ node: neighbor, parent: currentNode }))]; 

    updateTraversalState({
      visited: newVisited,
      visitOrder: newVisitOrder,
      current: currentNode,
      currentEdge,
      queue: newQueue,
      phase: 'visiting'
    });
  }, [traversalState, buildAdjacencyList, updateTraversalState, edges]);

  const stepTraversal = useCallback(() => {
    if (!traversalState.isRunning || traversalState.isComplete) return;

    if (algorithm === 'DFS') {
      stepDFS();
    } else {
      stepBFS();
    }
  }, [algorithm, traversalState, stepDFS, stepBFS]);

  const startTraversal = useCallback(() => {
    if (!rootNode) return;
    
    resetTraversal();
    
    if (algorithm === 'DFS') {
      updateTraversalState({
        callStack: [{ node: rootNode, parent: null, children: [], childIndex: 0, phase: 'start' }],
        isRunning: true,
        phase: 'visiting'
      });
    } else {
      updateTraversalState({
        queue: [{ node: rootNode, parent: null }],
        isRunning: true,
        phase: 'visiting'
      });
    }
  }, [rootNode, algorithm, resetTraversal, updateTraversalState]);

  const intervalRef = useRef(null);

  const startAutoPlay = useCallback(() => {
    if (!rootNode) return;
    
    resetTraversal();
    
    if (algorithm === 'DFS') {
      updateTraversalState({
        callStack: [{ node: rootNode, parent: null, children: [], childIndex: 0, phase: 'start' }],
        isRunning: true,
        isAutoPlaying: true,
        phase: 'visiting'
      });
    } else {
      updateTraversalState({
        queue: [{ node: rootNode, parent: null }],
        isRunning: true,
        isAutoPlaying: true,
        phase: 'visiting'
      });
    }
  }, [rootNode, algorithm, resetTraversal, updateTraversalState]);

  const stopAutoPlay = useCallback(() => {
    updateTraversalState({ isAutoPlaying: false });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [updateTraversalState]);

  useEffect(() => {
    if (traversalState.isAutoPlaying && traversalState.isRunning && !traversalState.isComplete) {
      intervalRef.current = setInterval(() => {
        stepTraversal();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [traversalState.isAutoPlaying, traversalState.isRunning, traversalState.isComplete, stepTraversal]);

  return { startTraversal, stepTraversal, startAutoPlay, stopAutoPlay };
};