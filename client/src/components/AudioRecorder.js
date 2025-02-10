import React, { useState, useRef } from 'react';

function AudioRecorder({ onTranscriptReady }) {
    const API_BASE_URL = 'http://localhost:8080'

    // if the microphone is recording or not: true/false
    const [isRecording, setIsRecording] = useState(false);
    
    // URL to the recorded audio. dynamically generated after the recording stops
    const [audioURL, setAudioURL] = useState(null);

    // stores raw audio data in a Blob. used to upload to backend flask
    const [audioBlob, setAudioBlob] = useState(null);

    // Media recorder instance, useRef to not re initialize it everytime
    const mediaRecorderRef = useRef(null);
    
    // array of chunks of audio recorded during recording process. when recording stops, combines into single audio file
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            
            // this triggers the user to allow the microphone, audio returned in 'stream'
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // creates media recorder instance to record audio from stream
            const mediaRecorder = new MediaRecorder(stream);
            
            // Saves the media recorder instance to be accessed later
            mediaRecorderRef.current = mediaRecorder;
            
            // Event that fires everytime the MediaRecorder has a chunk of recorded audio available
            // e.data contains the audio chunk, whihc is saved in chunksRef
            mediaRecorder.ondataavailable = (e) => {
                console.log("Chunk type is:", e.data.type);
                chunksRef.current.push(e.data);
            };

            // onstop = Event that fires everytime the recording stops. 
            mediaRecorder.onstop = () => {
                
                // create a blob: combines chunks of audio into single blob in the WAV format
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                
                // reset chunks to prepare for next recording
                chunksRef.current = [];
                
                // save audio blob to new blob. Updates the audioBlob state. 
                setAudioBlob(blob);

                // URL for blob, saves it there for playback
                setAudioURL(URL.createObjectURL(blob));
            };

            // starts recording audio
            mediaRecorder.start();

            // updates the state to indicate recording is in progress
            setIsRecording(true);
        } 
        
        // catch block: handles errors (e.g. if user denies mic access)
        catch (err) {
            console.error('Error accessing microphone:', err);
        }
    };

    // function is called when the stop recording button is clicked
    const stopRecording = () => {

        // if recording still
        if (mediaRecorderRef.current) {

            // stops the MediaRecorder, triggers 'onstop' event to process audio
            mediaRecorderRef.current.stop();

            // update state to say recording has stopped
            setIsRecording(false);
        }
    };
    
    // function is called when the 'upload audio' button is clicked
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

    // try this
    try {
        // post request to Flask backend
        // post = sending data to backend
        const response = await fetch(API_BASE_URL + '/upload_audio', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            alert(`The transcription is: ${data.transcript}`);
            
            //update call back function in scenario page
            if (onTranscriptReady) {
                onTranscriptReady(data.transcript);
            }

        } else {
            console.error(`Failed to upload:`, data.error);
        }

    // if error
    } catch (err) {
        console.error('Error uploading audio:', err);
    }
};
    // button 1: disabled = if already recording
    // button 2: disabled = if already not recording

    // if an audioURL exists, display it susing the <audio> function
    // uploadAudio is the fucntion i made to upload it to the backend. That gets called when click Upload audio button
    return (
        <div>
            <button onClick={startRecording} disabled={isRecording}                 
                style={{
                        padding: "10px 20px",
                        border: "2px solid black",
                        borderRadius: "5px",
                        backgroundColor: "white",
                        cursor: "pointer",
                        fontSize: "16px",
              }}>
                Start Recording
            </button>
            <button onClick={stopRecording} disabled={!isRecording}                 
                style={{
                    padding: "10px 20px",
                    border: "2px solid black",
                    borderRadius: "5px",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontSize: "16px",
              }}>
                Stop Recording
            </button>
            {audioURL && (
                <div>
                    <button onClick={uploadAudio}
                        style={{
                            padding: "10px 20px",
                            border: "2px solid black",
                            borderRadius: "5px",
                            backgroundColor: "white",
                            cursor: "pointer",
                            fontSize: "16px",
                        }}>
                            Upload Audio</button>
                </div>
            )}
        </div>
    );
}

export default AudioRecorder;