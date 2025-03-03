import React, { useState, useRef } from "react";

function AudioRecorder({ onTranscriptReady }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];

        // Auto-upload after recording stops
        uploadAudio(blob);

        setHasRecorded(true); // Switch button to "Redo"
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Upload audio automatically after recording stops
  const uploadAudio = async (blob) => {
    if (!blob) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");

    try {
      const response = await fetch(`${API_BASE_URL}/upload_audio`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        if (onTranscriptReady) {
          onTranscriptReady(data.transcript);
        }
      } else {
        console.error("Failed to upload:", data.error);
      }
    } catch (err) {
      console.error("Error uploading audio:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Redo: Instantly start recording again
  const handleRedo = () => {
    setHasRecorded(false);
    setIsRecording(false);
    startRecording(); // Immediately starts a new recording
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : hasRecorded ? handleRedo : startRecording}
        className={`w-56 px-6 py-3 text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
          isRecording
            ? "bg-red-600 text-white animate-pulse" // Red and pulsing when recording
            : hasRecorded
            ? "button-secondary" // Turns into "Redo" after stopping
            : "button-primary" // Default Start Recording button
        }`}
      >
        {isRecording ? "Stop Recording" : hasRecorded ? "Redo" : "Start Recording"}
      </button>

      {/* Uploading Indicator */}
      {isUploading && <p className="text-gray-600">Uploading...</p>}
    </div>
  );
}

export default AudioRecorder;
