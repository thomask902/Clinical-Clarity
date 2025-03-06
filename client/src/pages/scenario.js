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

base64ToBlob:
- helper function to turn audio from base64 into blob file like object, for displaying audio file in front end

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

  // llm stuff
  const [patientResponse, setPatientResponse] = useState('')
  const [patientResponseAudio, setPatientResponseAudio] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [userInputList, setUserInputList] = useState([])
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

        // set the 
        setSystemPrompt(data.scenario.system_prompt)

      } catch (error) {
        console.error("Error fetching scenario data:", error);
      }
    };

    fetchScenarioData();
  }, [scenarioId, API_BASE_URL]);

  const addUserInputList = (newUserInput) => {
    setUserInputList(prevList => [...prevList, newUserInput]);
  };

  const isFinalPrompt = currentPromptIndex === prompts.length - 1;

  // Helper function to convert base64 string (encoded audio file) to audio Blob
  const base64ToBlob = (base64, mime) => {

    // atob() function takes a base64-encoded string and decodes it into a raw binary string, where each character represents a byte of the decoded data
    const binary = atob(base64);

    // Uint8Array.from() creates a typed array of 8-bit unsigned integers. For each character in the binary string, we use char.charCodeAt(0) to get its numerical byte value
    const byteArray = Uint8Array.from(binary, char => char.charCodeAt(0));

    // create blob, which is file like object. mime type means audio
    return new Blob([byteArray], { type: mime });
  }


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

      await patientResponseLLM();

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


  // LLM patient
  const patientResponseLLM = async () => {

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

      console.log("Audio URL:", patientResponseAudio);
      console.log("Audio URL:", audioUrl);
    
    } catch (error) {
      console.error('Error with patient response:', error);
    }
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

      {/* LLM Patient Section */}
      {!isFinalPrompt ? (
        <>
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
            <p>Please speak to the patient.</p>
          )}
          {/* Input Field */}
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
