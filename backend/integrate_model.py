import os
import subprocess
import sys

def run_command(cmd):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"SUCCESS: {cmd}")
            return True
        else:
            print(f"FAILED: {cmd}")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"FAILED: {cmd} - Exception: {e}")
        return False

def integrate_model():
    print("Integrating Graph Classifier Model")
    print("=" * 50)
    
    # Check if model file exists
    if not os.path.exists('graph_classifier_model.pth'):
        print("ERROR: graph_classifier_model.pth not found!")
        return False
    
    print("Model file found: graph_classifier_model.pth")
    
    # Install dependencies
    print("\nInstalling Python dependencies...")
    if not run_command("pip install -r requirements.txt"):
        return False
    
    # Analyze model structure
    print("\nAnalyzing model structure...")
    if not run_command("python test_model.py"):
        print("WARNING: Model analysis failed, but continuing...")
    
    # Convert model
    print("\nConverting PyTorch model to TensorFlow...")
    if not run_command("python convert_model.py"):
        return False
    
    # Check if conversion was successful
    if os.path.exists('model.h5'):
        print("Model converted successfully to model.h5")
    else:
        print("Model conversion failed")
        return False
    
    print("\nIntegration complete!")
    print("\nNext steps:")
    print("1. Start backend: python graph_generator.py")
    print("2. Start frontend: npm start")
    print("3. Use 'Classify Graph' button in the UI")
    
    return True

if __name__ == "__main__":
    success = integrate_model()
    if not success:
        print("\nIntegration failed. Please check the errors above.")
        sys.exit(1)