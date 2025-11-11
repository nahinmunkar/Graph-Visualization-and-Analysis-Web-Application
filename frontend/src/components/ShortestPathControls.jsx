import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Space, Typography, Alert } from 'antd';
import { AimOutlined, ClearOutlined } from '@ant-design/icons';
import { useGraphStore } from '../store/graphStore';
import { useShortestPath } from '../hooks/useShortestPath';

const { Title, Text } = Typography;
const { Option } = Select;

export const ShortestPathControls = () => {
  const nodes = useGraphStore((state) => state.nodes);
  const shortestPath = useGraphStore((state) => state.shortestPath);
  const clearShortestPath = useGraphStore((state) => state.clearShortestPath);
  const setShortestPathNodes = useGraphStore((state) => state.setShortestPathNodes);
  
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  
  const { calculateShortestPath } = useShortestPath();

  useEffect(() => {
    // Clear selections if nodes change
    if (nodes.length === 0) {
      setStartNode(null);
      setEndNode(null);
      clearShortestPath();
    }
  }, [nodes, clearShortestPath]);

  const handleCalculate = () => {
    if (startNode && endNode) {
      setShortestPathNodes(startNode, endNode);
      calculateShortestPath(startNode, endNode);
    }
  };

  const handleClear = () => {
    setStartNode(null);
    setEndNode(null);
    clearShortestPath();
  };

  // Don't show if no graph
  if (nodes.length === 0) return null;

  return (
    <Card 
      title={
        <Space>
          <AimOutlined />
          <span>Shortest Path Finder</span>
        </Space>
      }
      style={{ marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Text strong>Start Node:</Text>
          <Select
            placeholder="Select start node"
            style={{ width: '100%', marginTop: 8 }}
            value={startNode}
            onChange={setStartNode}
            disabled={nodes.length === 0 || shortestPath.isCalculating}
          >
            {nodes.map(node => (
              <Option key={node.id} value={node.id} disabled={node.id === endNode}>
                {node.id}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <Text strong>End Node:</Text>
          <Select
            placeholder="Select end node"
            style={{ width: '100%', marginTop: 8 }}
            value={endNode}
            onChange={setEndNode}
            disabled={nodes.length === 0 || shortestPath.isCalculating}
          >
            {nodes.map(node => (
              <Option key={node.id} value={node.id} disabled={node.id === startNode}>
                {node.id}
              </Option>
            ))}
          </Select>
        </div>

        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button
            type="primary"
            icon={<AimOutlined />}
            onClick={handleCalculate}
            disabled={!startNode || !endNode || shortestPath.isCalculating}
            loading={shortestPath.isCalculating}
          >
            Find Path
          </Button>
          <Button
            icon={<ClearOutlined />}
            onClick={handleClear}
            disabled={shortestPath.isCalculating}
          >
            Clear
          </Button>
        </Space>

        {shortestPath.error && (
          <Alert message={shortestPath.error} type="error" showIcon />
        )}

        {shortestPath.path.length > 0 && !shortestPath.error && (
          <Alert
            message="Shortest Path Found"
            description={
              <Space direction="vertical" size="small">
                <Text>
                  <strong>Path:</strong> {shortestPath.path.join(' → ')}
                </Text>
                <Text>
                  <strong>Length:</strong> {shortestPath.length} {shortestPath.length === 1 ? 'edge' : 'edges'}
                </Text>
              </Space>
            }
            type="success"
            showIcon
          />
        )}
      </Space>
    </Card>
  );
};