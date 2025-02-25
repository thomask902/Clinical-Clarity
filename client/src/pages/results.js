import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState(null);

  useEffect(() => {
    // Retrieve stored results from localStorage
    const storedResults = localStorage.getItem('scenario_results');

    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      alert("No results found. Redirecting to home...");
      router.push('/');
    }
  }, []);

  if (!results) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Loading Results...</h1>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        flexDirection: 'column',
      }}
    >
       <h1 style={{ fontSize: '36px', fontWeight: 'bold' }}>Results for Your Clinical Scenario</h1>
       <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>Great Job!</h2>

       <div
        style={{
          border: '2px solid #0070f3',
          borderRadius: '10px',
          padding: '20px',
          width: '40%', // Made it smaller
          backgroundColor: '#f0f8ff',
          boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px',
        }}
      >
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
          <strong>Score:</strong> {(results.num_correct / results.num_prompts * 100).toFixed(1)}%
        </p>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
          <strong>Correct Answers:</strong> {results.num_correct} / {results.num_prompts}
        </p>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
          <strong>Feedback:</strong> Great work!
        </p>
      </div>


      <button
        onClick={() => router.push('/')}
        style={{
          border: '2px solid black',
          padding: '12px',
          borderRadius: '15px',
          fontSize: '18px',
          width: '200px',
          height: '70px',
          cursor: 'pointer',
          marginTop: '20px',
          backgroundColor: '#0070f3',
          color: 'white',
        }}
      >
        Back to Home
      </button>
    </div>
  );
}
