import matplotlib.pyplot as plt
import networkx as nx
import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io
import base64
import json
import os
from simple_classifier import load_classifier, classify_graph

app = Flask(__name__)
CORS(app)

# Load ML model on startup
MODEL_PATH = 'graph_classifier_model.pth'
if os.path.exists(MODEL_PATH):
    if load_classifier(MODEL_PATH):
        print(f"Graph classifier loaded successfully from {MODEL_PATH}")
    else:
        print(f"Failed to load model from {MODEL_PATH}")
else:
    print(f"Model file not found at {MODEL_PATH}")

def create_modern_graph(edges, visited_nodes=None, current_node=None, current_edge=None):
    """Create a modern, beautiful graph visualization"""
    
    # Create graph
    G = nx.Graph()
    
    # Add edges
    for edge in edges:
        if len(edge) >= 2:
            G.add_edge(edge[0], edge[1])
    
    if len(G.nodes()) == 0:
        return None
    
    # Set up the plot with modern styling
    plt.style.use('default')
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))
    fig.patch.set_facecolor('#f8fafc')
    ax.set_facecolor('#ffffff')
    
    # Use spring layout for better node positioning
    pos = nx.spring_layout(G, k=3, iterations=50, seed=42)
    
    # Draw edges with modern styling
    edge_colors = []
    edge_widths = []
    
    for edge in G.edges():
        edge_id = f"{edge[0]}-{edge[1]}"
        if current_edge and (edge_id == current_edge or f"{edge[1]}-{edge[0]}" == current_edge):
            edge_colors.append('#ef4444')
            edge_widths.append(4)
        else:
            edge_colors.append('#e2e8f0')
            edge_widths.append(2)
    
    nx.draw_networkx_edges(G, pos, 
                          edge_color=edge_colors,
                          width=edge_widths,
                          alpha=0.8,
                          style='-')
    
    # Draw nodes with modern colors and styling
    node_colors = []
    node_sizes = []
    
    for node in G.nodes():
        if visited_nodes and node in visited_nodes:
            node_colors.append('#10b981')  # Green for visited
            node_sizes.append(1200)
        elif current_node and node == current_node:
            node_colors.append('#3b82f6')  # Blue for current
            node_sizes.append(1400)
        else:
            node_colors.append('#ffffff')  # White for unvisited
            node_sizes.append(1000)
    
    # Draw nodes
    nx.draw_networkx_nodes(G, pos,
                          node_color=node_colors,
                          node_size=node_sizes,
                          edgecolors='#64748b',
                          linewidths=3,
                          alpha=0.95)
    
    # Draw labels with modern typography
    nx.draw_networkx_labels(G, pos,
                           font_size=16,
                           font_weight='bold',
                           font_family='Arial',
                           font_color='#1e293b')
    
    # Remove axes and add subtle border
    ax.set_xlim(-1.2, 1.2)
    ax.set_ylim(-1.2, 1.2)
    ax.axis('off')
    
    # Add subtle border
    for spine in ax.spines.values():
        spine.set_visible(False)
    
    plt.tight_layout()
    
    # Convert to base64 string
    img_buffer = io.BytesIO()
    plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight', 
                facecolor='#f8fafc', edgecolor='none')
    img_buffer.seek(0)
    img_string = base64.b64encode(img_buffer.read()).decode()
    plt.close()
    
    return img_string

@app.route('/generate_graph', methods=['POST'])
def generate_graph():
    try:
        data = request.json
        edges = data.get('edges', [])
        visited_nodes = set(data.get('visited_nodes', []))
        current_node = data.get('current_node')
        current_edge = data.get('current_edge')
        
        img_string = create_modern_graph(edges, visited_nodes, current_node, current_edge)
        
        if img_string:
            return jsonify({
                'success': True,
                'image': f"data:image/png;base64,{img_string}"
            })
        else:
            return jsonify({'success': False, 'error': 'No graph data provided'})
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/classify', methods=['POST'])
def classify_graph_endpoint():
    try:
        data = request.json
        edges = data.get('edges', [])
        
        result = classify_graph(edges)
        
        return jsonify({
            'success': True,
            'classification': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False, 
            'error': str(e)
        })

@app.route('/shortest_path', methods=['POST'])
def shortest_path():
    """Calculate shortest path between two nodes"""
    try:
        data = request.json
        edges = data.get('edges', [])
        start_node = data.get('start')
        end_node = data.get('end')
        
        if not edges or not start_node or not end_node:
            return jsonify({'error': 'Missing edges, start node, or end node'}), 400
        
        # Create graph
        G = nx.Graph()
        for edge in edges:
            if len(edge) >= 2:
                source = str(edge[0])
                target = str(edge[1])
                G.add_edge(source, target)
        
        # Check if nodes exist
        start_str = str(start_node)
        end_str = str(end_node)
        
        if start_str not in G.nodes() or end_str not in G.nodes():
            return jsonify({'error': 'Start or end node not found in graph'}), 400
        
        # Calculate shortest path
        try:
            path = nx.shortest_path(G, source=start_str, target=end_str)
            length = nx.shortest_path_length(G, source=start_str, target=end_str)
            
            # Get path edges
            path_edges = []
            for i in range(len(path) - 1):
                path_edges.append([path[i], path[i + 1]])
            
            return jsonify({
                'path': path,
                'length': length,
                'edges': path_edges,
                'exists': True
            })
        except nx.NetworkXNoPath:
            return jsonify({
                'path': [],
                'length': -1,
                'edges': [],
                'exists': False,
                'error': f'No path exists between {start_node} and {end_node}'
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)