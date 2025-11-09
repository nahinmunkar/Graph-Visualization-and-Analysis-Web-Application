import React from 'react';
import { Card, Select, Button, Space } from 'antd';
import { useGraphStore } from '../store/graphStore';
import { useTraversal } from '../hooks/useTraversal';

export const AlgorithmControls = () => {
  const { 
    algorithm, 
    setAlgorithm, 
    rootNode, 
    traversalState, 
    resetTraversal 
  } = useGraphStore();
  const { startTraversal, stepTraversal, startAutoPlay, stopAutoPlay } = useTraversal();

  const canStart = rootNode && !traversalState.isRunning;
  const canStep = traversalState.isRunning && !traversalState.isComplete && !traversalState.isAutoPlaying;
  const canAutoPlay = rootNode && !traversalState.isRunning;

  return (
    <Card title="Algorithm Controls" style={{ marginBottom: 16 }}>
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
        <Space>
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