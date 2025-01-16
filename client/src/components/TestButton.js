import React from 'react';

function TestButton() {
  const handleClick = () => {
    console.log("Button was clicked!");
    alert("Button was clicked!");
  };

  return (
    <button onClick={handleClick}>
      Click Me
    </button>
  );
}

export default TestButton;