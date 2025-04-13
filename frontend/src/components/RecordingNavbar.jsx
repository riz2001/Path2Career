// src/components/RecordingNavbar.jsx
import React, { useState, useRef } from "react";
import axios from "axios";

const RecordingNavbar = () => {
  const [recording, setRecording] = useState(false);
  const [downloadLink, setDownloadLink] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  

  const startScreenRecording = async () => {
    try {
      // Request screen capture
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
        audio: true,
      });

      // Capture microphone audio
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Combine screen and audio streams
      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      // Create a media recorder with the combined stream
      const mediaRecorder = new MediaRecorder(combinedStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const videoURL = URL.createObjectURL(blob);
        setDownloadLink(videoURL); // Set download link
        await uploadRecording(blob); // Upload file
        recordedChunksRef.current = [];
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error starting screen recording:", err);
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const uploadRecording = async (blob) => {
    const userId = sessionStorage.getItem('userId'); // Retrieve user ID from session storage
    const timeSlotId = 1253647475575; // Assuming room ID corresponds to time slot ID
    const file = new File([blob], "recording.webm", { type: "video/webm" });
    const formData = new FormData();
    formData.append("videoFile", file);
    formData.append("userId", userId);
    formData.append("timeSlotId", timeSlotId);

    try {
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Recording uploaded successfully!");
    } catch (error) {
      console.error("Error uploading recording:", error);
      alert("Error uploading recording.");
    }
  };

  return (
    <div style={styles.container}>
      {!recording ? (
        <button onClick={startScreenRecording} style={styles.button}>
          🎥 Start Recording
        </button>
      ) : (
        <button onClick={stopScreenRecording} style={{ ...styles.button, backgroundColor: "red", color: "#fff" }}>
          ⏹ Stop Recording
        </button>
      )}
      {downloadLink && (
        <a href={downloadLink} download="recording.webm" style={styles.link}>
          ⬇️ Download Recording
        </a>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    color: "#fff",
    padding: "10px",
    textAlign: "center",
    zIndex: 1000,
  },
  button: {
    padding: "10px 15px",
    fontSize: "16px",
    marginRight: "10px",
    cursor: "pointer",
    border: "none",
    borderRadius: "4px",
  },
  link: {
    color: "#fff",
    textDecoration: "underline",
    fontSize: "16px",
  },
};

export default RecordingNavbar;
