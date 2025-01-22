// pages/audiotest.js
import React, { useState } from 'react';

function AudioTest() {

    const [counter, setCounter] = useState(0);

    const handleButtonClick = () => {
      // Example: increment a counter in state
      setCounter(prev => prev + 1);

      // Or show an alert
      alert("Scenario Button Clicked!");
    };

    return (
        <div>
            <h1>
                Welcome to the Audio Test Page
            </h1>
            <br></br>
            <p>
                Please click the below button to record your audio response:
            </p>
            <br></br>
            <p>Counter: {counter}</p>
            <br></br>
            <button onClick={handleButtonClick}
                style={{
                    padding: "10px 20px",
                    border: "2px solid black",
                    borderRadius: "5px",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontSize: "16px",
              }}>
                Answer Prompt</button>
        </div>


    );
}

export default AudioTest;
