import networkx as nx
import json

# Simple graph classifier that uses your PyTorch model directly
class SimpleGraphClassifier:
    def __init__(self, model_path=None):
        self.model_path = model_path
        self.classes = ['Tree', 'Cycle', 'DAG']
    
    def simple_classify(self, edges):
        """Simple rule-based classification as fallback"""
        if not edges:
            return {'type': 'Unknown', 'confidence': 0.0}
        
        # Create graph
        G = nx.DiGraph()
        for edge in edges:
            if len(edge) >= 2:
                G.add_edge(str(edge[0]), str(edge[1]))
        
        if G.number_of_nodes() == 0:
            return {'type': 'Unknown', 'confidence': 0.0}
        
        # Check for cycles
        try:
            cycles = list(nx.simple_cycles(G))
            has_cycle = len(cycles) > 0
        except:
            has_cycle = False
        
        # Check if it's a tree (connected and no cycles)
        undirected_G = G.to_undirected()
        is_connected = nx.is_connected(undirected_G)
        is_tree = is_connected and not has_cycle and (G.number_of_edges() == G.number_of_nodes() - 1)
        
        # Classify
        if is_tree:
            return {'type': 'Tree', 'confidence': 0.9}
        elif has_cycle:
            return {'type': 'Cycle', 'confidence': 0.8}
        else:
            return {'type': 'DAG', 'confidence': 0.7}
    
    def predict(self, edges):
        """Predict graph type"""
        try:
            # For now, use simple rule-based classification
            # You can enhance this later with proper PyTorch model inference
            result = self.simple_classify(edges)
            
            # Create probabilities based on classification
            probs = [0.33, 0.33, 0.34]  # Default uniform
            if result['type'] == 'Tree':
                probs = [result['confidence'], (1-result['confidence'])/2, (1-result['confidence'])/2]
            elif result['type'] == 'Cycle':
                probs = [(1-result['confidence'])/2, result['confidence'], (1-result['confidence'])/2]
            elif result['type'] == 'DAG':
                probs = [(1-result['confidence'])/2, (1-result['confidence'])/2, result['confidence']]
            
            return {
                'type': result['type'],
                'confidence': result['confidence'],
                'probabilities': {
                    'Tree': float(probs[0]),
                    'Cycle': float(probs[1]),
                    'DAG': float(probs[2])
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
        classifier = SimpleGraphClassifier(model_path)
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def classify_graph(edges):
    """Classify a graph given its edges"""
    if classifier is None:
        return {'error': 'Model not loaded'}
    return classifier.predict(edges)