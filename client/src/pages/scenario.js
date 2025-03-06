import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AudioRecorder from "../components/AudioRecorder";

/*
Scenario Page:

Page where the scenarios are simulated for a patient interaction


Functions:

submitResponse:
- called when the check button is clicked or the next prompt button if no check has been done

moveToNextPrompt:
- checks to see if answer has been checked already, if not, evaluates it, then moves to next prompt after a delay

handleTranscriptionReady:
- When a transcript is ready, callback function to get this data from Child (AudiRecorder component)
- this updates the userInput variable using setUserInput


Returns:

Simulated scenario, options to evaluate response, move to next prompt, etc

*/
export default function ScenarioPage() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { scenarioId } = router.query;

  const [scenario, setScenario] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState("");
  const [resultList, setResultList] = useState([]);
  const [score, setScore] = useState("");
  const [audioRecorderKey, setAudioRecorderKey] = useState(0);
  const [isDoorSignVisible, setIsDoorSignVisible] = useState(false);
  const [previousExpectedResponse, setPreviousExpectedResponse] = useState(null); // Stores expected response
  const [showExpectedResponse, setShowExpectedResponse] = useState(false); // Controls when it appears

  useEffect(() => {
    if (!scenarioId) return;

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

      // If the response is wrong, prepare the expected response but do not show it yet
      if (!data.is_correct) {
        setPreviousExpectedResponse(currentPrompt.expected_response);
        setShowExpectedResponse(false); // Prevent it from showing immediately
      } else {
        setPreviousExpectedResponse(null); // Clear if they got it right
        setShowExpectedResponse(false);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (!isFinalPrompt) {
        setCurrentPromptIndex((prevIndex) => prevIndex + 1);
        setResult("");
        setUserInput("");
        setScore("");
        setAudioRecorderKey((prevKey) => prevKey + 1);
        
        // Show the expected response **only after the new prompt appears**
        setTimeout(() => setShowExpectedResponse(true), 100);
      }
    } catch (error) {
      console.error("Error evaluating response:", error);
    }
  };

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
      {/* Bottom Left - Return to Selection & View Door Sign */}
      <div className="absolute bottom-6 left-6 flex gap-4">
        <button onClick={() => router.push("/scenarioselection")} className="button-secondary">
          Return to Selection
        </button>
        <button onClick={() => setIsDoorSignVisible(true)} className="button-secondary">
          View Door Sign
        </button>
      </div>

      {/* Bottom Right - End Scenario */}
      <div className="absolute bottom-6 right-6">
        <button onClick={() => router.push("/results")} className="button-secondary">
          End Scenario
        </button>
      </div>

      {/* Scenario Door Sign Popup */}
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

      {/* Display Previous Expected Response if the Last Response Was Wrong (Only after Next Prompt Appears) */}
      {showExpectedResponse && previousExpectedResponse && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg w-full max-w-lg text-center">
          <p><strong>Previous Expected Response:</strong> {previousExpectedResponse}</p>
        </div>
      )}

      {/* Prompt Section */}
      <div className="text-center">
        <h3 className="text-xl font-semibold">Prompt:</h3>
        <p className="text-lg text-gray-700">{prompts[currentPromptIndex]?.patient_prompt}</p>
      </div>

      {!isFinalPrompt ? (
        <>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your response or start recording"
            className="border-2 border-black p-3 rounded-lg w-full max-w-lg"
          />
          <div className="flex gap-4 mt-4">
            <AudioRecorder key={audioRecorderKey} onTranscriptReady={handleTranscriptionReady} />
            <button
              onClick={handleCheckAndNext}
              className={userInput.trim() ? "button-primary" : "button-secondary"}
              disabled={!userInput.trim()}
            >
              Check
            </button>
          </div>
        </>
      ) : (
        <div className="mt-5">
          <button onClick={() => router.push("/results")} className="button-primary">
            See Results
          </button>
        </div>
      )}

      {result && (
        <div className="mt-5 font-bold text-lg" style={{ color: result === "Correct!" ? "green" : "red" }}>
          {result}
          <br />
          {score}
        </div>
      )}
    </div>
  );
}
