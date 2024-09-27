import React, { useEffect, useState } from 'react'

function index() {

  const [message, setMessage] = useState("Loading");
  const [team, setTeam] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/home").then(
      response => response.json()
    ).then(
      data => {
        // message is "loading" and once it is retrieved it is set to data.message from api
        setMessage(data.message);
        setTeam(data.team);
        console.log(data.team)
      }
    )
  }, [])

  return (
    <div>
      <div>{message}</div>
      {team.map((person, index) => (
        <div key={index}>{person}</div>))}
    </div>
  );
}

export default index;