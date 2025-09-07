import React from 'react';

const MessageInput = ({ input, setInput, sendMessage, isLoading }) => (
  <form
    onSubmit={sendMessage}
    className="p-4 bg-gray-50 flex items-center rounded-b-2xl border-t border-gray-200 relative z-10"
  >
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
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>
  </form>
);

export default MessageInput;
