Visit for deepwiki documentation:

 [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/nahinmunkar/Graph-Visualization-and-Analysis-Web-Application)



# Graph Visualization & Analysis Web Application

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A full-stack web application that provides a powerful, interactive platform for visualizing graph structures, executing classic graph algorithms step-by-step, and classifying graph topology using a machine learning model.

![Graph Visualization App Screenshot](https://github.com/user-attachments/assets/34ed4c3c-58b3-48e1-8526-03b0e5694dc3)

---

## 🛠️ Core Features

* **Interactive Visualization:** Dynamically render graphs from a simple edge list. Users can pan, zoom, and drag nodes for a clear view.
* **Algorithm Analysis (Step-by-Step):**
    * **DFS (Depth-First Search):** Watch the traversal unfold node by node.
    * **BFS (Breadth-First Search):** See how the algorithm explores the graph level by level.
    * **Auto-Play & Step Controls:** Run algorithms at full speed or advance them one step at a time for educational insight.
* **Shortest Path:** Select any two nodes and instantly find and highlight the shortest path between them, calculated by the backend.
* **ML-Powered Classification:** A backend endpoint analyzes the graph's topology (nodes, edges, density) and uses a machine learning model to classify it as a **Tree**, **Cycle**, or **DAG** (Directed Acyclic Graph).

## 🚀 Tech Stack

The project uses a decoupled, full-stack architecture, separating the client-side rendering from the backend computation.

| Area | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | [React](https://reactjs.org/) | Core UI library for building components. |
| | [ReactFlow](https://reactflow.dev/) | A powerful library for rendering and interacting with node-based graphs. |
| | [Zustand](https://github.com/pmndrs/zustand) | Lightweight, hook-based state management for shared state (e.g., `graphStore.js`). |
| | [Ant Design](https://ant.design/) | UI component library for buttons, inputs, and layout. |
| **Backend** | [Python](https://www.python.org/) | Primary backend language. |
| | [Flask](https://flask.palletsprojects.com/) | Lightweight micro-framework for creating the REST API. |
| | [NetworkX](https://networkx.org/) | The core library for graph creation, analysis (shortest path), and feature extraction. |
| | [TensorFlow/Keras](https://www.tensorflow.org/) | Serves the trained `.h5` model for the graph classification endpoint. |

## 🏗️ How It Works

### 1. Visualization & State Management

The frontend uses **ReactFlow** to render the graph. All shared application state (nodes, edges, algorithm status) is managed in a central **Zustand** store (`frontend/src/store/graphStore.js`).

When a user runs an algorithm, components don't re-fetch data. Instead, the logic hooks (e.g., `useTraversal.js`) update the central store, and the `GraphVisualizer.jsx` component re-renders reactively, applying new styles to nodes and edges based on their state (e.g., `visited`, `current`, `path`).

### 2. Algorithm Execution

This app uses a hybrid approach for algorithms:

* **Client-Side (Traversal):** DFS and BFS are implemented as state machines in the `frontend/src/hooks/useTraversal.js` hook. This allows for complex UI-driven controls like "Next Step" and "Auto-Play" without any network latency.
* **Server-Side (Shortest Path):** The shortest path calculation is offloaded to the Flask backend. A `POST` request is sent to `/shortest_path`, where **NetworkX** (`nx.shortest_path`) efficiently computes the result and returns it to the client for highlighting.

### 3. ML Graph Classification

This is one of the most powerful features of the backend.

1.  **Request:** The client sends the edge list to the `POST /classify` endpoint.
2.  **Fallback (Rule-Based):** The `backend/simple_classifier.py` first attempts to classify the graph using deterministic **NetworkX** functions (e.g., `nx.is_tree`, `nx.simple_cycles`). This is fast and accurate for simple cases.
3.  **ML Inference (Advanced):** For more complex graphs, the `backend/model_utils.py` module extracts a 64-dimension feature vector (density, clustering, degree stats, etc.). This vector is fed into a pre-trained TensorFlow/Keras model (`model.h5`) which predicts the graph's topology.
4.  **Model Interoperability:** The original model was a PyTorch `.pth` file. A custom script, `backend/convert_model.py`, was used to read the PyTorch `state_dict`, create an equivalent Keras model, and port the weights. This demonstrates a key MLOps skill: decoupling the training framework (PyTorch) from the serving framework (TensorFlow).

## 🏁 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18.x or higher)
* [Python](https://www.python.org/downloads/) (v3.9 or higher) & `pip`

### 1. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend

# Install all required Python packages
# (Use requirements-light.txt if you don't need TensorFlow/ML features)
pip install -r requirements.txt

# Run the Flask server
# It will start on http://localhost:5000
python graph_generator.py
```

### 2. Frontend Setup
In a new terminal, navigate to the `frontend` directory:

```bash
cd frontend

# Install all Node.js dependencies
npm install

# Run the React development server
# It will start on http://localhost:3000
npm start
```

Your browser will automatically open to `http://localhost:3000`, and the app will be connected to the backend.



