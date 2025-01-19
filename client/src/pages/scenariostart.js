import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';

export default function NewPage() {
  const router = useRouter();
  const [isPopupVisible, setIsPopupVisible] = useState(false); // State to track popup visibility
  const popupRef = useRef(null); // Reference to the popup for detecting outside clicks


  // Handle clicking outside of the popup
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupVisible(false); // Hide popup if clicking outside
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      {/* Header Section */}
      <div
        style={{
          backgroundColor: '#E8F8FF',
          display: 'flex',
          alignItems: 'center',
          padding: '20px',
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            margin: 0,
          }}
        >
          Clinical Clarity
        </h1>
        {/* Logo */}
        <img
          src="/ClinicalClarityLogo.png"
          alt="Clinical Clarity Logo"
          style={{ height: '70px', marginRight: '5px' }}
        />
      </div>

      {/* Main Content Section */}
      <div
        style={{
          backgroundColor: '#E8F8FF',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '87vh',
          textAlign: 'center',
          flexDirection: 'column',
          position: 'relative', // Needed for popup positioning
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px', // Space between text and button
          }}
        >
          <h1>Welcome to the start of a Patient Scenario Page!</h1>
          {/* Settings Button */}
          <button
            onClick={() => setIsPopupVisible(!isPopupVisible)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <img
              src="/SettingsWheel.png" // Path to the settings wheel in the public folder
              alt="Settings"
              style={{ height: '160px'}} // Adjust size of the settings icon
            />
          </button>
        </div>

        {/* Popup */}
        {isPopupVisible && (
          <div
            ref={popupRef} // Attach the popup to the ref
            style={{
              position: 'fixed', // Fixed position to center it on the screen
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)', // Center the popup
              backgroundColor: 'white',
              border: '2px solid black',
              borderRadius: '10px',
              width: '400px', // Adjust width
              height: '300px', // Adjust height
              padding: '20px',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
              zIndex: 1000, // Ensure it appears on top of other elements
            }}
          >
            <p style={{ margin: 0, textAlign: 'center', fontSize: '18px' }}>Settings Menu</p>
          </div>
        )}
<br/>
<div
  style={{
    display: 'flex', // Align buttons in a row
    justifyContent: 'center', // Center the buttons horizontally
    alignItems: 'center', // Align buttons vertically
    gap: '20px', // Add spacing between the buttons
    marginTop: '20px', // Add spacing above the button row
  }}
>
  {/* Back to Home Button */}
  <button
    onClick={() => router.push('/')} // Redirect to home page
    style={{
      border: '2px solid black',
      padding: '10px',
      borderRadius: '15px',
      fontSize: '16px',
      width: '180px',
      height: '80px',
      cursor: 'pointer',
      backgroundColor: '#0070f3',
      color: 'white',
    }}
  >
    Back to Home
  </button>

  {/* Start Button */}
  <button
    onClick={() => alert('Start button clicked!')} // Replace with desired functionality
    style={{
      border: '2px solid black',
      padding: '10px',
      borderRadius: '15px',
      fontSize: '16px',
      width: '180px',
      height: '80px',
      cursor: 'pointer',
      backgroundColor: '#0070f3',
      color: 'white',
    }}
  >
    Start
  </button>
</div>
      </div>
    </div>
  );
}
