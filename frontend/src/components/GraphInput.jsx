import React, { useState } from 'react';
import { Card, Input, Button, message, Space } from 'antd';
import { useGraphStore } from '../store/graphStore';
import { useGraphClassification } from '../hooks/useGraphClassification';
import { ModelPrediction } from './ModelPrediction';

const { TextArea } = Input;

export const GraphInput = () => {
  const [inputValue, setInputValue] = useState('');
  const setEdges = useGraphStore(state => state.setEdges);
  const { classification, loading, classifyGraph } = useGraphClassification();

  const handleSubmit = () => {
    try {
      const lines = inputValue.trim().split('\n').filter(line => line.trim());
      const edges = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 2) {
          throw new Error(`Invalid line: ${line}`);
        }
        return [parts[0], parts[1], parts[2] || null];
      });
      setEdges(edges);
      message.success('Graph loaded successfully!');
    } catch (error) {
      message.error('Invalid input format. Each line should be: u v [w]');
    }
  };

  const handleClassify = async () => {
    try {
      const lines = inputValue.trim().split('\n').filter(line => line.trim());
      const edges = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 2) {
          throw new Error(`Invalid line: ${line}`);
        }
        return [parts[0], parts[1], parts[2] || null];
      });
      setEdges(edges);
      await classifyGraph(edges);
      message.success('Graph loaded and classified!');
    } catch (error) {
      message.error('Invalid input format. Each line should be: u v [w]');
    }
  };

  return (
    <Card title="Graph Input" style={{ marginBottom: 16 }}>
      <TextArea
        rows={4}
        placeholder='Enter edges '
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <Space>
        <Button type="primary" onClick={handleSubmit}>
          Load Graph
        </Button>
        <Button onClick={handleClassify} loading={loading}>
          Classify Graph
        </Button>
      </Space>
      <ModelPrediction classification={classification} loading={loading} />
    </Card>
  );
};