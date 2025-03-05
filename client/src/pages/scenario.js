import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AudioRecorder from "../components/AudioRecorder";

/*
Scenario Page:

Page where the scenarios are simulated for a patient interaction.

Functions:

handleCheckAndNext:
- Checks the user's response, evaluates it, and moves to the next prompt after a delay.
- If incorrect, stores the expected response but does not show it immediately.
- Displays the expected response only after the new prompt appears.

handleTranscriptionReady:
- Callback function to retrieve transcript data from the AudioRecorder component.
- Updates the userInput variable using setUserInput.

Returns:
- Simulated scenario with options to evaluate responses and move to the next prompt.
- Provides a button to view the scenario door sign.
- Shows expected responses for incorrect answers.
- Displays a final results button at the end.
*/

export default function ScenarioPage() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { scenarioId } = router.query;

  // State variables for managing the scenario and user interaction
  const [scenario, setScenario] = useState(null); // Stores scenario details
  const [prompts, setPrompts] = useState([]); // Stores list of prompts for the scenario
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0); // Tracks the current prompt index
  const [userInput, setUserInput] = useState(""); // Stores user input
  const [result, setResult] = useState(""); // Stores the evaluation result
  const [resultList, setResultList] = useState([]); // Stores list of all response results
  const [score, setScore] = useState(""); // Stores the score returned from evaluation
  const [audioRecorderKey, setAudioRecorderKey] = useState(0); // Used to reset the AudioRecorder component
  const [isDoorSignVisible, setIsDoorSignVisible] = useState(false); // Controls visibility of the door sign
  const [previousExpectedResponse, setPreviousExpectedResponse] = useState(null); // Stores the expected response of the last incorrect answer
  const [showExpectedResponse, setShowExpectedResponse] = useState(false); // Controls when expected response is shown

  useEffect(() => {
    if (!scenarioId) return;

    // Fetch scenario details and prompts from the backend
    const fetchScenarioData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_prompt/${scenarioId}`);
        const data = await response.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        setScenario(data.scenario);
        setPrompts(data.prompts);
      } catch (error) {
        console.error("Error fetching scenario data:", error);
      }
    };

    fetchScenarioData();
  }, [scenarioId, API_BASE_URL]);

  const isFinalPrompt = currentPromptIndex === prompts.length - 1;

  // Handles user response evaluation and moves to the next prompt
  const handleCheckAndNext = async () => {
    if (!prompts.length || currentPromptIndex >= prompts.length) {
      alert("No prompt to respond to.");
      return;
    }

    const currentPrompt = prompts[currentPromptIndex];

    try {
      const response = await fetch(`${API_BASE_URL}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_input: userInput,
          prompt_id: currentPrompt.id,
        }),
      });

      const data = await response.json();
      setResultList((prevList) => [...prevList, data.is_correct]);
      setResult(data.is_correct ? "Correct!" : "False!");
      setScore(data.score);

      if (!data.is_correct) {
        setPreviousExpectedResponse(currentPrompt.expected_response);
        setShowExpectedResponse(false);
      } else {
        setPreviousExpectedResponse(null);
        setShowExpectedResponse(false);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay before moving to the next prompt

      if (!isFinalPrompt) {
        setCurrentPromptIndex((prevIndex) => prevIndex + 1);
        setResult("");
        setUserInput("");
        setScore("");
        setAudioRecorderKey((prevKey) => prevKey + 1);
        setTimeout(() => setShowExpectedResponse(true), 100);
      }
    } catch (error) {
      console.error("Error evaluating response:", error);
    }
  };

  // Updates user input with transcript from the AudioRecorder component
  const handleTranscriptionReady = (transcript) => {
    setUserInput(transcript);
  };

  if (!prompts.length) {
    return (
      <div className="main-container flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Loading Prompts...</h1>
      </div>
    );
  }

  return (
    <div className="main-container flex flex-col items-center justify-center min-h-screen gap-6 p-6 relative">
      {/* Navigation buttons */}
      <div className="absolute bottom-6 left-6 flex gap-4">
        <button onClick={() => router.push("/scenarioselection")} className="button-secondary">
          Return to Selection
        </button>
        <button onClick={() => setIsDoorSignVisible(true)} className="button-secondary">
          View Door Sign
        </button>
      </div>

      <div className="absolute bottom-6 right-6">
        <button onClick={() => router.push("/results")} className="button-secondary">
          End Scenario
        </button>
      </div>

      {/* Display door sign popup */}
      {isDoorSignVisible && scenario && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-black rounded-lg w-96 p-5 shadow-lg z-50">
          <h3 className="text-lg font-semibold text-center">Scenario Door Sign</h3>
          <p className="text-center text-gray-700 mt-2">{scenario.door_sign}</p>
          <div className="flex justify-center mt-4">
            <button onClick={() => setIsDoorSignVisible(false)} className="button-secondary">
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Display expected response only if the previous answer was incorrect */}
      {showExpectedResponse && previousExpectedResponse && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg w-full max-w-lg text-center">
          <p><strong>Previous Expected Response:</strong> {previousExpectedResponse}</p>
        </div>
      )}
    </div>
  );
}
