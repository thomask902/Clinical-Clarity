import { useRouter } from 'next/router';

export default function NewPage() {
  const router = useRouter();

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
      <h1>Here are the results for your Clincal Scenario! Good job!</h1>
      <p>This is the destination page after clicking the See Results Button.</p>
      <button
        onClick={() => router.push('/')} // Redirect back to home page
        style={{
          border: '2px solid black',
          padding: '10px',
          borderRadius: '15px',
          fontSize: '16px',
          width: '180px',
          height: '80px',
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
