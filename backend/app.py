from flask import Flask, request, jsonify
import os
import torch
from torchvision import models, transforms
from PIL import Image
from flask_cors import CORS
import requests


app = Flask(__name__)

# Enable CORS for all domains
CORS(app)


# Device configuration (use GPU if available)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Model file path
MODEL_PATH = "brain_tumor_model.pth"

# Download model if not present
MODEL_URL = "https://github.com/karthikrayaprolu/Brain-Tumor-Detection/blob/main/backend/brain_tumor_model.pth"

if not os.path.exists(MODEL_PATH):
    print("Downloading model...")
    response = requests.get(MODEL_URL)
    with open(MODEL_PATH, "wb") as f:
        f.write(response.content)
    print("Model downloaded successfully.")

# Load model
model = models.resnet18(pretrained=False)
model.fc = torch.nn.Linear(model.fc.in_features, 4)  # Modify for 4 classes
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model = model.to(device)
model.eval()

# Define class name mapping
class_name_map = {
    'glioma': 'Glioma',
    'meningioma': 'Meningioma',
    'notumor': 'Normal',
    'pituitary': 'Pituitary'
}

# Function to predict image class
def predict_image(image_path, model, class_name_map, image_size=224, device=None):
    device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    model.eval()

    transform = transforms.Compose([
        transforms.Grayscale(num_output_channels=3),
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ])

    image = Image.open(image_path)
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(image)
        _, predicted = torch.max(output, 1)

    predicted_class = predicted.item()
    predicted_class_name = list(class_name_map.keys())[predicted_class]
    
    return class_name_map.get(predicted_class_name, predicted_class_name)

# Flask route to handle image prediction
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

    # Predict the class
    result = predict_image(image_path, model, class_name_map, device=device)

    return jsonify({'predicted_class': result})

# Start the server on the correct port for Render
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # Use Render's assigned port
    app.run(host='0.0.0.0', port=port, debug=True)
