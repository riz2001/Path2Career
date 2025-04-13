import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { appId, serverSecret } from "./Config";
import Usernavbar1 from "./Usernavbar1";
import axios from "axios";
import RecordingNavbar from "./RecordingNavbar";

const Room = () => {
  const { roomid } = useParams();
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [recording, setRecording] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [isBottom, setIsBottom] = useState(false);

  // Function to handle scroll events
  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Check if the user has scrolled to the bottom
    setIsBottom(scrollTop + windowHeight >= documentHeight);
  };

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    // Cleanup function to remove event listener
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const startScreenRecording = async () => {
    try {
      // Capture display stream (screen)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
        audio: true, // This might capture system audio in some browsers
      });

      // Capture microphone audio separately
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Combine display video track and microphone audio track
      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      // Create MediaRecorder with the combined stream
      const mediaRecorder = new MediaRecorder(combinedStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        // Set download link for manual download if needed
        setDownloadLink(URL.createObjectURL(blob));
        await uploadRecording(blob);
        recordedChunksRef.current = []; // Clear recorded data
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting screen recording:", error);
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
    const timeSlotId = roomid; // Assuming room ID corresponds to time slot ID
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

  const meeting = (element) => {
    const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appId,
      serverSecret,
      roomid,
      Date.now().toString(),
      Date.now().toString()
    );

    const zc = ZegoUIKitPrebuilt.create(token);
    zc.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton: true,
      sharedLinks: [
        {
          name: "copylink",
          url: window.location.href,
        },
      ],
    });
  };

  return (
    <div>
      <Usernavbar1 />
      <div ref={meeting} style={{ width: "100vw", height: "100vh" }}></div>
      <br></br>
      <br></br>
      {/* Conditionally render RecordingNavbar when scrolled to the bottom */}
      {isBottom && (
        <RecordingNavbar
          recording={recording}
          startScreenRecording={startScreenRecording}
          stopScreenRecording={stopScreenRecording}
          downloadLink={downloadLink}
        />
      )}

      Recording Buttons
      {/* <div style={{ position: "fixed", bottom: 20, left: 20 }}>
        {!recording ? (
          <button onClick={startScreenRecording} style={{ padding: "10px", fontSize: "16px" }}>
            🎥 Start Recording
          </button>
        ) : (
          <button onClick={stopScreenRecording} style={{ padding: "10px", fontSize: "16px", backgroundColor: "red", color: "white" }}>
            ⏹ Stop Recording
          </button>
        )} */}

     
      
    </div>
  );
};

export default Room;
