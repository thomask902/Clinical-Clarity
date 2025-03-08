import { useState, useEffect, useRef } from "react";
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
  const chatContainerRef = useRef(null);

  const [scenario, setScenario] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState("");
  const [resultList, setResultList] = useState([]);
  const [score, setScore] = useState("");
  const [audioRecorderKey, setAudioRecorderKey] = useState(0);

  // llm stuff
  const [patientResponse, setPatientResponse] = useState('')
  const [patientResponseAudio, setPatientResponseAudio] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [isDoorSignVisible, setIsDoorSignVisible] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);  // Store just the conversation

  useEffect(() => {
    if (!scenarioId) return;

    const fetchScenarioData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_scenarios`);
        const scenarios = await response.json();
        const matchingScenario = scenarios.find(s => s.id === parseInt(scenarioId));
        
        if (!matchingScenario) {
          console.error('Scenario not found');
          return;
        }

        setScenario(matchingScenario);
        setSystemPrompt(matchingScenario.system_prompt);
        // Start with empty conversation
        setConversationHistory([]);

      } catch (error) {
        console.error("Error fetching scenario data:", error);
      }
    };

    fetchScenarioData();
  }, [scenarioId, API_BASE_URL]);

  // Add new useEffect for auto-scrolling
  useEffect(() => {
    if (chatContainerRef.current && conversationHistory.length > 0) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  const handleCheckAndNext = async () => {
    try {
      // Add user's input to conversation
      setConversationHistory(prev => [...prev, { role: 'user', content: userInput }]);

      const response = await fetch(`${API_BASE_URL}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_input: userInput,
          prompt_id: 1, // Just use a default prompt ID since we're not using them anymore
        }),
      });

      await patientResponseLLM();

      setUserInput("");
      setAudioRecorderKey((prevKey) => prevKey + 1);
      
    } catch (error) {
      console.error("Error evaluating response:", error);
    }
  };

  const handleTranscriptionReady = (transcript) => {
    setUserInput(transcript);
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

  // LLM patient
  const patientResponseLLM = async () => {

    // Call API for LLM response to get created
    try {
      const response = await fetch(`${API_BASE_URL}/llm_patient_response`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: userInput,
          system_prompt: systemPrompt,
          conversation_history: conversationHistory  // Send just the conversation, system prompt is separate
        }),
      });

      // make sure response is ok
      console.log("Response status:", response.status);  // Should be 200 if it's successful
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
      setPatientResponse(data.patient_transcript)

      // Add patient's response to conversation
      setConversationHistory(prev => [...prev, { role: 'assistant', content: data.patient_transcript }]);
    
    } catch (error) {
      console.error('Error with patient response:', error);
    }
  }

  // When user clicks End Scenario, save conversation and scenario info
  const handleEndScenario = () => {
    localStorage.setItem('scenario_data', JSON.stringify({
      conversation_history: conversationHistory,
      scenario_id: scenarioId,
      system_prompt: systemPrompt
    }));
    router.push("/results");
  }

  if (!scenario) {
    return (
      <div className="main-container flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Loading Scenario...</h1>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Main Content Area - Scrollable Chat History */}
      <div className="h-[calc(100vh-280px)] overflow-y-auto" ref={chatContainerRef}>
        <div className="container mx-auto px-4 py-6">
          <div className="w-full max-w-4xl mx-auto space-y-4">
            {conversationHistory.length === 0 ? (
              <div className="text-center text-gray-600 my-8">
                Please speak to the patient.
              </div>
            ) : (
              <div className="space-y-4">
                {conversationHistory.map((message, index) => (
                  <div key={index} className={`p-3 rounded-lg ${
                    message.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
                  }`}>
                    <p className="font-semibold text-sm mb-1">{message.role === 'user' ? 'Doctor' : 'Patient'}</p>
                    <p className="text-base">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Input Area */}
      <div className="fixed bottom-[88px] left-0 right-0 bg-white border-t border-gray-200 pt-4 pb-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Audio Player */}
            {patientResponseAudio && (
              <div className="max-w-2xl mx-auto">
                <audio
                  key={patientResponseAudio}
                  controls
                  className="w-full"
                >
                  <source src={patientResponseAudio} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Input Section */}
            <div>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your response or start recording"
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <div className="flex justify-center gap-4 mt-4">
                <AudioRecorder key={audioRecorderKey} onTranscriptReady={handleTranscriptionReady} />
                <button
                  onClick={handleCheckAndNext}
                  className={userInput.trim() ? "button-primary" : "button-secondary"}
                  disabled={!userInput.trim()}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <button onClick={() => router.push("/scenarioselection")} className="button-secondary text-sm px-4 py-2 w-auto">
                Return to Selection
              </button>
              <button onClick={() => setIsDoorSignVisible(true)} className="button-secondary text-sm px-4 py-2 w-auto">
                View Door Sign
              </button>
            </div>
            <button onClick={handleEndScenario} className="button-primary text-sm px-4 py-2 w-auto">
              End Scenario
            </button>
          </div>
        </div>
      </div>

      {/* Door Sign Modal */}
      {isDoorSignVisible && scenario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-center mb-4">Scenario Door Sign</h3>
            <p className="text-gray-700 text-center mb-6">{scenario.door_sign}</p>
            <div className="flex justify-center">
              <button onClick={() => setIsDoorSignVisible(false)} className="button-secondary text-sm px-4 py-2 w-auto">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
