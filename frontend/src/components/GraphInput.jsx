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

  const parseEdges = () => {
    try {
      const lines = inputValue.trim().split('\n').filter(line => line.trim());
      const edges = lines.map(line => {
        const parts = line.trim().split(/\s+/); // স্পেস বা ট্যাব দিয়ে ভাগ করা
        if (parts.length < 2) {
          throw new Error(`Invalid line: ${line}`);
        }
        return [parts[0], parts[1], parts[2] || null]; // u, v, weight (optional)
      });
      return edges;
    } catch (error) {
      message.error(error.message || 'Invalid input format. Each line should be: u v [w]');
      return null;
    }
  };

  const handleSubmit = () => {
    const edges = parseEdges();
    if (edges) {
      setEdges(edges);
      message.success('Graph loaded successfully!');
    }
  };

  const handleClassify = async () => {
    const edges = parseEdges();
    if (edges) {
      setEdges(edges); // গ্রাফ লোড করুন
      await classifyGraph(edges); // এবং ক্লাসিফাই করুন
      message.success('Graph loaded and classified!');
    }
  };

  return (
    <Card title="Graph Input" style={{ marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <TextArea
        rows={6}
        placeholder={`Enter edges (one per line):\nA B\nB C\nC D`}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{ marginBottom: 12, fontFamily: 'monospace' }}
      />
      <Space wrap>
        <Button type="primary" onClick={handleSubmit}>
          Load Graph
        </Button>
        <Button onClick={handleClassify} loading={loading} type="primary" ghost>
          Classify Graph
        </Button>
      </Space>
      <ModelPrediction classification={classification} loading={loading} />
    </Card>
  );
};