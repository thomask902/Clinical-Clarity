import { useState, useEffect } from 'react';

export default function ScenarioPage() {
  // PROD
  const API_BASE_URL = 'https://clinical-clarity-backend.onrender.com';

  // LOCAL
  //const API_BASE_URL = 'http://localhost:8080';
  
  const [prompts, setPrompts] = useState([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState('');

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
      setUserInput(''); // Clear the input for the next prompt

      if (data.is_correct) {
        setTimeout(() => {
          moveToNextPrompt();
        }, 2000);
      }
    } catch (error) {
      console.error('Error evaluating response:', error);
    }
  };

  const moveToNextPrompt = () => {
    if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
      setResult(''); // Clear result for the next prompt
    } else {
      alert('You have completed all prompts!');
    }
  };

  if (!prompts.length) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Loading Prompts...</h1>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3>Prompt:</h3>
        <p>{prompts[currentPromptIndex]?.patient_prompt}</p>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your answer here"
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
      </div>
      <div style={{ marginTop: '20px', fontWeight: 'bold', color: result === 'Correct!' ? 'green' : 'red' }}>
        {result}
      </div>
    </div>
  );
}
