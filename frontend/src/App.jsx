import React from 'react';
import { Layout, Row, Col, Typography } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphInput } from './components/GraphInput';
import { RootSelector } from './components/RootSelector';
import { AlgorithmControls } from './components/AlgorithmControls';
import { GraphVisualizer } from './components/GraphVisualizer';
import 'antd/dist/reset.css'; // antd স্টাইল ইম্পোর্ট

const { Header, Content } = Layout;
const { Title } = Typography;

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={2} style={{ margin: '16px 0', color: '#1890ff' }}>
            Graph Visualizer & ML Classifier
          </Title>
        </Header>
        <Content style={{ padding: '24px' }}>
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <GraphInput />
              <RootSelector />
              <AlgorithmControls />
            </Col>
            <Col xs={24} md={16}>
              <GraphVisualizer />
            </Col>
          </Row>
        </Content>
      </Layout>
    </QueryClientProvider>
  );
}

export default App;