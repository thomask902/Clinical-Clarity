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
import { useRouter } from 'next/router'; // Import Next.js useRouter hook
import AudioRecorder from '../components/AudioRecorder';

export default function ScenarioPage() {
  const router = useRouter();
  
  // Access the API base URL from the environment variable
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // variables
  const [prompts, setPrompts] = useState([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState('');
  const [showResultsButton, setShowResultsButton] = useState(false);
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  
  // audio recorder vars, not currently used: const [isRecording, setIsRecording] = useState(false);

  // added for increased understanding of model behaviour, can remove later
  const [score, setScore] = useState('');
  const [audioRecorderKey, setAudioRecorderKey] = useState(0); // Key to force AudioRecorder re-render


  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_prompt/1`); // Replace with dynamic scenario ID if needed
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
  }, []);

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
          prompt_id: currentPrompt.id
        }),
      });
      const data = await response.json();
      setResult(data.is_correct ? 'Correct!' : 'False!');
      setScore(data.score)
      // setUserInput(''); // Clear the input for the next prompt
      setResponseSubmitted(true);

      /*
      setTimeout(() => {
        moveToNextPrompt();
      }, 2000);
      */
      
    } catch (error) {
      console.error('Error evaluating response:', error);
    }
  };

  const moveToNextPrompt = async () => {
    if (currentPromptIndex < prompts.length - 1) {

      // If the user has not submitted a response, evaluate their input first
      if (!responseSubmitted) {
        await submitResponse();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      setCurrentPromptIndex(currentPromptIndex + 1);
      setResult(''); // Clear result for the next prompt
      setUserInput(''); // Clear the input for the next prompt
      setScore('');
      setResponseSubmitted(false)

      setAudioRecorderKey(prevKey => prevKey + 1);
    } else {
      alert('You have completed all prompts!');
      //Need to route to the results page
      setShowResultsButton(true);
    }
  };

  // const handleResultsClick = () => {
  //   console.log("Navigating to /results"); // Debugging log
  //   router.push('/results'); // Ensure this is correctly triggering navigation
  // };

  const handleResultsClick = async () => {
    try {
      console.log("Fetching results...");
      const response = await fetch(`${API_BASE_URL}/api/results`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Results fetched:", data);

      // Store results in local storage
      localStorage.setItem("resultsData", JSON.stringify(data));

      // Navigate to results page
      router.push("/results");
    } catch (error) {
      console.error("Error fetching results:", error);
      alert("Failed to fetch results. Please try again.");
    }
  };

  if (!prompts.length) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Loading Prompts...</h1>
      </div>
    );
  }

  // When a transcript is ready, callback function to get this data from Child (AudiRecorder component)
  function handleTranscriptReady(transcript) {
    // Put the transcript into userInput
    setUserInput(transcript);
  }

  return (
    <div 
      style={{
        fontFamily: 'Arial, sans-serif', 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px' }}
    >
      <div 
        style= {{ marginBottom: '20px' }}
      >
        <h3>Prompt:</h3>
        <p>{prompts[currentPromptIndex]?.patient_prompt}</p>
      </div>
      <div 
        style={{ marginBottom: '20px' }}
      >
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your answer OR use audio"
          style={{
            border: '2px solid black',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '16px',
            width: '100%',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
      <AudioRecorder key={audioRecorderKey} onTranscriptReady={handleTranscriptReady} />
  {/* Show "Check" and "Next Prompt" buttons only if not at the last prompt */}
  {!showResultsButton && (
    <>
      <button
        onClick={submitResponse}
        style={{
          border: '2px solid black',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '14px',
          cursor: 'pointer',
          backgroundColor: '#0070f3',
          color: 'white',
        }}
      >
        Check
      </button>
      <button
        onClick={moveToNextPrompt}
        style={{
          border: '2px solid black',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '14px',
          cursor: 'pointer',
          backgroundColor: '#0070f3',
          color: 'white',
        }}
      >
        Next Prompt
      </button>
    </>
  )}
      {/* Results button - route to the results page */}
      {showResultsButton && (
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={handleResultsClick} // Use the function instead of inline
            style={{
              border: '2px solid black',
              padding: '12px',
              borderRadius: '15px',
              fontSize: '18px',
              width: '180px',
              height: '80px',
              cursor: 'pointer',
              backgroundColor: '#0070f3',
              color: 'white',
            }}
          >
            See Results!
          </button>
          </div> )}
      </div>
      <div style={{ marginTop: '20px', fontWeight: 'bold', color: result === 'Correct!' ? 'green' : 'red' }}>
        {result}<br/>{score}
      </div>
    </div>
  );
}

