import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'; // Import Next.js useRouter hook

function Index() {

  // Access the API base URL from the environment variable
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [message, setMessage] = useState('Loading');
  const [team, setTeam] = useState([]);

  const router = useRouter(); // Initialize the router


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeResponse, promptResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/home`),
          fetch(`${API_BASE_URL}/get_prompt/1`) // here '1' is the scenario id being fetched
        ]);
        
        const homeData = await homeResponse.json();
        
  
        // Update state with data from both responses
        setMessage(homeData.message);
        setTeam(homeData.team);
      
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);

  return (
    <div>
      {/* Header Section */}
      <div
        style={{
          backgroundColor: '#E8F8FF', // Light blue background
          display: 'flex',
          alignItems: 'center', // Align text and image vertically
          padding: '20px', // Add some padding
        }}
      >
        
        {/* Title */}
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            margin: 0, // Remove margin for proper alignment
          }}
        >
          Clinical Clarity
        </h1>
        {/* Logo */}
        <img
          src="/ClinicalClarityLogo.png" // Path to the logo in the public folder
          alt="Clinical Clarity Logo"
          style={{ height: '70px', marginRight: '5px' }} // Adjust size and spacing
        />
      </div>

      {/* Main Content Section */}
    <div
      style={{
      backgroundColor: '#E8F8FF', // Light blue background
      display: 'flex',         // Enables flexbox
      justifyContent: 'center', // Centers horizontally
      alignItems: 'center',    // Centers vertically
      minHeight: '87vh',      // Ensures the div takes the full viewport height
      textAlign: 'center',     // Centers text within child elements
      flexDirection: 'column', // Arranges items vertically
      }}
    >
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
      <div
  style={{
    display: 'flex', // Enables flexbox for horizontal alignment
    justifyContent: 'center', // Centers the buttons horizontally
    gap: '20px', // Adds spacing between the buttons
    marginTop: '20px', // Adds spacing above the buttons
  }}
>
  {/* Patient Scenarios Button */}
  <button
    onClick={() => router.push('/scenariostart')} // Redirect to /scenariostart
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
    Patient Scenarios
  </button>

  {/* Upskilling Button */}
  <button
    onClick={() => router.push('/upskillingstart')} // Redirect to /upskillingstart
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
    Upskilling
  </button>
        </div>
      </div>
      {/* Navigation Bar */}
<div
  style={{
    position: 'fixed', // Fixes the navbar at the bottom
    bottom: 0,
    left: 0,
    width: '100%', // Stretches the bar across the page
    backgroundColor: '#C0ECFF', // Navigation bar color
    display: 'flex',
    justifyContent: 'center', // Center the buttons horizontally
    alignItems: 'center', // Align the buttons vertically
    gap: '30px', // Adjust spacing between buttons
    padding: '10px 0', // Adds vertical padding
    boxShadow: '0px -2px 5px rgba(0, 0, 0, 0.1)', // Adds a shadow at the top
  }}
>
  {/* Navigation Button: Home */}
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <button
      onClick={() => router.push('/')}
      style={{
        backgroundColor: 'white',
        borderRadius: '50%',
        width: '80px', // Wider ellipse shape
        height: '60px', // Taller ellipse shape
        border: 'none',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        src="/HomePage.png"
        alt="Home"
        style={{ width: '30px', height: '30px' }}
      />
    </button>
    <p style={{ fontSize: '12px', marginTop: '5px' }}>Home Page</p>
  </div>

  {/* Navigation Button: Progress */}
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <button
      onClick={() => alert('Progress Page Coming Soon!')} // Replace with appropriate link
      style={{
        backgroundColor: 'white',
        borderRadius: '50%',
        width: '80px', // Wider ellipse shape
        height: '60px', // Taller ellipse shape
        border: 'none',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        src="/Progress.png"
        alt="Progress"
        style={{ width: '30px', height: '30px' }}
      />
    </button>
    <p style={{ fontSize: '12px', marginTop: '5px' }}>Progress</p>
  </div>

  {/* Navigation Button: Daily Challenge */}
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <button
      onClick={() => alert('Daily Challenge Coming Soon!')} // Replace with appropriate link
      style={{
        backgroundColor: 'white',
        borderRadius: '50%',
        width: '80px', // Wider ellipse shape
        height: '60px', // Taller ellipse shape
        border: 'none',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        src="/DailyChallenge.png"
        alt="Daily Challenge"
        style={{ width: '30px', height: '30px' }}
      />
    </button>
    <p style={{ fontSize: '12px', marginTop: '5px' }}>Daily Challenge</p>
  </div>

  {/* Navigation Button: Account */}
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <button
      onClick={() => alert('Account Page Coming Soon!')} // Replace with appropriate link
      style={{
        backgroundColor: 'white',
        borderRadius: '50%',
        width: '80px', // Wider ellipse shape
        height: '60px', // Taller ellipse shape
        border: 'none',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        src="/Account.png"
        alt="Account"
        style={{ width: '30px', height: '30px' }}
      />
    </button>
    <p style={{ fontSize: '12px', marginTop: '5px' }}>Account</p>
  </div>
</div>

    </div>
    );
}

export default Index;