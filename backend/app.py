from flask import Flask, request, jsonify
import torch
from torchvision import models, transforms
from PIL import Image
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for all domains (this allows requests from any domain)
CORS(app)

# Device configuration (use GPU if available)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Initialize the model (use the same architecture as during training)
model = models.resnet18(pretrained=False)  # Use pre-trained False, as we're loading custom weights
model.fc = torch.nn.Linear(model.fc.in_features, 4)  # Modify the final layer for 4 classes

# Load the model's state dictionary
model.load_state_dict(torch.load('brain_tumor_model.pth', map_location=device))  # Make sure to use the correct path
model = model.to(device)
model.eval()  # Set the model to evaluation mode

# Define class name mapping
class_name_map = {
    'glioma': 'Glioma',
    'mininglioma': 'Meningioma',
    'notumor': 'Normal',
    'pituitary': 'Pituitary'
}

# Define the predict_image function here
def predict_image(image_path, model, class_name_map, image_size=224, device=None):
    # If device is not provided, try to use GPU (cuda) if available, else use CPU
    device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
    
    # Move model to the appropriate device
    model = model.to(device)
    model.eval()
    
    # Preprocess the image
    transform = transforms.Compose([
        transforms.Grayscale(num_output_channels=3),  # Convert grayscale to RGB
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ])
    
    image = Image.open(image_path)
    image = transform(image).unsqueeze(0).to(device)  # Move the image to the same device as model
    
    # Forward pass
    with torch.no_grad():
        output = model(image)
        _, predicted = torch.max(output, 1)
    
    predicted_class = predicted.item()
    # Map the predicted class index to the user-friendly name
    predicted_class_name = list(class_name_map.keys())[predicted_class]  # Get the class name by index
    return class_name_map.get(predicted_class_name, predicted_class_name)  # Fallback to original if not found in map


@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the image temporarily
    image_path = 'temp_image.jpg'
    file.save(image_path)

    # Predict the class using the updated function
    result = predict_image(image_path, model, class_name_map, device=device)

    return jsonify({'predicted_class': result})

if __name__ == '__main__':
    app.run(debug=True)
