import React, { useEffect, useState } from 'react'

function Index() {

  // PROD
  // const API_BASE_URL = 'https://clinical-clarity-backend.onrender.com';

  // LOCAL
  const API_BASE_URL = 'http://localhost:8080';

  const [message, setMessage] = useState('Loading');
  const [team, setTeam] = useState([]);
  const [prompt, setPrompt] = useState('Loading prompt...');
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeResponse, promptResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/home`),
          fetch(`${API_BASE_URL}/get_prompt`)
        ]);
        
        const homeData = await homeResponse.json();
        const promptData = await promptResponse.json();
  
        // Update state with data from both responses
        setMessage(homeData.message);
        setTeam(homeData.team);
        setPrompt(promptData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);

  const submitResponse = () => {
    if (!prompt) {
      alert('Prompt is not loaded yet.');
      return;
    }
    
    fetch(`${API_BASE_URL}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_input: userInput,
        prompt_id: prompt.id
      })
    })
      .then(response => response.json())
      .then(data => {
        // Handle the evaluation result
        if (data.is_correct) {
          setResult('Correct!')
        } else {
          setResult('False!');
        }
      })
      .catch(error => console.error('Error evaluating response:', error));
  };

  return (
    <div>
      <div>Welcome to the Clinical Clarity Next.js App! Hi!</div>
      <div>This is our Management Engineering Class of 2025 Capstone Project</div>
      <div>{message}</div>
      <div>
        <h3>Our Team:</h3>
        <ul>
          {team.map((member, index) => (
            <li key={index}>{member}</li>
          ))}
        </ul>
      </div>
      <div><br/>Your Prompt: {prompt.prompt_text}</div>
      <div>
      <br />
      <input
        type="text"
        value={userInput}
        onChange={e => setUserInput(e.target.value)}
        placeholder="Type your answer here"
        style={{
          border: '2px solid',  // Adds a green border
          padding: '10px',              // Adds padding inside the input box
          borderRadius: '5px',          // Rounds the corners
          fontSize: '16px',             // Changes font size
          width: '50%',                // Makes the input take the full width of its container
        }}
      />
      </div>
      <div>
      <br />
      <button 
        onClick={submitResponse}
        style={{
          border: '2px solid',  // Adds a green border
          padding: '4px',              // Adds padding inside the input box
          borderRadius: '5px',          // Rounds the corners
          fontSize: '14px',             // Changes font size
          width: '15%',                // Makes the input take the full width of its container
        }}
      >Check</button>
      </div>
      <div>
      <br />
      {result}
      </div>
    </div>
  );
}

export default Index;