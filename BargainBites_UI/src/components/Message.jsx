import React from 'react';

const Message = ({ message }) => (
  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start`}>
    {message.role !== 'user' && (
      <div className="flex-shrink-0 text-2xl mr-2 mt-1">🍕</div>
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
);

export default Message;
