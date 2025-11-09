import { useState, useCallback } from 'react';

export const useGraphClassification = () => {
  const [classification, setClassification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const classifyGraph = useCallback(async (edges) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ edges }),
      });

      if (!response.ok) {
        throw new Error('Classification failed');
      }

      const result = await response.json();
      setClassification(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetClassification = useCallback(() => {
    setClassification(null);
    setError(null);
  }, []);

  return {
    classification,
    loading,
    error,
    classifyGraph,
    resetClassification,
  };
};