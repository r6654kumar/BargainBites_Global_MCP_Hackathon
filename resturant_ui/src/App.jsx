import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// The main App component containing all logic and UI
const App = () => {
  // State to store the chat messages
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am a bargain aggregator agent. How can I assist you today?' }
  ]);
  // State for the user's input
  const [input, setInput] = useState('');
  // State to show a loading indicator while waiting for the response
  const [isLoading, setIsLoading] = useState(false);
  // Ref for the chat container to enable auto-scrolling
  const chatContainerRef = useRef(null);

  // Scroll to the bottom of the chat container whenever new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to handle sending a message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user's message to the chat
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // API endpoint from the user's image
      
      const targetUrl = 'https://bargainbites-aggregator-agent.onrender.com/chat';
      const apiUrl = targetUrl;
      
      const payload = {
        messages: [{
          role: 'user',
          content: userMessage.content
        }]
      };

      // Log the API URL and the payload being sent
      console.log('Sending request to:', apiUrl);
      console.log('Request payload:', payload);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // The proxy adds the necessary Access-Control-Allow-Origin header
        },
        // The body format is based on the user's provided image
        body: JSON.stringify(payload)
      });

      // Log the raw response object to check for connectivity
      console.log('Received response:', response);

      if (!response.ok) {
        // Log the full response body to help with debugging
        const errorText = await response.text();
        console.error('API call failed. Response status:', response.status);
        console.error('Response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Log the parsed JSON data to confirm a successful response
      console.log('Received JSON data:', data);

      // Add the assistant's reply to the chat
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Update the UI with a more informative error message
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: 'Sorry, I am unable to connect to the agent right now. Please check the console for more details.' }]);
    } finally {
      setIsLoading(false);
    }
  };

const foodEmojis = ['🍕', '🍔', '🍟', '🍗', '🌮', '🍣', '🍩', '🍦', '🍰', '🍿', '🥪'];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans overflow-hidden">
      {/* Vertical looping carousel on the left */}
      <div className="absolute top-0 left-0 w-1/12 h-full z-0 opacity-30 overflow-hidden">
        <div className="h-full flex flex-col justify-around animate-scroll-up-1">
          {foodEmojis.concat(foodEmojis).map((emoji, index) => (
            <span key={index} className="text-6xl text-center">
              {emoji}
            </span>
          ))}
        </div>
      </div>
      
      {/* Vertical looping carousel on the right */}
      <div className="absolute top-0 right-0 w-1/12 h-full z-0 opacity-30 overflow-hidden">
        <div className="h-full flex flex-col justify-around animate-scroll-up-2">
          {foodEmojis.concat(foodEmojis).map((emoji, index) => (
            <span key={index} className="text-6xl text-center">
              {emoji}
            </span>
          ))}
        </div>
      </div>

      {/* Main content container with higher z-index */}
      <div className="relative z-10 text-center mb-6">
        <div className="flex items-center justify-center">
          <span role="img" aria-label="pizza-icon" className="text-3xl">🍕🍳🍗🥩🍜🍨</span>
          <h1 className="text-4xl font-extrabold mx-4 text-purple-700 tracking-wide drop-shadow-lg">BargainBites</h1>
          <span role="img" aria-label="pizza-icon" className="text-3xl">🍕🍳🍗🥩🍜🍨</span>
        </div>
        <p className="text-lg text-gray-600 mt-2 font-medium">Your personal assistant for finding the best food deals..</p>
      </div>

      {/* Main chat box container with a food-themed border */}
      <div className="relative z-10 w-full max-w-lg flex flex-col h-[80vh] border-8 border-purple-600 rounded-3xl shadow-2xl overflow-hidden bg-white mx-auto">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cdefs%3E%3Cpattern id='foodPattern' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Ctext x='10' y='20' font-size='30'%3E🍕%3C/text%3E%3Ctext x='50' y='70' font-size='30'%3E🍟%3C/text%3E%3Ctext x='80' y='30' font-size='30'%3E🍗%3C/text%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23foodPattern)' /%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
          backgroundRepeat: 'repeat',
        }}></div>

        {/* Chat messages container */}
        <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-purple-100 scrollbar-thumb-purple-400 relative z-10">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start`}
            >
              {message.role !== 'user' && (
                <div className="flex-shrink-0 text-2xl mr-2 mt-1">
                  🍕
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl p-3 shadow-md ${
                  message.role === 'user'
                    ? 'bg-purple-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start items-start">
              <div className="flex-shrink-0 text-2xl mr-2 mt-1">
                🍕
              </div>
              <div className="max-w-[75%] rounded-2xl p-3 bg-gray-200 text-gray-600 shadow-md">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-fast-1"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-fast-2"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-fast-3"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message input form */}
        <form onSubmit={sendMessage} className="p-4 bg-gray-50 flex items-center rounded-b-2xl border-t border-gray-200 relative z-10">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="ml-3 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

// Custom keyframes and animation for pulse effect
const style = document.createElement('style');
style.innerHTML = `
  @keyframes pulse-fast {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .animate-pulse-fast-1 {
    animation: pulse-fast 1s infinite;
  }
  .animate-pulse-fast-2 {
    animation: pulse-fast 1s infinite 0.2s;
  }
  .animate-pulse-fast-3 {
    animation: pulse-fast 1s infinite 0.4s;
  }
  /* Custom scrollbar for Webkit browsers */
  .scrollbar-thin::-webkit-scrollbar {
    width: 8px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f3e8ff;
    border-radius: 10px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #a78bfa;
    border-radius: 10px;
    border: 2px solid #f3e8ff;
  }
  /* Tailwind CSS override for body */
  body {
    background-color: #f3f4f6;
  }

  /* New keyframes for the vertical scrolling backgrounds */
  @keyframes scroll-up {
    0% { transform: translateY(0); }
    100% { transform: translateY(-50%); }
  }
  .animate-scroll-up-1 {
    animation: scroll-up 20s linear infinite;
  }
  .animate-scroll-up-2 {
    animation: scroll-up 25s linear infinite; /* Slightly different speed */
  }
`;
document.head.appendChild(style);

const tailwindScript = document.createElement('script');
tailwindScript.src = 'https://cdn.tailwindcss.com';
document.head.appendChild(tailwindScript);

let root;
const container = document.getElementById('root');
if (!root) {
  root = createRoot(container);
}
root.render(<App />);

export default App;
