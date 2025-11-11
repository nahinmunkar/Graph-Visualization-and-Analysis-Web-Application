import { useCallback } from 'react';
import { useGraphStore } from '../store/graphStore';

const API_BASE_URL = 'http://localhost:5000';

export const useShortestPath = () => {
  const edges = useGraphStore((state) => state.edges);
  const setShortestPathResult = useGraphStore((state) => state.setShortestPathResult);
  const setShortestPathCalculating = useGraphStore((state) => state.setShortestPathCalculating);

  const calculateShortestPath = useCallback(async (startNode, endNode) => {
    if (!startNode || !endNode) {
      setShortestPathResult({
        error: 'Please select both start and end nodes',
        path: [],
        length: -1,
        edges: []
      });
      return;
    }

    if (startNode === endNode) {
      setShortestPathResult({
        error: 'Start and end nodes must be different',
        path: [],
        length: -1,
        edges: []
      });
      return;
    }

    try {
      setShortestPathCalculating(true);

      // Convert edges format to backend expected format
      const edgesForBackend = edges.map(edge => [edge.source, edge.target]);

      const response = await fetch(`${API_BASE_URL}/shortest_path`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          edges: edgesForBackend,
          start: startNode,
          end: endNode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate shortest path');
      }

      const { path, length, edges: pathEdges, exists, error } = data;

      if (!exists) {
        setShortestPathResult({
          path: [],
          length: -1,
          edges: [],
          error: error || `No path exists between ${startNode} and ${endNode}`
        });
      } else {
        setShortestPathResult({
          path,
          length,
          edges: pathEdges,
          error: null
        });
      }
    } catch (error) {
      console.error('Error calculating shortest path:', error);
      setShortestPathResult({
        path: [],
        length: -1,
        edges: [],
        error: error.message || 'Failed to calculate shortest path'
      });
    } finally {
      setShortestPathCalculating(false);
    }
  }, [edges, setShortestPathResult, setShortestPathCalculating]);

  return { calculateShortestPath };
};