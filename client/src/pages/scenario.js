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
import AudioRecorder from '../components/AudioRecorder';

export default function ScenarioPage() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { scenarioId } = router.query; // ✅ Get scenarioId dynamically

  const [prompts, setPrompts] = useState([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState('');
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
      alert('You have completed all prompts!');
      setShowResultsButton(true);
    }
  };

  const handleResultsClick = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/results`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem('resultsData', JSON.stringify(data));
      router.push('/results');
    } catch (error) {
      console.error('Error fetching results:', error);
      alert('Failed to fetch results. Please try again.');
    }
  };

  if (!prompts.length) {
    return <div className="main-container flex flex-col items-center justify-center min-h-screen"><h1 className="text-2xl font-bold">Loading Prompts...</h1></div>;
  }

  return (
    <div className="main-container flex flex-col items-center justify-center min-h-screen gap-6 p-6 relative">
      <div className="absolute bottom-6 left-6">
        <button onClick={() => router.push('/scenarioselection')} className="button">
          Return to Scenario Selection
        </button>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold">Prompt:</h3>
        <p className="text-lg text-gray-700">{prompts[currentPromptIndex]?.patient_prompt}</p>
      </div>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Type your response or start recording"
        className="border-2 border-black p-3 rounded-lg w-full max-w-lg"
      />
      <div className="flex flex-wrap gap-4 justify-center">
        <AudioRecorder key={audioRecorderKey} onTranscriptReady={setUserInput} />
        {!showResultsButton && (
          <>
            <button onClick={submitResponse} className="button">Check</button>
            <button onClick={moveToNextPrompt} className="button">Next Prompt</button>
          </>
        )}
      </div>
      {showResultsButton && (
        <div className="mt-5">
          <button onClick={handleResultsClick} className="button bg-green-500 hover:bg-green-700">See Results!</button>
        </div>
      )}
      <div className="mt-5 font-bold text-lg" style={{ color: result === 'Correct!' ? 'green' : 'red' }}>
        {result}<br />{score}
      </div>
    </div>
  );
}
