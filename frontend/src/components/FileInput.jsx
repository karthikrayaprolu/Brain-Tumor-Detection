// frontend/src/components/FileInput.jsx
import React, { useState } from 'react';
import './FileInput.css';

function FileInput({ onChange }) {
  const [imagePreview, setImagePreview] = useState(null); // State to store image preview URL

  // Handle file change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set image preview URL
        onChange(event); // Call the passed onChange function (if needed)
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  return (
    <div className="file-input-container">
      <input type="file" onChange={handleFileChange} />
      {imagePreview && (
        <div className="image-preview-container">
          <img src={imagePreview} alt="Image Preview" className="image-preview" />
        </div>
      )}
    </div>
  );
}

export default FileInput;
