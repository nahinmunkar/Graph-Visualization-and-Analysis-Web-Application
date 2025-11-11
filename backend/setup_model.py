"""
Setup script to convert your .pth model to TensorFlow format
Run this script after placing your model file in the project directory
"""

import os
import sys

def setup_model():
    print("Graph Classification Model Setup")
    print("=" * 40)
    
    # Check for model files
    model_files = [f for f in os.listdir('.') if f.endswith(('.pth', '.h5', '.pb'))]
    
    if not model_files:
        print("❌ No model files found!")
        print("\nPlease place your model file in the project directory:")
        print("- For PyTorch: model.pth")
        print("- For TensorFlow: model.h5")
        return
    
    print(f"✅ Found model files: {model_files}")
    
    # Check if it's a PyTorch model that needs conversion
    pth_files = [f for f in model_files if f.endswith('.pth')]
    if pth_files:
        print("\n⚠️  PyTorch model detected!")
        print("You'll need to convert it to TensorFlow format.")
        print("\nConversion steps:")
        print("1. Load your PyTorch model")
        print("2. Export to ONNX format")
        print("3. Convert ONNX to TensorFlow")
        print("\nExample conversion code:")
        print("""
import torch
import tensorflow as tf
from your_model import YourModel  # Import your model class

# Load PyTorch model
model = YourModel()
model.load_state_dict(torch.load('model.pth'))
model.eval()

# Convert to TensorFlow (you'll need to implement this based on your model)
# This is a simplified example - actual conversion depends on your model architecture
""")
    
    # Check TensorFlow model
    h5_files = [f for f in model_files if f.endswith('.h5')]
    if h5_files:
        print(f"\n✅ TensorFlow model found: {h5_files[0]}")
        
        # Update the model path in graph_generator.py
        with open('graph_generator.py', 'r') as f:
            content = f.read()
        
        updated_content = content.replace("MODEL_PATH = 'model.h5'", f"MODEL_PATH = '{h5_files[0]}'")
        
        with open('graph_generator.py', 'w') as f:
            f.write(updated_content)
        
        print(f"✅ Updated model path to: {h5_files[0]}")
    
    print("\n🚀 Setup complete!")
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Start backend: python graph_generator.py")
    print("3. Start frontend: npm start")

if __name__ == "__main__":
    setup_model()