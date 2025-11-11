import torch

# Your model's file path
file_path = 'graph_classifier_model.pth'

# Load the file. 
# map_location='cpu' ensures it loads even without a GPU.
state_dict = torch.load(file_path, map_location=torch.device('cpu'))

print("✅ Model data loaded successfully!")
print(f"Type of data: {type(state_dict)}")
print("---" * 20)

# A state_dict is a dictionary. We can print its keys.
print("\n🔑 1. All LAYER NAMES (Keys) in the file:\n")
for key in state_dict.keys():
    print(f"  - {key}")

print("---" * 20)

# Let's get the data for one specific layer.
# Based on your project, you have a layer named 'lin.weight'
layer_name = 'lin.weight'

if layer_name in state_dict:
    print(f"\n🔬 2. Data for one layer ('{layer_name}'):\n")
    layer_data = state_dict[layer_name]

    print(layer_data)

    print(f"\nShape of this data: {layer_data.shape}")
else:
    print(f"Layer '{layer_name}' not found in this file.")