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


import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// REMOVE COMMENT TO RE-ENABLE AUDIO
// import AudioRecorder from '../components/AudioRecorder';

export default function ScenarioPage() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { scenarioId } = router.query; // ✅ Get scenarioId dynamically

  const [prompts, setPrompts] = useState([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState('');
  const [resultList, setResultList] = useState([]);
  const [showResultsButton, setShowResultsButton] = useState(false);
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [score, setScore] = useState('');
  const [audioRecorderKey, setAudioRecorderKey] = useState(0);

  useEffect(() => {
    if (!scenarioId) return; // ✅ Prevent fetching if scenarioId is missing

    const fetchPrompts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_prompt/${scenarioId}`);
        const data = await response.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        setPrompts(data.prompts);
      } catch (error) {
        console.error('Error fetching prompts:', error);
      }
    };

    fetchPrompts();
  }, [scenarioId]);

  const submitResponse = async () => {
    if (!prompts.length || currentPromptIndex >= prompts.length) {
      alert('No prompt to respond to.');
      return;
    } else if (responseSubmitted) {
      alert('You have already submitted a response. Please move to the next prompt.');
      return;
    }

    const currentPrompt = prompts[currentPromptIndex];
    try {
      const response = await fetch(`${API_BASE_URL}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: userInput,
          prompt_id: currentPrompt.id,
        }),
      });
      const data = await response.json();
      setResultList((prevList) => [...prevList, data.is_correct]);
      setResult(data.is_correct ? 'Correct!' : 'False!');
      setScore(data.score);
      setResponseSubmitted(true);
    } catch (error) {
      console.error('Error evaluating response:', error);
    }
  };

  const moveToNextPrompt = async () => {
    if (currentPromptIndex < prompts.length - 1) {
      if (!responseSubmitted) {
        await submitResponse();
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      setCurrentPromptIndex(currentPromptIndex + 1);
      setResult('');
      setUserInput('');
      setScore('');
      setResponseSubmitted(false);
      setAudioRecorderKey((prevKey) => prevKey + 1);
    } else {
      setShowResultsButton(true);
    }
  };

  const handleResultsClick = async () => {
    // get user id
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    // get results
    const trueCount = resultList.filter(Boolean).length;
    const totalCount = resultList.length;

    const result_dict = {
      "user_id": userId,
      "scenario_id": scenarioId,
      "category": "N/A",
      "num_correct": trueCount,
      "num_prompts": totalCount
    }

    // testing
    console.log(result_dict)

    // send results to backend to add to db
    try {
      const response = await fetch(`${API_BASE_URL}/store_results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result_dict),
      });

      if (response.ok) {
        console.log("Added result to db!")
      } else {
        const errorData = await response.json();  // Get error message from backend
        console.error("Failed to add result to DB:", errorData);
        setErrorMsg(errorData.error || "Failed to add result to DB.");
      }
    } catch (error) {
      console.error("Error in API call:", error);
    }

    // store user results locally
    localStorage.setItem("scenario_results", JSON.stringify(result_dict));

    // ensure storage is updated before redirecting
    await new Promise((resolve) => setTimeout(resolve, 100)); 
    const storedToken = localStorage.getItem("scenario_results");
    if (!storedToken) {
      console.error("Results storage failed, retrying...");
      return; // Prevent redirect if storage fails
    }
    router.push("/results");
  };

  if (!prompts.length) {
    return <div className="main-container flex flex-col items-center justify-center min-h-screen"><h1 className="text-2xl font-bold">Loading Prompts...</h1></div>;
  }

  return (
    <div className="main-container flex flex-col items-center justify-center min-h-screen gap-6 p-6 relative">
      {/* Return to Scenario Selection Button */}
      <div className="absolute bottom-6 left-6">
        <button onClick={() => router.push('/scenarioselection')} className="button">
          Return to Scenario Selection
        </button>
      </div>
  
      {/* Hide Prompt & Input When Show Results is Enabled */}
      {!showResultsButton && (
        <>
          {/* Prompt Section */}
          <div className="text-center">
            <h3 className="text-xl font-semibold">Prompt:</h3>
            <p className="text-lg text-gray-700">{prompts[currentPromptIndex]?.patient_prompt}</p>
          </div>
  
          {/* Input Field */}
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your response or start recording"
            className="border-2 border-black p-3 rounded-lg w-full max-w-lg"
          />
  
          {/* Audio Recorder (Commented) */}
          {/* <AudioRecorder key={audioRecorderKey} onTranscriptReady={setUserInput} /> */}
          
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={submitResponse} className="button">Check</button>
            <button onClick={moveToNextPrompt} className="button">Next Prompt</button>
          </div>

          {/* Result Display */}
          <div className="mt-5 font-bold text-lg" style={{ color: result === 'Correct!' ? 'green' : 'red' }}>
            {result}<br />{score}
          </div>
        </>
      )}
  
      {/* See Results Button*/}
      {showResultsButton && (
        <>
          <div className="text-center">
            <h3 className="text-xl">That's the end of the scenario! Great work!</h3>
          </div>
          <div className="mt-5">
            <button onClick={handleResultsClick} className="button">See Results</button>
          </div>
        </>
      )}
  
      
    </div>
  );  
}
