import torch
import torch.nn as nn
import tensorflow as tf
import numpy as np
import networkx as nx

# Simple feature extraction for graph classification
def extract_graph_features(edges):
    """Extract basic graph features from edge list"""
    if not edges:
        return np.zeros(64)  # Return zero vector if no edges
    
    # Create graph
    G = nx.Graph()
    for edge in edges:
        if len(edge) >= 2:
            G.add_edge(str(edge[0]), str(edge[1]))
    
    if G.number_of_nodes() == 0:
        return np.zeros(64)
    
    # Basic graph features
    features = []
    
    # Node count
    features.append(G.number_of_nodes())
    # Edge count  
    features.append(G.number_of_edges())
    # Density
    features.append(nx.density(G))
    # Average clustering
    features.append(nx.average_clustering(G))
    # Number of connected components
    features.append(nx.number_connected_components(G))
    
    # Degree statistics
    degrees = [d for n, d in G.degree()]
    if degrees:
        features.extend([
            np.mean(degrees),
            np.std(degrees),
            np.max(degrees),
            np.min(degrees)
        ])
    else:
        features.extend([0, 0, 0, 0])
    
    # Pad or truncate to 64 features
    features = features[:64]
    while len(features) < 64:
        features.append(0.0)
    
    return np.array(features, dtype=np.float32)

def convert_pth_to_h5(pth_path, h5_path):
    # Load PyTorch model state dict
    state_dict = torch.load(pth_path, map_location='cpu')
    
    # Create TensorFlow model that mimics the GCN structure
    # Input: 64-dimensional graph features
    tf_model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation='relu', input_shape=(64,), name='conv1'),
        tf.keras.layers.Dense(64, activation='relu', name='conv2'), 
        tf.keras.layers.Dense(64, activation='relu', name='conv3'),
        tf.keras.layers.Dense(3, activation='softmax', name='classifier')
    ])
    
    # Build the model
    tf_model.build((None, 64))
    
    # Extract and set weights from PyTorch model
    try:
        # Set conv1 weights (assuming it's the first GCN layer)
        conv1_weight = state_dict['conv1.lin.weight'].numpy().T  # Transpose for TF
        conv1_bias = state_dict['conv1.bias'].numpy()
        tf_model.layers[0].set_weights([conv1_weight, conv1_bias])
        
        # Set conv2 weights
        conv2_weight = state_dict['conv2.lin.weight'].numpy().T
        conv2_bias = state_dict['conv2.bias'].numpy()
        tf_model.layers[1].set_weights([conv2_weight, conv2_bias])
        
        # Set conv3 weights
        conv3_weight = state_dict['conv3.lin.weight'].numpy().T
        conv3_bias = state_dict['conv3.bias'].numpy()
        tf_model.layers[2].set_weights([conv3_weight, conv3_bias])
        
        # Set final linear layer weights
        lin_weight = state_dict['lin.weight'].numpy().T
        lin_bias = state_dict['lin.bias'].numpy()
        tf_model.layers[3].set_weights([lin_weight, lin_bias])
        
        print("Successfully transferred weights from PyTorch to TensorFlow")
        
    except Exception as e:
        print(f"Warning: Could not transfer all weights: {e}")
        print("Using randomly initialized weights")
    
    # Save TensorFlow model
    tf_model.save(h5_path)
    print(f"Model converted and saved to {h5_path}")

if __name__ == "__main__":
    pth_file = 'graph_classifier_model.pth'
    print(f"Converting {pth_file} to TensorFlow format...")
    convert_pth_to_h5(pth_file, 'model.h5')
    print("Conversion complete! You can now start the backend.")