import React, { forwardRef } from 'react';
import Message from './Message';

const ChatWindow = forwardRef(({ messages, isLoading }, ref) => (
  <div
    ref={ref}
    className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-purple-100 scrollbar-thumb-purple-400 relative z-10"
  >
    {messages.map((message, index) => (
      <Message key={index} message={message} />
    ))}

    {isLoading && (
      <div className="flex justify-start items-start">
        <div className="flex-shrink-0 text-2xl mr-2 mt-1">🍕</div>
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
));

export default ChatWindow;
