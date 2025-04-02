import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const App = () => {
  const videoRef = useRef(null);
  const capturedImageRef = useRef(null); 
  const queryRef = useRef(""); 
  const recognitionRef = useRef(null);
  const triggerRecognitionRef = useRef(null);
  const isCapturingQueryRef = useRef(false); 
  const [listening, setListening] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const triggerListening = useRef(true);
  let silenceTimeout;

  const [capturingQuery, setCapturingQuery] = useState(false);

  useEffect(() => {
      startTriggerRecognition();
      startCamera();
      setTimeout(() => {
        
        
      }, 500);
  }, []);




  const startTriggerRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    triggerRecognitionRef.current = new SpeechRecognition();
    triggerRecognitionRef.current.continuous = true;
    triggerRecognitionRef.current.lang = "en-US";

    triggerRecognitionRef.current.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log("🔍 Trigger Word Heard:", transcript);

      if (transcript === "assistant") {
        speakText("I am listening...");
        // speakText("Say capture the image to xcapture and query to save them");
        setTimeout(() => {
            triggerListening.current=false; 
            triggerRecognitionRef.current.stop() ;
            startSpeechRecognition(); // ✅ Start full recognition
        }, 1000);
      }
    };

    triggerRecognitionRef.current.onend = () => {
        console.log("🔄 Trigger recognition ended. Restarting...");
        if(triggerListening.current==true){
        triggerRecognitionRef.current.start();
    }
      };

      triggerRecognitionRef.current.start();
    console.log("🎤 Listening for trigger word...");
  };





  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        console.log("🎙️ Recognized:", transcript);
  
        if (transcript === "capture") {
            queryRef.current = "" ; 
          captureImage();
        } else {
          queryRef.current += transcript + " ";
          console.log("Current query:", queryRef.current);
  
          // Clear previous timeout if user is still talking
          if (silenceTimeout) clearTimeout(silenceTimeout);
  
          // Detect silence (2s pause) to finalize query
          silenceTimeout = setTimeout(() => {
            console.log("⏳ Detected silence. Sending query:", queryRef.current);
            finalizeAndSend();
            
            console.log("started recognising")
          }, 2000); // 2 seconds silence
        }
      };

      recognitionRef.current.onend = () => {
        console.log("🔄 Trigger recognition ended. Restarting...");
        recognitionRef.current.start();
      };
  
      recognitionRef.current.start();
   
      setListening(true);
      console.log("🎤 Now actively listening for questions...");
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const captureImage = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    if (video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        console.log("✅ Image captured and stored.");
        setIsCaptured(true) ;
        capturedImageRef.current = blob;
      }, "image/png");
    }
  };

  const finalizeAndSend = () => {
    console.log("🔎 Checking stored values before sending...");
    console.log("Stored Image:", capturedImageRef.current);
    console.log("Stored Query:", queryRef.current);

    
    if (!queryRef.current.trim()) {
      speakText("No query found. Please say your query first.");
      console.error("❌ Error: No query found.");
      return;
    }

    if (!capturedImageRef.current) {
      speakText("sending only query");
      console.error("sending only query");
      setTimeout(() => {
        sendQuery(queryRef.current)
        queryRef.current = "";
        
      }, 1000);


      
    }else{
    sendData(capturedImageRef.current, queryRef.current);
    queryRef.current = "";}
  };

  const sendData = async (image, queryText) => {
    const formData = new FormData();
    formData.append("file", image, "capture.png");
    formData.append("query", queryText);

    try {
      console.log("🚀 Sending image and query to backend...");
      const response = await axios.post(import.meta.env.VITE_API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("✅ Response received:", response.data);

      speakText(response.data.response);
    } catch (error) {
      console.error("❌ Error sending data:", error);
    }
  };
  const sendQuery = async ( queryText) => {
    const formData = new FormData();
    
    formData.append("query", queryText);

    try {
      console.log("🚀 Sending image and query to backend...");
      const response = await axios.post(import.meta.env.VITE_API_URL_QUERY, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("✅ Response received:", response.data);

      speakText(response.data.response);
    } catch (error) {
      console.error("❌ Error sending data:", error);
    }
  };

  const speakText = (text) => {
    console.log("🔊 Speaking:", text);
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  return (
    <div>
      <h1>Speech Web App</h1>
      <h4>Trigger Word - Hey Assitant</h4>
      <h4>To capture Img - Capture</h4>
      <h5>Then say the queries you want to ask</h5>
      <p>Status: {listening ? "Listening for questions..." : "Waiting for trigger word..."} {isCaptured? "an image is alredy captured say capture again to capture a new image " :"no image captured " } </p>
      <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }}></video>
    </div>
  );
};

export default App;