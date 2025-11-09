import React from 'react';
import { Layout, Row, Col, Typography } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphInput } from './components/GraphInput';
import { RootSelector } from './components/RootSelector';
import { AlgorithmControls } from './components/AlgorithmControls';
import { GraphVisualizer } from './components/GraphVisualizer';

const { Header, Content } = Layout;
const { Title } = Typography;

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <Title level={2} style={{ margin: '16px 0' }}>
            Graph Visualizer & ML Classifier
          </Title>
        </Header>
        <Content style={{ padding: '24px' }}>
          <Row gutter={24}>
            <Col span={8}>
              <GraphInput />
              <RootSelector />
              <AlgorithmControls />
            </Col>
            <Col span={16}>
              <GraphVisualizer />
            </Col>
          </Row>
        </Content>
      </Layout>
    </QueryClientProvider>
  );
}

export default App;