import React from 'react';
import { Card, Select } from 'antd';
import { useGraphStore } from '../store/graphStore';

export const RootSelector = () => {
  const { nodes, rootNode, setRootNode } = useGraphStore();

  if (nodes.length === 0) return null;

  return (
    <Card title="Select Root Node" style={{ marginBottom: 16 }}>
      <Select
        style={{ width: '100%' }}
        placeholder="Choose starting node"
        value={rootNode}
        onChange={setRootNode}
        options={nodes.map(node => ({
          value: node.id,
          label: node.id
        }))}
      />
    </Card>
  );
};