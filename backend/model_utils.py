import tensorflow as tf
import numpy as np
import networkx as nx
from sklearn.preprocessing import StandardScaler

class GraphClassifier:
    def __init__(self, model_path):
        self.model = tf.keras.models.load_model(model_path)
        self.scaler = StandardScaler()
        self.classes = ['Tree', 'Cycle', 'DAG']
    
    def extract_features(self, edges):
        """Extract 64-dimensional graph features for classification"""
        if not edges:
            return np.zeros(64)
        
        # Create NetworkX graph (undirected for simplicity)
        G = nx.Graph()
        for edge in edges:
            if len(edge) >= 2:
                G.add_edge(str(edge[0]), str(edge[1]))
        
        if G.number_of_nodes() == 0:
            return np.zeros(64)
        
        # Basic graph features
        features = []
        
        # Node and edge counts
        features.append(G.number_of_nodes())
        features.append(G.number_of_edges())
        features.append(nx.density(G))
        features.append(nx.average_clustering(G))
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
        
        # Check for cycles (convert to undirected for cycle detection)
        try:
            # Simple cycle detection
            has_cycle = len(list(nx.simple_cycles(nx.DiGraph(G.edges())))) > 0
            features.append(int(has_cycle))
        except:
            features.append(0)
        
        # Pad or truncate to 64 features
        features = features[:64]
        while len(features) < 64:
            features.append(0.0)
        
        return np.array(features, dtype=np.float32)
    
    def predict(self, edges):
        """Predict graph type"""
        try:
            features = self.extract_features(edges)
            features = features.reshape(1, -1)
            
            # Ensure features are 64-dimensional
            if features.shape[1] != 64:
                print(f"Warning: Expected 64 features, got {features.shape[1]}")
                # Pad or truncate
                if features.shape[1] < 64:
                    padding = np.zeros((1, 64 - features.shape[1]))
                    features = np.concatenate([features, padding], axis=1)
                else:
                    features = features[:, :64]
            
            # Make prediction
            prediction = self.model.predict(features, verbose=0)
            predicted_class = np.argmax(prediction[0])
            confidence = float(np.max(prediction[0]))
            
            return {
                'type': self.classes[predicted_class],
                'confidence': confidence,
                'probabilities': {
                    'Tree': float(prediction[0][0]),
                    'Cycle': float(prediction[0][1]), 
                    'DAG': float(prediction[0][2])
                }
            }
        except Exception as e:
            return {
                'type': 'Unknown',
                'confidence': 0.0,
                'error': str(e)
            }

# Global classifier instance
classifier = None

def load_classifier(model_path):
    """Load the classifier model"""
    global classifier
    try:
        classifier = GraphClassifier(model_path)
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def classify_graph(edges):
    """Classify a graph given its edges"""
    if classifier is None:
        return {'error': 'Model not loaded'}
    return classifier.predict(edges)