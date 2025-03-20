import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const App = () => {
  const videoRef = useRef(null);
  const capturedImageRef = useRef(null); 
  const queryRef = useRef(""); 
  const recognitionRef = useRef(null);
  const isCapturingQueryRef = useRef(false); 
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

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log("🔍 Trigger Word Heard:", transcript);

      if (transcript === "hey assistant") {
        speakText("I am listening...");
        // speakText("Say capture the image to xcapture and query to save them");
        startSpeechRecognition(); // ✅ Start full recognition
      }
    };

    recognition.start();
    console.log("🎤 Listening for trigger word...");
  };





  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        console.log("Recognized:", transcript);
      
        if (transcript === "capture") {
          captureImage();
        } else if (transcript === "query") {
          speakText("Say the query");
          setCapturingQuery(true);
          isCapturingQueryRef.current = true; 
          queryRef.current = ""; // Reset query before recording
        } else if ( transcript.includes("finished")) {
          // Don't add "query finished" to the query text
          isCapturingQueryRef.current = false; 
          setCapturingQuery(false);
          console.log("Final query stored:", queryRef.current);
      
          // Delay finalizing to ensure query is captured
          setTimeout(() => {
            finalizeAndSend();
          }, 500);
        } else if (isCapturingQueryRef.current) {
          // Only append to query if we're capturing and it's not a command
          queryRef.current += transcript + " ";
          console.log("Current query:", queryRef.current);
        }
      }

    // recognition.onresult = (event) => {
    //   const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    //   console.log("Recognized:", transcript);

    //   if (transcript === "capture") {
    //     captureImage();
    //   } else if (transcript === "query") {
    //     speakText("Say the query");
    //     setCapturingQuery(true);
    //     queryRef.current = ""; // ✅ Reset query before recording
    //   } else if (capturingQuery && transcript !== "query finished") {
    //     queryRef.current += transcript + " "; // ✅ Append to query
    //     console.log("Current query:", queryRef.current);
    //   } else if (transcript === "query finished") {
    //     setCapturingQuery(false);
    //     console.log("Final query stored:", queryRef.current);

    //     // ✅ Delay finalizing to ensure query is captured
    //     setTimeout(() => {
    //       if (queryRef.current.trim()) {
    //         finalizeAndSend();
    //       } else {
    //         console.error("❌ Error: Query was not stored properly!");
    //         speakText("No query found. Please try again.");
    //       }
    //     }, 1000);
    //   }
    // };

    recognition.start();
    recognitionRef.current = recognition;
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
        capturedImageRef.current = blob;
      }, "image/png");
    }
  };

  const finalizeAndSend = () => {
    console.log("🔎 Checking stored values before sending...");
    console.log("Stored Image:", capturedImageRef.current);
    console.log("Stored Query:", queryRef.current);

    if (!capturedImageRef.current) {
      speakText("No image found. Please capture an image first.");
      console.error("❌ Error: No image found.");
      return;
    }

    if (!queryRef.current.trim()) {
      speakText("No query found. Please say your query first.");
      console.error("❌ Error: No query found.");
      return;
    }

    sendData(capturedImageRef.current, queryRef.current);
  };

  const sendData = async (image, queryText) => {
    const formData = new FormData();
    formData.append("file", image, "capture.png");
    formData.append("query", queryText);

    try {
      console.log("🚀 Sending image and query to backend...");
      const response = await axios.post("http://127.0.0.1:8000/process", formData, {
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
      <h1>Speech & OCR Web App</h1>
      <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }}></video>
    </div>
  );
};

export default App;







// import React, { useEffect, useRef, useState } from "react";
// import axios from "axios";

// const App = () => {
//   const videoRef = useRef(null);
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [query, setQuery] = useState("");
//   const [capturingQuery, setCapturingQuery] = useState(false);
//   const recognitionRef = useRef(null);


//   useEffect(() => {
//     // Only send data when both capturedImage and query are updated
//     if (capturedImage && query) {
//       console.log("Both Image and Query are ready, sending data...");
//       sendData();
//     }
//   }, [capturedImage, query]);







//   useEffect(() => {
//     startSpeechRecognition();
//     startCamera();
//   }, []);

//   const startSpeechRecognition = () => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Speech Recognition not supported in this browser.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.lang = "en-US";

//     recognition.onresult = (event) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
//       console.log("Recognized:", transcript);

//       if (transcript === "capture") {
//         captureImage();
//       } else if (transcript === "query") {
//         speakText("Say the query");
//         setCapturingQuery(true);
//         setQuery(""); // Reset query
//       } else if (capturingQuery && transcript !== "query finished") {
//         setQuery((prevQuery) => (prevQuery ? prevQuery + " " + transcript : transcript));
//       } else if (transcript === "query finished") {
//         setCapturingQuery(false);
//         // sendData();
//       }
//     };

//     recognition.start();
//     recognitionRef.current = recognition;
//   };

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     } catch (error) {
//       console.error("Error accessing camera:", error);
//     }
//   };

//   const captureImage = () => {
//     const canvas = document.createElement("canvas");
//     const video = videoRef.current;
//     if (video) {
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//       canvas.toBlob((blob) => {
//         setCapturedImage(blob);
//         speakText("Image captured");
//         console.log("Image stored in state.");
//       }, "image/png");
//     }
//   };

//   const sendData = async () => {
//     if (!capturedImage && !query) {
//         speakText("No image and query found. Please try again.");
//         return;
//       }
//     if (!capturedImage) {
//       speakText("No image found. Please capture an image first.");
//       console.error("Error: No image found.");
//       return;
//     }

//     if (!query.trim()) {
//       speakText("No query found. Please say your query first.");
//       console.error("Error: No query found.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", capturedImage, "capture.png");
//     formData.append("query", query);

//     try {
//       console.log("Sending image and query to backend...");
//       const response = await axios.post("http://127.0.0.1:8000/process", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       console.log("Response received:", response.data);
//       speakText(response.data.response);
//     } catch (error) {
//       console.error("Error sending data:", error);
//     }
//   };

//   const speakText = (text) => {
//     console.log("Speaking:", text);
//     const utterance = new SpeechSynthesisUtterance(text);
//     speechSynthesis.speak(utterance);
//   };

//   return (
//     <div>
//       <h1>Speech & OCR Web App</h1>
//       <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }}></video>
//     </div>
//   );
// };

// export default App;
