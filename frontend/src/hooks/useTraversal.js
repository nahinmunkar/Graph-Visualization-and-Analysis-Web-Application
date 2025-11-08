import { useCallback, useEffect, useRef } from 'react';
import { useGraphStore } from '../store/graphStore';

export const useTraversal = () => {
  const edges = useGraphStore(state => state.edges);
  const rootNode = useGraphStore(state => state.rootNode);
  const algorithm = useGraphStore(state => state.algorithm);
  const traversalState = useGraphStore(state => state.traversalState);
  const updateTraversalState = useGraphStore(state => state.updateTraversalState);
  const resetTraversal = useGraphStore(state => state.resetTraversal);

  const buildAdjacencyList = useCallback(() => {
    const adjList = new Map();
    edges.forEach(({ source, target }) => {
      if (!adjList.has(source)) adjList.set(source, []);
      if (!adjList.has(target)) adjList.set(target, []);
      adjList.get(source).push(target);
      adjList.get(target).push(source);
    });
    return adjList;
  }, [edges]);

  const stepDFS = useCallback(() => {
    const { callStack, visited } = traversalState;
    const adjList = buildAdjacencyList();
    
    if (callStack.length === 0) {
      updateTraversalState({ isComplete: true, isRunning: false, current: null, currentEdge: null });
      return;
    }

    const newStack = [...callStack];
    const { node: currentNode, parent } = newStack.pop();

    if (visited.includes(currentNode)) {
      updateTraversalState({ callStack: newStack });
      return;
    }

    const newVisited = [...visited, currentNode];
    const newVisitOrder = [...traversalState.visitOrder, currentNode];

    const currentEdge = parent ? edges.find(e => (e.source === parent && e.target === currentNode) || (e.source === currentNode && e.target === parent))?.id : null;

    updateTraversalState({
      visited: newVisited,
      visitOrder: newVisitOrder,
      current: currentNode,
      currentEdge: currentEdge,
    });

    const neighbors = (adjList.get(currentNode) || []).filter(neighbor => !newVisited.includes(neighbor));
    for (let i = neighbors.length - 1; i >= 0; i--) {
      newStack.push({ node: neighbors[i], parent: currentNode });
    }
    
    updateTraversalState({ callStack: newStack });

  }, [traversalState, buildAdjacencyList, updateTraversalState, edges]);

  const stepBFS = useCallback(() => {
    const { queue, visited } = traversalState;
    const adjList = buildAdjacencyList();

    if (queue.length === 0) {
      updateTraversalState({ isComplete: true, isRunning: false, current: null, currentEdge: null });
      return;
    }

    const newQueue = [...queue];
    const { node: currentNode, parent } = newQueue.shift();

    if (visited.includes(currentNode)) {
      updateTraversalState({ queue: newQueue });
      return;
    }

    const newVisited = [...visited, currentNode];
    const newVisitOrder = [...traversalState.visitOrder, currentNode];

    const currentEdge = parent ? edges.find(e => (e.source === parent && e.target === currentNode) || (e.source === currentNode && e.target === parent))?.id : null;

    updateTraversalState({
      visited: newVisited,
      visitOrder: newVisitOrder,
      current: currentNode,
      currentEdge: currentEdge,
    });

    const neighbors = (adjList.get(currentNode) || []).filter(neighbor => !newVisited.includes(neighbor) && !newQueue.some(item => item.node === neighbor));
    for (const neighbor of neighbors) {
      newQueue.push({ node: neighbor, parent: currentNode });
    }
    
    updateTraversalState({ queue: newQueue });

  }, [traversalState, buildAdjacencyList, updateTraversalState, edges]);

  const stepTraversal = useCallback(() => {
    if (!traversalState.isRunning || traversalState.isComplete) return;

    if (algorithm === 'DFS') {
      stepDFS();
    } else {
      stepBFS();
    }
  }, [algorithm, traversalState.isRunning, traversalState.isComplete, stepDFS, stepBFS]);

  const startTraversal = useCallback(() => {
    if (!rootNode) return;
    resetTraversal();
    
    if (algorithm === 'DFS') {
      updateTraversalState({
        callStack: [{ node: rootNode, parent: null }],
        isRunning: true,
      });
    } else {
      updateTraversalState({
        queue: [{ node: rootNode, parent: null }],
        isRunning: true,
      });
    }
  }, [rootNode, algorithm, resetTraversal, updateTraversalState]);

  const intervalRef = useRef(null);

  const startAutoPlay = useCallback(() => {
    startTraversal();
    updateTraversalState({ isAutoPlaying: true });
  }, [startTraversal, updateTraversalState]);

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
        if (algorithm === 'DFS') stepDFS();
        else stepBFS();
      }, 1000);
    } else if (traversalState.isComplete || !traversalState.isAutoPlaying) {
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
  }, [traversalState.isAutoPlaying, traversalState.isRunning, traversalState.isComplete, algorithm, stepDFS, stepBFS]);

  return {
    startTraversal,
    stepTraversal,
    startAutoPlay,
    stopAutoPlay,
    resetTraversal,
  };
};
