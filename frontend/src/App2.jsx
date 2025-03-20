// import React, { useState, useEffect, useRef } from 'react';
// import './App.css';

// function App() {
//   const [isListening, setIsListening] = useState(false);
//   const [prediction, setPrediction] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [query, setQuery] = useState('');
//   const [isQueryMode, setIsQueryMode] = useState(false);
//   const [isQueryCapturing, setIsQueryCapturing] = useState(false);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const recognitionRef = useRef(null);

//   // Initialize speech recognition
//   useEffect(() => {
//     setupSpeechRecognition();
    
//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     };
//   }, []);

//   // Set up speech recognition with restart capability
//   const setupSpeechRecognition = () => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       recognitionRef.current = new SpeechRecognition();
//       recognitionRef.current.continuous = true;
//       recognitionRef.current.interimResults = false;
      
//       recognitionRef.current.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
//         console.log('Heard:', transcript);
        
//         if (isQueryCapturing) {
//           // If we're capturing a query, check if the user has finished
//           if (transcript.includes('query finished')) {
//             setIsQueryCapturing(false);
//             if (query && capturedImage) {
//               sendImageAndQuery();
//             }
//           } else {
//             // Set the query text
//             setQuery(transcript);
//           }
//         } else {
//           // Listen for commands
//           if (transcript.includes('capture')) {
//             captureImage();
//           } else if (transcript.includes('query') && capturedImage) {
//             startQueryCapture();
//           }
//         }
//       };
      
//       recognitionRef.current.onerror = (event) => {
//         console.error('Speech recognition error:', event.error);
//         // Try to restart if it's not a permission error
//         if (event.error !== 'not-allowed') {
//           restartSpeechRecognition();
//         }
//       };
      
//       recognitionRef.current.onend = () => {
//         console.log('Speech recognition ended. Attempting to restart...');
//         restartSpeechRecognition();
//       };
      
//       try {
//         recognitionRef.current.start();
//         setIsListening(true);
//         console.log('Speech recognition started');
//       } catch (err) {
//         console.error('Error starting speech recognition:', err);
//       }
//     } else {
//       console.error('Speech recognition not supported in this browser');
//     }
//   };
  
//   // Restarts speech recognition if it stops
//   const restartSpeechRecognition = () => {
//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.start();
//         setIsListening(true);
//         console.log('Speech recognition restarted');
//       } catch (err) {
//         console.error('Error restarting speech recognition:', err);
//         // If we couldn't restart, try again after a short delay
//         setTimeout(() => {
//           try {
//             recognitionRef.current.start();
//             setIsListening(true);
//             console.log('Speech recognition restarted after delay');
//           } catch (innerErr) {
//             console.error('Failed to restart speech recognition after delay:', innerErr);
//             setIsListening(false);
//           }
//         }, 1000);
//       }
//     }
//   };

//   // Start camera stream
//   useEffect(() => {
//     startCamera();
    
//     return () => {
//       if (videoRef.current && videoRef.current.srcObject) {
//         const tracks = videoRef.current.srcObject.getTracks();
//         tracks.forEach(track => track.stop());
//       }
//     };
//   }, []);

//   // Text-to-speech for prediction result and system prompts
//   useEffect(() => {
//     if (prediction) {
//       speakText(prediction);
//     }
//   }, [prediction]);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { facingMode: 'environment' } 
//       });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     } catch (err) {
//       console.error('Error accessing camera:', err);
//     }
//   };

//   const captureImage = () => {
//     if (!videoRef.current || !canvasRef.current) return;
    
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
    
//     // Set canvas dimensions to match video
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
    
//     // Draw current video frame to canvas
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
//     // Convert canvas to blob
//     canvas.toBlob((blob) => {
//       if (!blob) {
//         console.error('Failed to create image blob');
//         return;
//       }
      
//       setCapturedImage(blob);
//       speakText("Image captured. Say 'query' to ask a question about this image.");
      
//     }, 'image/jpeg', 0.95);
//   };

//   const startQueryCapture = () => {
//     setIsQueryMode(true);
//     setIsQueryCapturing(true);
//     speakText("Say your query now. When finished, say 'query finished'.");
//   };
  
//   const sendImageAndQuery = async () => {
//     if (!capturedImage || !query) {
//       speakText("Missing image or query. Please try again.");
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       const formData = new FormData();
//       formData.append('file', capturedImage, 'capture.jpg');
//       formData.append('query', query);
      
//       const response = await fetch('http://localhost:8000/process', {
//         method: 'POST',
//         body: formData,
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error ${response.status}`);
//       }
      
//       const data = await response.json();
//       setPrediction(data.response);
      
//       // Reset for a new interaction
//       setQuery('');
//       setIsQueryMode(false);
      
//     } catch (err) {
//       console.error('Error submitting data:', err);
//       setPrediction('Error processing request');
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   const speakText = (text) => {
//     if ('speechSynthesis' in window) {
//       // Cancel any ongoing speech
//       window.speechSynthesis.cancel();
      
//       const utterance = new SpeechSynthesisUtterance(text);
//       window.speechSynthesis.speak(utterance);
//     } else {
//       console.error('Text-to-speech not supported in this browser');
//     }
//   };

//   const resetCapture = () => {
//     setCapturedImage(null);
//     setQuery('');
//     setIsQueryMode(false);
//     setIsQueryCapturing(false);
//     setPrediction('');
//   };

//   return (
//     <div className="app-container">
//       <h1>Image Recognition with Queries</h1>
      
//       <div className="video-container">
//         {capturedImage ? (
//           <div className="captured-image-container">
//             <img 
//               src={URL.createObjectURL(capturedImage)} 
//               alt="Captured" 
//               className="captured-image" 
//             />
//             <button 
//               className="retake-button"
//               onClick={resetCapture}
//             >
//               Retake Photo
//             </button>
//           </div>
//         ) : (
//           <>
//             <video 
//               ref={videoRef} 
//               autoPlay 
//               playsInline 
//               muted
//             />
//             <div className="capture-overlay">Say "capture" to take a photo</div>
//           </>
//         )}
//         <canvas ref={canvasRef} style={{ display: 'none' }} />
//       </div>
      
//       <div className="status-container">
//         <div className={`status-indicator ${isListening ? 'active' : 'inactive'}`}>
//           {isListening ? 
//             (isQueryCapturing ? 
//               'Capturing query... Say "query finished" when done' : 
//               capturedImage ? 
//                 'Image captured. Say "query" to ask a question about the image' : 
//                 'Listening... Say "capture" to take a photo'
//             ) : 
//             'Speech recognition inactive - Please refresh the page'
//           }
//         </div>
        
//         {query && (
//           <div className="query-display">
//             <h3>Current Query:</h3>
//             <p>{query}</p>
//           </div>
//         )}
        
//         {isLoading && <div className="loading-indicator">Processing request...</div>}
        
//         {prediction && (
//           <div className="prediction-result">
//             <h2>Response:</h2>
//             <p>{prediction}</p>
//           </div>
//         )}
        
//         {!isListening && (
//           <button 
//             className="restart-button"
//             onClick={setupSpeechRecognition}
//           >
//             Restart Speech Recognition
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;   











// import React, { useEffect, useRef, useState } from "react";
// import axios from "axios";

// const App = () => {
//   const videoRef = useRef(null);
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [query, setQuery] = useState("");
//   const [capturingQuery, setCapturingQuery] = useState(false);

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
//         sendData();
//       }
//     };

//     recognition.start();
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
//       canvas.toBlob((blob) => setCapturedImage(blob), "image/png");
//       speakText("Image captured");
//     }
//   };

//   const sendData = async () => {
//     if (!capturedImage && !query) {
//       speakText("No image and query found. Please try again.");
//       return;
//     }
//     if ( !query) {
//       speakText("No query found. Please try again.");
//       return;
//     }
//     if (!capturedImage) {
//       speakText("No image found. Please try again.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", capturedImage, "capture.png");
//     formData.append("query", query);

//     try {
//       const response = await axios.post("http://127.0.0.1:8000/process", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       speakText(response.data.response);
//     } catch (error) {
//       console.error("Error sending data:", error);
//     }
//   };

//   const speakText = (text) => {
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












// import React, { useEffect, useRef, useState } from "react";
// import axios from "axios";

// const App = () => {
//   const videoRef = useRef(null);
//   const [capturing, setCapturing] = useState(false);

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
//       if (transcript === "capture" && !capturing) {
//         setCapturing(true);
//         captureImage();
//       }
//     };

//     recognition.start();
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
//       canvas.toBlob(sendImage, "image/png");
//     }
//   };

//   const sendImage = async (blob) => {
//     const formData = new FormData();
//     formData.append("file", blob, "capture.png");

//     try {
//       const response = await axios.post("http://127.0.0.1:8000/predict", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       speakText(response.data.text);
//     } catch (error) {
//       console.error("Error sending image:", error);
//     } finally {
//       setCapturing(false);
//     }
//   };

//   const speakText = (text) => {
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






// import React, { useState, useEffect, useRef } from 'react';
// import './App.css';

// function App() {
//   const [isListening, setIsListening] = useState(false);
//   const [prediction, setPrediction] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const recognitionRef = useRef(null);

//   // Initialize speech recognition
//   useEffect(() => {
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       recognitionRef.current = new SpeechRecognition();
//       recognitionRef.current.continuous = true;
//       recognitionRef.current.interimResults = false;
      
//       recognitionRef.current.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
//         console.log('Heard:', transcript);
        
//         if (transcript.includes('capture')) {
//           captureImage();
//         }
//       };
      
//       recognitionRef.current.onerror = (event) => {
//         console.error('Speech recognition error:', event.error);
//       };
//     } else {
//       console.error('Speech recognition not supported in this browser');
//     }
    
//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     };
//   }, []);

//   // Start camera stream
//   useEffect(() => {
//     startCamera();
    
//     return () => {
//       if (videoRef.current && videoRef.current.srcObject) {
//         const tracks = videoRef.current.srcObject.getTracks();
//         tracks.forEach(track => track.stop());
//       }
//     };
//   }, []);

//   // Start listening automatically
//   useEffect(() => {
//     startListening();
//   }, []);

//   // Text-to-speech for prediction result
//   useEffect(() => {
//     if (prediction) {
//       speakText(prediction);
//     }
//   }, [prediction]);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { facingMode: 'environment' } 
//       });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     } catch (err) {
//       console.error('Error accessing camera:', err);
//     }
//   };

//   const startListening = () => {
//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.start();
//         setIsListening(true);
//       } catch (err) {
//         console.error('Error starting speech recognition:', err);
//       }
//     }
//   };

//   const captureImage = () => {
//     if (!videoRef.current || !canvasRef.current) return;
    
//     setIsLoading(true);
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
    
//     // Set canvas dimensions to match video
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
    
//     // Draw current video frame to canvas
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
//     // Convert canvas to blob and send to API
//     canvas.toBlob(async (blob) => {
//       if (!blob) {
//         console.error('Failed to create image blob');
//         setIsLoading(false);
//         return;
//       }
      
//       try {
//         const formData = new FormData();
//         formData.append('file', blob, 'capture.jpg');
        
//         const response = await fetch('http://localhost:8000/predict', {
//           method: 'POST',
//           body: formData,
//         });
        
//         if (!response.ok) {
//           throw new Error(`HTTP error ${response.status}`);
//         }
        
//         const data = await response.json();
//         setPrediction(data.prediction);
//       } catch (err) {
//         console.error('Error submitting image:', err);
//         setPrediction('Error processing image');
//       } finally {
//         setIsLoading(false);
//       }
//     }, 'image/jpeg', 0.95);
//   };
  
//   const speakText = (text) => {
//     if ('speechSynthesis' in window) {
//       const utterance = new SpeechSynthesisUtterance(text);
//       window.speechSynthesis.speak(utterance);
//     } else {
//       console.error('Text-to-speech not supported in this browser');
//     }
//   };

//   return (
//     <div className="app-container">
//       <h1>Image Recognition App</h1>
      
//       <div className="video-container">
//         <video 
//           ref={videoRef} 
//           autoPlay 
//           playsInline 
//           muted
//         />
//         <canvas ref={canvasRef} style={{ display: 'none' }} />
//       </div>
      
//       <div className="status-container">
//         <div className={`status-indicator ${isListening ? 'active' : 'inactive'}`}>
//           {isListening ? 'Listening... Say "capture" to take a photo' : 'Speech recognition inactive'}
//         </div>
        
//         {isLoading && <div className="loading-indicator">Processing image...</div>}
        
//         {prediction && (
//           <div className="prediction-result">
//             <h2>Prediction:</h2>
//             <p>{prediction}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;