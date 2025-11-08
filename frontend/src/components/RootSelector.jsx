import React from 'react';
import { Card, Select } from 'antd';
import { useGraphStore } from '../store/graphStore';

export const RootSelector = () => {
  const { nodes, rootNode, setRootNode } = useGraphStore(state => ({
    nodes: state.nodes,
    rootNode: state.rootNode,
    setRootNode: state.setRootNode
  }));

  if (nodes.length === 0) return null;

  return (
    <Card title="Select Root Node" style={{ marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <Select
        style={{ width: '100%' }}
        placeholder="Choose starting node"
        value={rootNode}
        onChange={setRootNode}
        options={nodes.map(node => ({
          value: node.id,
          label: node.id
        }))}
        showSearch
      />
    </Card>
  );
};