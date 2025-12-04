import React, { useEffect, useRef, useState } from "react";
import { speechToText } from "../api.js";

export function VoiceRecorder({ onResult, disabled }) {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setSupported(false);
    }
  }, []);

  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          setProcessing(true);
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const { transcript } = await speechToText(blob);
          onResult(transcript);
        } catch (e) {
          console.error(e);
          setError("Failed to process audio. Please try again.");
        } finally {
          setProcessing(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (e) {
      console.error(e);
      setError("Could not access microphone.");
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const handleToggle = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!supported) {
    return (
      <button className="btn btn-secondary" disabled>
        Voice not supported
      </button>
    );
  }

  return (
    <div className="voice-recorder">
      <button
        className={`btn ${recording ? "btn-danger" : "btn-primary"}`}
        onClick={handleToggle}
        disabled={disabled || processing}
      >
        {recording ? "Stop Recording" : "Record Voice"}
      </button>
      {processing && (
        <div className="error-text">Processing speech to text...</div>
      )}
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}


