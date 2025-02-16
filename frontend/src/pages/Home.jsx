import React, { useState } from "react";
import FileInput from "../components/FileInput";
import Button from "../components/Button";
import axios from "axios";
import { API_URL } from "../services/api";
import "./Home.css"; // Import the CSS for styling

function Home() {
  // State for file, prediction result, and loading
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(null); // Store the prediction object
  const [loading, setLoading] = useState(false);

  // Disease information including symptoms
  const diseaseInfo = {
    Glioma: {
      description:
        "A brain tumor originating from glial cells, which support neurons in the brain.",
      symptoms: ["Headaches", "Nausea", "Seizures", "Cognitive impairment"],
    },
    Meningioma: {
      description:
        "A brain tumor arising from the meninges, the membranes covering the brain and spinal cord.",
      symptoms: [
        "Vision problems",
        "Hearing loss",
        "Memory issues",
        "Seizures",
      ],
    },
    Normal: {
      description: "No tumor detected.",
      symptoms: ["No symptoms"],
    },
    Pituitary: {
      description:
        "A tumor growing within the pituitary gland, often referred to as a 'pituitary adenoma'.",
      symptoms: [
        "Vision changes",
        "Fatigue",
        "Hormonal imbalances",
        "Headaches",
      ],
    },
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle form submission and send the image to the backend for prediction
  const handleSubmit = async () => {
    if (!selectedFile) return; // Ensure a file is selected before submitting

    const formData = new FormData();
    formData.append("file", selectedFile);

    setLoading(true); // Start loading

    try {
      const response = await axios.post(`${API_URL}/predict`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Ensure the response data is valid before using it
      if (response.data && response.data.predicted_class) {
        console.log("Prediction Response:", response.data);
        setPrediction({
          class_name: response.data.predicted_class,
          error: null,
        }); // Update the state with the prediction result
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Error during prediction:", error);
      setPrediction({
        error: "Error occurred while processing the image",
        class_name: null,
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="home">
      <h1>Brain Tumor Detection</h1>

      <div className="result-container">
        {/* Left Side: Image Input and Submit Button */}
        <div>
          <div className="file-input-container">
            <FileInput onChange={handleFileChange} />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            text={loading ? "Processing..." : "Submit"}
          />
        </div>

        {/* Right Side: Prediction and Disease Information */}
        <div>
          {/* Prediction Result */}
          <div className="prediction-container">
            {prediction ? (
              prediction.class_name ? (
                <h2>Prediction: {prediction.class_name}</h2>
              ) : prediction.error ? (
                <h2 className="error-message">{prediction.error}</h2>
              ) : (
                <h2 className="no-prediction">No prediction available.</h2>
              )
            ) : (
              <p className="loading-message">No prediction data yet.</p>
            )}
          </div>

          {/* Disease Information */}
          <div className="disease-info-container">
            {prediction && prediction.class_name ? (
              <>
                <h3>Disease Information</h3>
                {prediction.class_name === "Glioma" && (
                  <>
                    <p>
                      <strong>Glioma:</strong> A brain tumor originating from
                      glial cells, which support neurons in the brain.
                    </p>
                    <ul>
                      <li>
                        Symptoms: Headaches, seizures, nausea, memory loss.
                      </li>
                      <li>Common in adults aged 45-65.</li>
                      <li>
                        Consult a neurologist or oncologist for personalized
                        treatment options such as surgery, radiation, or
                        chemotherapy.
                      </li>
                    </ul>
                  </>
                )}
                {prediction.class_name === "Meningioma" && (
                  <>
                    <p>
                      <strong>Meningioma:</strong> A brain tumor arising from
                      the meninges, the membranes covering the brain and spinal
                      cord.
                    </p>
                    <ul>
                      <li>Symptoms: Vision problems, memory loss, seizures.</li>
                      <li>Often benign and slow-growing.</li>
                      <li>
                        Maintain regular follow-up appointments with your
                        healthcare provider to monitor the growth and ensure
                        timely intervention if necessary.
                      </li>
                    </ul>
                  </>
                )}
                {prediction.class_name === "Pituitary" && (
                  <>
                    <p>
                      <strong>Pituitary Adenoma:</strong> A tumor growing within
                      the pituitary gland.
                    </p>
                    <ul>
                      <li>
                        Symptoms: Hormonal imbalances, fatigue, vision changes.
                      </li>
                      <li>Usually benign and treatable.</li>
                      <li>
                        Consider regular monitoring and medical check-ups with
                        an endocrinologist to manage hormonal imbalances and
                        prevent further complications.
                      </li>
                    </ul>
                  </>
                )}
                {prediction.class_name === "Normal" && (
                  <>
                    <p>
                      <strong>Normal:</strong> No tumor detected. The brain
                      appears healthy, and no abnormalities are found.
                    </p>
                    <ul>
                      <li>
                        Maintain a balanced diet and exercise regularly for
                        brain health.
                      </li>
                      <li>Stay hydrated and prioritize mental well-being.</li>
                      <li>
                        Continue maintaining a healthy lifestyle with a balanced
                        diet, regular exercise, and mental well-being to support
                        overall brain health.
                      </li>
                    </ul>
                  </>
                )}
              </>
            ) : (
              <p>No detailed information available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
