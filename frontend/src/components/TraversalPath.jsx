import React from 'react';
import { Card, Typography } from 'antd';
import { useGraphStore } from '../store/graphStore';

const { Text } = Typography;

export const TraversalPath = () => {
  const { traversalState, algorithm } = useGraphStore();
  const { visitOrder, isComplete } = traversalState;

  if (!visitOrder || visitOrder.length === 0) {
    return null;
  }

  const pathString = visitOrder.join(' → ');

  return (
    <Card 
      title={`${algorithm} Traversal Path`} 
      size="small" 
      style={{ marginTop: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Text strong>Path: </Text>
        <Text code style={{ fontSize: '14px' }}>
          {pathString}
        </Text>
        {isComplete && (
          <Text type="success" style={{ marginLeft: 8 }}>
            ✓ Complete
          </Text>
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        <Text type="secondary">
          Nodes visited: {visitOrder.length}
        </Text>
      </div>
    </Card>
  );
};