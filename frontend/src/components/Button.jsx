// frontend/src/components/Button.jsx
import React from 'react';
import './Button.css'; 

function Button({ onClick, disabled, text }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
}

export default Button;
