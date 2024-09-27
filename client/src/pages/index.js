import React, { useEffect, useState } from 'react'

function Index() {

  // PROD
  const API_BASE_URL = 'https://clinical-clarity-backend.onrender.com';

  // LOCAL
  // const API_BASE_URL = 'http://localhost:8080/api/home';


  const [message, setMessage] = useState("Loading");
  // const [team, setTeam] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/home`).then(
      response => response.json()
    ).then(
      data => {
        // message is "loading" and once it is retrieved it is set to data.message from api
        setMessage(data.message);
        // setTeam(data.team);
        //console.log(data.team)
      }
    )
  }, [])

  return (
    <div>
      <div>Welcome to the Clinical Clarity Next.js App!</div>
      <div>We are team 13 :)</div>
      <div>{message}</div>
    </div>
  );
}

export default Index;