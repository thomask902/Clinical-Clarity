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
  const [resultList, setResultList] = useState([]);
  const [showResultsButton, setShowResultsButton] = useState(false);
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [score, setScore] = useState('');
  const [audioRecorderKey, setAudioRecorderKey] = useState(0);

  // llm stuff
  const [patientResponse, setPatientResponse] = useState('')
  const [patientResponseAudio, setPatientResponseAudio] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [userInputList, setUserInputList] = useState([])

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

        // set the 
        setSystemPrompt(data.scenario.system_prompt)

      } catch (error) {
        console.error('Error fetching prompts:', error);
      }
    };

    fetchPrompts();
  }, [scenarioId, API_BASE_URL]);

  const addUserInputList = (newUserInput) => {
    setUserInputList(prevList => [...prevList, newUserInput]);
  };

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

  // Helper function to convert base64 string (encoded audio file) to audio Blob
  const base64ToBlob = (base64, mime) => {

    // atob() function takes a base64-encoded string and decodes it into a raw binary string, where each character represents a byte of the decoded data
    const binary = atob(base64);

    // Uint8Array.from() creates a typed array of 8-bit unsigned integers. For each character in the binary string, we use char.charCodeAt(0) to get its numerical byte value
    const byteArray = Uint8Array.from(binary, char => char.charCodeAt(0));

    // create blob, which is file like object. mime type means audio
    return new Blob([byteArray], { type: mime });
  }

  const moveToNextPrompt = async () => {
    if (currentPromptIndex < prompts.length - 1) {
      if (!responseSubmitted) {
        await submitResponse();
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Call API for LLM response to get created
      try {
        const response = await fetch(`${API_BASE_URL}/llm_patient_response`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_input: userInput,
            system_prompt: systemPrompt
          }),
        });

        // make sure response is ok
        console.log("Response status:", response.status);  // Should be 200 if it’s successful
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        // return json data from flask api, transcript and base64 audio
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        if (patientResponseAudio) {
          // Call this revokeObjectURL when you've finished using an object URL to let the browser know not to keep the reference to the file any longer
          URL.revokeObjectURL(patientResponseAudio);
        }

        // convert response into a blob (file-like JS object)
        const audioBlob = base64ToBlob(data.audio_base64, 'audio/wav');

        // create URL with audio blob
        const audioUrl = URL.createObjectURL(audioBlob)
        setPatientResponseAudio(audioUrl)

        // set text transcript
        setPatientResponse(data.patient_transcript)


        // convert response into a blob (file-like JS object)
        // const audioBlob = await response.blob();

        // create URL with audio blob
        //const audioUrl = URL.createObjectURL(audioBlob)
        // setPatientResponseAudio(audioUrl)

        console.log("Audio URL:", patientResponseAudio);
        console.log("Audio URL:", audioUrl);
        
//      setPatientResponse(data.patient_response_text)
//      setPatientResponse(llm_patient_response)

      } catch (error) {
        console.error('Error evaluating response:', error);
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
            <h3 className="text-xl font-semibold">Patient Response:</h3>
            <p className="text-lg text-gray-700">{patientResponse}</p>
          </div>
          {patientResponseAudio ? (
            <audio
              key={patientResponseAudio}
              controls
            >
              <source src={patientResponseAudio} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <p>Loading audio...</p>
          )}
          {/* Input Field */}
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your response or start recording"
            className="border-2 border-black p-3 rounded-lg w-full max-w-lg"
          />
  
          {/* Audio Recorder (Commented) */}
          <AudioRecorder key={audioRecorderKey} onTranscriptReady={setUserInput} />
          
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
            <h3 className="text-xl">That&apos;s the end of the scenario! Great work!</h3>
          </div>
          <div className="mt-5">
            <button onClick={handleResultsClick} className="button">See Results</button>
          </div>
        </>
      )}
  
      
    </div>
  );  
}
