import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';

export default function ScenarioStartPage() {
  // PROD
  const API_BASE_URL = 'https://clinical-clarity-backend.onrender.com';

  // LOCAL
  //const API_BASE_URL = 'http://localhost:8080';
  
  const router = useRouter();
  const [scenario, setScenario] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false); // State for popup visibility
  const popupRef = useRef(null); // Reference for popup clicks

  // Fetch scenario details
  useEffect(() => {
    const fetchScenario = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_prompt/1`); // Replace 1 with dynamic ID
        const data = await response.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        setScenario(data.scenario);
      } catch (error) {
        console.error('Error fetching scenario:', error);
      }
    };

    fetchScenario();
  }, []);

  // Handle clicking outside of popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!scenario) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Loading Scenario...</h1>
      </div>
    );
  }

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
          style={{ height: '70px', marginLeft: '10px' }}
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
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <h1>Welcome to the start of the scenario!</h1>
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
              src="/SettingsWheel.png"
              alt="Settings"
              style={{ height: '60px' }}
            />
          </button>
        </div>

        {/* Scenario Details */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h2>{scenario.title}</h2>
          <p><strong>Description:</strong> {scenario.description}</p>
          <p><strong>Door Sign:</strong> {scenario.door_sign}</p>
        </div>

        {/* Popup */}
        {isPopupVisible && (
          <div
            ref={popupRef}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              border: '2px solid black',
              borderRadius: '10px',
              width: '400px',
              height: '300px',
              padding: '20px',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
              zIndex: 1000,
            }}
          >
            <p style={{ margin: 0, textAlign: 'center', fontSize: '18px' }}>Settings Menu</p>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          {/* Back to Home Button */}
          <button
            onClick={() => router.push('/')}
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
            onClick={() => router.push('/scenario')}
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
            Start Scenario
          </button>
        </div>
      </div>
    </div>
  );
}
