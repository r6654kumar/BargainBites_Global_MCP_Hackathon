import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './components/Header';
import EmojiBackground from './components/EmojiBackground';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import Login from './components/Login';
import './styles.css';
import { useSession, useUser, useDescope } from '@descope/react-sdk';
import { getSessionToken } from '@descope/react-sdk';

const App = () => {
  const { isAuthenticated, isSessionLoading } = useSession();
  const { user, isUserLoading } = useUser();

  const { logout } = useDescope();

  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am a bargain aggregator agent. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e) => {
    const sessionToken = await getSessionToken();
    // console.log("Extracted Session Token", sessionToken);
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = 'https://bargainbites-aggregator-agent.onrender.com/chat';
      // const apiUrl = `http://localhost:8000/chat`;
      const payload = { messages: [{ role: 'user', content: userMessage.content }] };
      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + sessionToken,
      }
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I am unable to connect to the agent right now.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  if (isSessionLoading || isUserLoading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">Loading...</div>;
  }

  const foodEmojis = ['🍕', '🍔', '🍟', '🍗', '🌮', '🍣', '🍩', '🍦', '🍰', '🍿', '🥪'];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans overflow-hidden">
      <EmojiBackground foodEmojis={foodEmojis} />
      <Header />

      {!isAuthenticated ? (
        <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-xl shadow-xl">
          <Login />
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-lg flex flex-col h-[80vh] border-8 border-purple-600 rounded-3xl shadow-2xl overflow-hidden bg-white mx-auto">
          {/* ✅ User Profile Section */}
          <div className="flex items-center justify-between bg-purple-600 text-white px-4 py-2">
            <div>
              <p className="font-semibold">{user?.name || "Anonymous User"}</p>
              <p className="text-xs">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
            >
              Logout
            </button>
          </div>

          {/* Chat Section */}
          <ChatWindow ref={chatContainerRef} messages={messages} isLoading={isLoading} />
          <MessageInput input={input} setInput={setInput} sendMessage={sendMessage} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
};

export default App;
