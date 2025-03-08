import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';

export default function ScenarioStartPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();
  const { scenarioId } = router.query;
  const [scenario, setScenario] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    if (!scenarioId) return;

    const fetchScenario = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_scenarios`);
        const scenarios = await response.json();
        const matchingScenario = scenarios.find(s => s.id === parseInt(scenarioId));
        
        if (!matchingScenario) {
          console.error('Scenario not found');
          return;
        }
        setScenario(matchingScenario);
      } catch (error) {
        console.error('Error fetching scenario:', error);
      }
    };

    fetchScenario();
  }, [scenarioId, API_BASE_URL]);

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
    <div className="main-container flex flex-col justify-center items-center min-h-screen p-8 text-center">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-4">Welcome to the Scenario!</h1>

      {/* Scenario Details */}
      <div className="max-w-2xl bg-gray-100 p-6 rounded-lg shadow-md">
        <p className="text-lg leading-relaxed">
          <strong>Door Sign:</strong>
          <br />
          {scenario.door_sign}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-6 mt-6">
        {/* Back Button */}
        <button onClick={() => router.push('/scenarioselection')} className="button-secondary">
          Select A Different Scenario
        </button>

        {/* Start Button */}
        <button onClick={() => router.push(`/scenario?scenarioId=${scenario.id}`)} className="button-primary">
          Start Scenario
        </button>
      </div>
    </div>
  );
}
