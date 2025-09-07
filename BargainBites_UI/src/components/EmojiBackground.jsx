import React from 'react';

const EmojiBackground = ({ foodEmojis }) => (
  <>
    {/* Left column */}
    <div className="absolute top-0 left-0 w-1/12 h-full z-0 opacity-30 overflow-hidden">
      <div className="h-full flex flex-col justify-around animate-scroll-up-1">
        {foodEmojis.concat(foodEmojis).map((emoji, index) => (
          <span key={`left-${index}`} className="text-6xl text-center">{emoji}</span>
        ))}
      </div>
    </div>

    {/* Right column */}
    <div className="absolute top-0 right-0 w-1/12 h-full z-0 opacity-30 overflow-hidden">
      <div className="h-full flex flex-col justify-around animate-scroll-up-2">
        {foodEmojis.concat(foodEmojis).map((emoji, index) => (
          <span key={`right-${index}`} className="text-6xl text-center">{emoji}</span>
        ))}
      </div>
    </div>
  </>
);

export default EmojiBackground;
