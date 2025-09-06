import React from 'react';

const Header = () => (
  <div className="relative z-10 text-center mb-6">
    <div className="flex items-center justify-center">
      <span role="img" aria-label="pizza-icon" className="text-3xl">🍕🍳🍗🥩🍜🍨</span>
      <h1 className="text-4xl font-extrabold mx-4 text-purple-700 tracking-wide drop-shadow-lg">
        BargainBites
      </h1>
      <span role="img" aria-label="pizza-icon" className="text-3xl">🍕🍳🍗🥩🍜🍨</span>
    </div>
    <p className="text-lg text-gray-600 mt-2 font-medium">
      Your personal assistant for finding the best food deals..
    </p>
  </div>
);

export default Header;
