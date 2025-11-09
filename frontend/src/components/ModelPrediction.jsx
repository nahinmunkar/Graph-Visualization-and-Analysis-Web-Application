import React from 'react';
import { Card, Tag, Typography } from 'antd';

const { Text } = Typography;

export const ModelPrediction = ({ classification, loading }) => {
  if (!classification && !loading) return null;

  const getTypeColor = (type) => {
    switch (type) {
      case 'Tree': return 'green';
      case 'Cycle': return 'red';
      case 'DAG': return 'blue';
      default: return 'default';
    }
  };

  return (
    <Card title="ML Model Prediction" size="small" style={{ marginTop: 16 }}>
      {loading ? (
        <Text>Analyzing graph...</Text>
      ) : classification?.classification ? (
        <Tag color={getTypeColor(classification.classification.type)} size="large">
          {classification.classification.type}
        </Tag>
      ) : (
        <Text type="danger">Prediction failed</Text>
      )}
    </Card>
  );
};