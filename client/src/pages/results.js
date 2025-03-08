import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ResultsPage() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [scenarioData, setScenarioData] = useState(null);
  const [LLMFeedback, setLLMFeedback] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('scenario_data');
    if (!data) return;

    const parsedData = JSON.parse(data);
    console.log("Loaded scenario data:", parsedData);
    setScenarioData(parsedData);

    // Only get doctor messages from conversation history
    const doctorMessages = parsedData.conversation_history
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);

    console.log("Doctor messages to evaluate:", doctorMessages);

    const criticResponseLLM = async () => {
      try {
        const requestData = {
          doctor_messages: doctorMessages
        };
        console.log("Sending request data:", requestData);

        const response = await fetch(`${API_BASE_URL}/llm_critic`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestData),
        });

        console.log("Response status:", response.status);
        const responseData = await response.json();
        console.log("Response data:", responseData);

        if (!response.ok) {
          throw new Error(responseData.error || "Network response was not ok");
        }

        // Log the exact feedback content
        console.log("Raw feedback content:", responseData.critic_feedback);
        
        if (responseData.critic_feedback) {
          // Set the feedback directly from the response
          setLLMFeedback(responseData.critic_feedback);
          console.log("Feedback set in state:", responseData.critic_feedback);
        } else {
          console.error("No feedback in response");
          setLLMFeedback("Error: No feedback received");
        }
      } catch (error) {
        console.error('Error with critic response:', error);
        setLLMFeedback("Error getting feedback. Please try again.");
      }
    };

    // Call the function immediately
    criticResponseLLM();
  }, [API_BASE_URL]); // Only depend on API_BASE_URL

  if (!scenarioData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Scenario Results</h1>
        
        {/* LLM critic feedback */}
        <div className="w-full max-w-5xl mx-auto mb-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Consultation Feedback</h2>
          {LLMFeedback ? (
            <div className="text-base space-y-4">
              {LLMFeedback.split('\n').map((line, index) => {
                // Clean the line of markdown symbols
                const cleanLine = line
                  .replace(/\*\*/g, '')
                  .replace(/###/g, '')
                  .replace(/####/g, '')
                  .replace(/--/g, '')
                  .replace(/\[|\]/g, '')
                  .trim();

                if (!cleanLine) return null;

                // Overall Performance section
                if (cleanLine.includes('Overall Performance')) {
                  return (
                    <div key={index} className="mb-6">
                      <h3 className="text-xl font-bold mb-2">{cleanLine}</h3>
                    </div>
                  );
                }

                // Score lines
                if (cleanLine.startsWith('Score:')) {
                  return (
                    <div key={index} className="font-medium text-blue-600 mb-4">
                      {cleanLine}
                    </div>
                  );
                }

                // Section headers
                if (cleanLine.includes('Key Areas for Improvement') || cleanLine.includes('Recommendations for Improvement')) {
                  return (
                    <div key={index} className="mt-6">
                      <h3 className="text-xl font-bold mb-3">{cleanLine}</h3>
                    </div>
                  );
                }

                // Numbered improvements or feedback points
                if (/^\d+\./.test(cleanLine)) {
                  return (
                    <p key={index} className="ml-4 mb-2">
                      {cleanLine}
                    </p>
                  );
                }

                // Section headers with scores
                if (cleanLine.includes('(Score:')) {
                  return (
                    <h3 key={index} className="text-lg font-semibold mt-6 mb-3">
                      {cleanLine}
                    </h3>
                  );
                }

                // Feedback lines
                if (cleanLine.startsWith('Feedback:')) {
                  return (
                    <p key={index} className="ml-4 mb-4 text-gray-700">
                      {cleanLine}
                    </p>
                  );
                }

                // Default text
                return (
                  <p key={index} className="mb-2">
                    {cleanLine}
                  </p>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">Loading feedback...</p>
          )}
        </div>

        {/* Conversation Transcript */}
        <div className="w-full max-w-5xl mx-auto mb-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Conversation Transcript</h2>
          <div className="space-y-2">
            {scenarioData.conversation_history.map((message, index) => (
              <div key={index} className={`p-3 rounded-lg ${
                message.role === 'user' ? 'bg-blue-100 ml-4' : 'bg-gray-100 mr-4'
              }`}>
                <p className="font-semibold text-sm mb-1">{message.role === 'user' ? 'Doctor' : 'Patient'}</p>
                <p className="text-base">{message.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pb-8">
          <button onClick={() => router.push("/scenarioselection")} className="button-primary">
            Try Another Scenario
          </button>
        </div>
      </div>
    </div>
  );
}
