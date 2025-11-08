import React from 'react';
import { Card, Select, Button, Space } from 'antd';
import { useGraphStore } from '../store/graphStore';
import { useTraversal } from '../hooks/useTraversal';

export const AlgorithmControls = () => {
  const algorithm = useGraphStore(state => state.algorithm);
  const setAlgorithm = useGraphStore(state => state.setAlgorithm);
  const rootNode = useGraphStore(state => state.rootNode);
  const traversalState = useGraphStore(state => state.traversalState);
  const resetTraversal = useGraphStore(state => state.resetTraversal);
  const { startTraversal, stepTraversal, startAutoPlay, stopAutoPlay } = useTraversal();

  const canStart = rootNode && !traversalState.isRunning;
  const canStep = traversalState.isRunning && !traversalState.isComplete && !traversalState.isAutoPlaying;
  const canAutoPlay = rootNode && !traversalState.isRunning;

  return (
    <Card title="Algorithm Controls" style={{ marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Select
          style={{ width: '100%' }}
          value={algorithm}
          onChange={setAlgorithm}
          options={[
            { value: 'DFS', label: 'Depth-First Search (DFS)' },
            { value: 'BFS', label: 'Breadth-First Search (BFS)' }
          ]}
        />
        <Space wrap>
          <Button 
            type="primary" 
            onClick={startTraversal}
            disabled={!canStart}
          >
            Start
          </Button>
          <Button 
            onClick={stepTraversal}
            disabled={!canStep}
          >
            Next Step
          </Button>
          <Button 
            type="default"
            onClick={traversalState.isAutoPlaying ? stopAutoPlay : startAutoPlay}
            disabled={!canAutoPlay && !traversalState.isAutoPlaying}
            danger={traversalState.isAutoPlaying}
          >
            {traversalState.isAutoPlaying ? 'Stop Auto' : 'Auto Play'}
          </Button>
          <Button onClick={resetTraversal}>
            Reset
          </Button>
        </Space>
      </Space>
    </Card>
  );
};