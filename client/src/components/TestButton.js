import React from 'react';

function TestButton() {
  const handleClick = () => {
    console.log("Button was clicked!");
    alert("Button was clicked!");
  };

function ScenarioPage() {
  const handleButtonClick = async () => {
    try {
      // Make a POST request to your Flask endpoint
      const response = await fetch('http://localhost:5000/do_something', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      alert(`Server says: ${data.message}`);
    } catch (error) {
      console.error('Error calling Flask:', error);
    }
  };



  return (
    <button onClick={handleClick}>
      Click Me
    </button>
  );
}

export default TestButton;