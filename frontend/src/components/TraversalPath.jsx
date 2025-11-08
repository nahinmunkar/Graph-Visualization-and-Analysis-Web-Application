import React from 'react';
import { Card, Typography } from 'antd';
import { useGraphStore } from '../store/graphStore';

const { Text } = Typography;

export const TraversalPath = () => {
  const { traversalState, algorithm } = useGraphStore();
  const { visitOrder, isComplete } = traversalState;

  if (!visitOrder || visitOrder.length === 0 || !isComplete) {
    return null;
  }

  const pathString = visitOrder.join(' → ');

  return (
    <Card 
      title={`${algorithm} Traversal Path`} 
      size="small" 
      style={{ 
        position: 'absolute', 
        bottom: 20, 
        left: 20, 
        zIndex: 10, 
        maxWidth: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
      }}
    >
      <Text strong>Path: </Text>
      <Text code style={{ fontSize: '14px' }}>
        {pathString}
      </Text>
      {isComplete && (
        <Text type="success" style={{ marginLeft: 8 }}>
          ✓ Complete
        </Text>
      )}
    </Card>
  );
};