import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';

export default function ScenarioStartPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  const router = useRouter();
  const { scenarioId } = router.query;  // Get scenarioId from URL
  const [scenario, setScenario] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    if (!scenarioId) return; // Prevent fetching before ID is available

    const fetchScenario = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_prompt/${scenarioId}`);
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
  }, [scenarioId, API_BASE_URL]); // Runs when scenarioId changes

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
      <div className="main-container">
        <h1>Loading Scenario...</h1>
      </div>
    );
  }

  return (
    <div>
      {/* Main Content Section */}
      <div className="main-container">
        <div className="flex items-center gap-5"> 
          <h1>Welcome to the start of the scenario!</h1>
          {/* Settings Button */}
          <button onClick={() => setIsPopupVisible(!isPopupVisible)}>
            <img src="/SettingsWheel.png" alt="Settings" className="h-16" />
          </button>
        </div>

        {/* Scenario Details */}
        <div className="text-center mt-5">
          <p>{scenario.door_sign}</p>
        </div>

        {/* Popup */}
        {isPopupVisible && (
          <div ref={popupRef} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-black rounded-lg w-96 h-72 p-5 shadow-lg z-50">
            <p className="text-center text-lg">Settings Menu</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-5 mt-5">
          {/* Back to Home Button */}
          <button onClick={() => router.push('/')} className="button">
            Select A Different Scenario
          </button>

          {/* Start Button */}
          <button onClick={() => router.push(`/scenario?scenarioId=${scenario.id}`)} className='button'>
  Start Scenario
</button>

        </div>
      </div>
    </div>
  );
}
