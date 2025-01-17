import React from 'react';

function ScenarioPage() {
    const handleButtonClick = () => {
        alert("Audio Response is being Recorded!");
    };
    
    return (
        <div>
            <h1>
                Welcome to the Scenario Page
            </h1>
            <br></br>
            <p>
                Please click the below button to record your audio response:
            </p>
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

export default ScenarioPage;