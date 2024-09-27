import React, { useEffect, useState } from 'react'

function Index() {

  // PROD
  const API_BASE_URL = 'https://clinical-clarity-backend.onrender.com';

  // LOCAL
  // const API_BASE_URL = 'http://localhost:8080/api/home';

  const [message, setMessage] = useState('Loading');
  const [team, setTeam] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/home`)
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message); // Set the message
        setTeam(data.team); // Set the team list
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div>
      <div>Welcome to the Clinical Clarity Next.js App!</div>
      <div>{message}</div>
      <div>
        <h3>Our Team:</h3>
        <ul>
          {team.map((member, index) => (
            <li key={index}>{member}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Index;