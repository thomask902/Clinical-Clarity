/*
AudioRecorder Component:
This is a resuable React component that can be imported into multiple pages


Functions:

startRecording: 
- function is called when the start recording button is clicked
- creates 'stream' variable of audio stream, triggers users audio permissions on browser
- Creates mediaRecording instance
- Saves chunks into blob, of total audio

stopRecording: 
- function is called when the stop recording button is clicked
- triggers onstop event to process audio

uploadAudio: 
- function is called when the 'upload audio' button is clicked
- This uploads audio to the backend, and awaits a response, saves that text transcription


Returns:
Start Recording Button: to start recording, disabled = if already recording
Stop Recording Button: to stop recording, disabled = if already not recording
Upload Audio Button: calls uploadAudio function
*/


import React, { useState, useRef } from 'react';

function AudioRecorder({ onTranscriptReady }) {

    // using .env.local file for API base URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    // useState variables
    const [isRecording, setIsRecording] = useState(false); // if the microphone is recording or not: true/false
    const [audioURL, setAudioURL] = useState(null); // URL to the recorded audio. dynamically generated after the recording stops
    const [audioBlob, setAudioBlob] = useState(null); // stores raw audio data in a Blob. used to upload to backend flask

    const [showUploadRedo, setShowUploadRedo] = useState(false); //Controls Upload/Redo buttons updated (John Feb 12 )

    
    // useRef variables
    const mediaRecorderRef = useRef(null); // Media recorder instance, useRef to not re initialize it everytime
    const chunksRef = useRef([]); // array of chunks of audio recorded during recording process. when recording stops, combines into single audio file

    // startRecording: function, triggered on button click
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // this triggers the user to allow the microphone, audio returned in 'stream'
            const mediaRecorder = new MediaRecorder(stream); // creates media recorder instance to record audio from stream
            mediaRecorderRef.current = mediaRecorder; // Saves the media recorder instance to be accessed later
            
            // Event that fires everytime the MediaRecorder has a chunk of recorded audio available
            // e.data contains the audio chunk, whihc is saved in chunksRef
            mediaRecorder.ondataavailable = (e) => {
                console.log("Chunk type is:", e.data.type);
                chunksRef.current.push(e.data);
            };
            
            // onstop = Event that fires everytime the recording stops. 
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); // create a blob: combines chunks of audio into single blob in the WAV format
                chunksRef.current = []; // reset chunks to prepare for next recording
                setAudioBlob(blob); // save audio blob to new blob. Updates the audioBlob state. 
                setAudioURL(URL.createObjectURL(blob)); // URL for blob, saves it there for playback

                setShowUploadRedo(true); //Show Upload & Redo buttons after stopping
            };

            // starts recording audio
            mediaRecorder.start();
            setIsRecording(true); // updates the state to indicate recording is in progress
        }
        
        // catch block: handles errors (e.g. if user denies mic access)
        catch (err) {
            console.error('Error accessing microphone:', err);
        }
    };

    // stopRecording: function is called when the stop recording button is clicked
    const stopRecording = () => {

        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop(); // stops the MediaRecorder, triggers 'onstop' event to process audio
            setIsRecording(false); // update state to say recording has stopped
        }
    };
    
    // uploadAudio: function is called when the 'upload audio' button is clicked
    const uploadAudio = async () => {
        
        // checks if recording exists before uploading
        if (!audioBlob) {
            alert('No audio recorded!');
            return;
        }

        // formData = way to construct a set of key/value pairs represnting form fields and values
        const formData = new FormData();

        // key='audio', value=audioBlob, filename='recording.wav' (only have filename parameter when passing a File as the second parameter)
        formData.append('audio', audioBlob, 'recording.webm');

        try {
            // post request to Flask backend
            // post = sending data to backend
            const response = await fetch(API_BASE_URL + '/upload_audio', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json(); // save response from backend into "response" JSON

            if (response.ok) {
                alert(`The transcription is: ${data.transcript}`); // transcript is the key to the JSON returned by the backend
                
                // update call back function in scenario page
                if (onTranscriptReady) {
                    onTranscriptReady(data.transcript);
                }

            } else {
                console.error(`Failed to upload:`, data.error);
            }
        } catch (err) {
            console.error('Error uploading audio:', err);
        }
    };

    //Resets everything and switches back to "Start Recording"
    const handleRedo = () => {
        setIsRecording(false);
        setShowUploadRedo(false);
        setAudioBlob(null);
        setAudioURL(null);
    };

    return (
        <div>
            {/* Toggle Start/Stop Button */}
            {!showUploadRedo ? (
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    style={{
                        border: '2px solid black',
                        padding: '12px',
                        borderRadius: '15px',
                        fontSize: '18px',
                        width: '200px',
                        height: '80px',
                        cursor: 'pointer',
                        backgroundColor: isRecording ? 'red' : '#0070f3',
                        color: 'white',
                    }}
                >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
            ) : (
                // Show Upload & Redo Buttons after stopping
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                        onClick={uploadAudio}
                        style={{
                            border: '2px solid black',
                            padding: '12px',
                            borderRadius: '15px',
                            fontSize: '18px',
                            width: '180px',
                            height: '80px',
                            cursor: 'pointer',
                            backgroundColor: '#28a745',
                            color: 'white',
                        }}
                    >
                        Upload Audio
                    </button>
                    <button
                        onClick={handleRedo}
                        style={{
                            border: '2px solid black',
                            padding: '12px',
                            borderRadius: '15px',
                            fontSize: '18px',
                            width: '180px',
                            height: '80px',
                            cursor: 'pointer',
                            backgroundColor: '#dc3545',
                            color: 'white',
                        }}
                    >
                        Redo
                    </button>
                </div>
            )}
        </div>
    );
}

export default AudioRecorder;