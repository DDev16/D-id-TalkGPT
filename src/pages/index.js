// Home.js
import React, { useState, useCallback } from "react";
import axios from "axios";
import TypingAnimation from "../components/TypingAnimation";
import useSpeechRecognition from "../components/useSpeechRecognition"; // Ensure the path matches where you save the hook

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [presenterContent, setPresenterContent] = useState({ type: 'image', url: 'https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg' });
  const handleTranscript = useCallback((transcript) => {
    setInputValue(transcript);
    sendMessage(transcript);
  }, []);

  const { isListening, setIsListening } =
    useSpeechRecognition(handleTranscript);

  const handleSubmit = (event) => {
    event.preventDefault();
    setChatLog((prevChatLog) => [
      ...prevChatLog,
      { type: "user", message: inputValue },
    ]);
    sendMessage(inputValue);
    setInputValue("");
  };

  // New event handlers for recording
  const startRecording = () => {
    setIsListening(true);
  };

  const stopRecording = () => {
    setIsListening(false);
  };

  const sendMessage = async (message) => {
    const chatUrl = "/api/chat";
    const dIdUrl = "https://api.d-id.com/talks";

    const chatData = {
      model: "gpt-3.5-turbo-0301",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "Your system message here",
        },
        {
          role: "user",
          content: message,
        },
      ],
    };

    setIsLoading(true);

    try {
      const chatResponse = await axios.post(chatUrl, chatData);
      const botMessage = chatResponse.data.choices[0].message.content;
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { type: "bot", message: botMessage },
      ]);

      const dIdData = {
        source_url:
          "https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg",
        script: {
          type: "text",
          input: botMessage,
        },
      };

      const dIdResponse = await axios.post(dIdUrl, dIdData, {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization:
            process.env.D_ID_API_KEY,
        },
      });

      console.log("D-ID Response:", dIdResponse.data);
      const dIdClipId = dIdResponse.data.id;
      console.log("D-ID Clip ID:", dIdClipId);

      // Function to poll for result_url
      const pollForResultUrl = async (url, attempts = 0, maxAttempts = 30) => {
        const result = await axios.get(url, {
          headers: {
            accept: "application/json",
            authorization:
            process.env.D_ID_API_KEY,
          },
        });

        if (result.data.result_url || attempts >= maxAttempts) {
          return result.data.result_url;
        } else {
          // Wait for 2 seconds before trying again
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return pollForResultUrl(url, attempts + 1, maxAttempts);
        }
      };

      // Construct the URL for the GET request
      const resultUrl = `${dIdUrl}/${dIdClipId}`;
      console.log("Polling Result URL:", resultUrl);

      // Poll for the result_url
      const finalResultUrl = await pollForResultUrl(resultUrl);

      if (finalResultUrl) {
        console.log("Final Result URL:", finalResultUrl);
        setPresenterContent({ type: 'video', url: finalResultUrl });
        setChatLog((prevChatLog) => [
          ...prevChatLog,
          { type: "video", videoUrl: finalResultUrl },
        ]);
      } else {
        console.error("Failed to retrieve result URL after maximum attempts.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

 
  return (
    <div className="container mx-auto max-w-[700px]">
      <div className="flex flex-col h-screen bg-gray-900">
        {/* Header */}
        <div className="flex-none">
          <h1 className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text text-center py-3 font-bold text-6xl">
            D-ID TalkGPT
          </h1>
        </div>
  
       {/* Presenter Bubble: Adjusted to be part of the layout but not fixed */}
<div className="flex-none self-center mt-4 mb-4">
  <div className="presenter-bubble w-48 h-48 rounded-full overflow-hidden border-2 border-white shadow-lg purple-glow">
    {presenterContent.type === 'image' ? (
      <img src={presenterContent.url} alt="Presenter" className="w-full h-full object-cover" />
    ) : (
      <video src={presenterContent.url} autoPlay className="w-full h-full object-cover"></video>
    )}
  </div>
</div>

  
        {/* Chat Log */}
        <div className="flex-grow p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 250px)" }}>
          <div className="flex flex-col space-y-4">
            {/* Messages */}
            {chatLog.map((message, index) => {
              if (message.type === "user" || message.type === "bot") {
                return (
                  <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`${message.type === "user" ? "bg-purple-500" : "bg-gray-800"} rounded-lg p-4 text-white max-w-sm`}>
                      {message.message}
                    </div>
                  </div>
                );
              }
            })}
            {isLoading && <TypingAnimation />}
            {isAudioPlaying && (
              <div className="flex justify-center">
                <div className="text-purple-300">🔊 Playing response...</div>
              </div>
            )}
          </div>
        </div>
  
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex-none p-6">
          <div className="flex rounded-lg border border-gray-700 bg-gray-800">
            <input type="text" className="flex-grow px-4 py-2 bg-transparent text-white focus:outline-none" placeholder="Type your message..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <button type="submit" className="bg-purple-500 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none hover:bg-purple-600 transition-colors duration-300">
              Send
            </button>
          </div>
        </form>
  
        {/* Button Container */}
        <div className="flex justify-center pb-4">
          {/* Record Button */}
          <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={`inline-flex ${isListening ? "bg-red-500" : "bg-blue-500"} hover:bg-${isListening ? "red-700" : "blue-700"} text-white font-bold rounded-full w-12 h-12 justify-center items-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
  
}  