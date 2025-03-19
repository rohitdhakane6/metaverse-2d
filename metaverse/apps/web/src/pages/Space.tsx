import  { useEffect, useState } from 'react';
import { Game } from 'phaser';
import { GameConfig } from '../game/config';

const GameUI = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to the virtual office!", type: 'system' },
    { id: 2, text: "Use WASD or arrow keys to move around.", type: 'system' }
  ]);
  const [game, setGame] = useState(null);

  useEffect(() => {
    const gameInstance = new Game(GameConfig);
    setGame(gameInstance);

    const handleResize = () => {
      gameInstance.scale.resize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      gameInstance.destroy(true);
    };
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900">
      {/* Top Navigation */}
      <nav className="h-14 bg-gray-800 text-white flex items-center justify-between px-6 shadow-lg">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Virtual Office</h1>
          <div className="text-sm bg-green-500 px-2 py-1 rounded">Online</div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleChat}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
          >
            {isChatOpen ? 'Hide Chat' : 'Show Chat'}
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        {isChatOpen && (
          <aside className="w-80 bg-gray-800 flex flex-col shadow-xl">
            <div className="p-4 bg-gray-750">
              <h2 className="text-white text-lg font-semibold mb-2">Chat</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-md"
                />
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.type === 'system' 
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-gray-750">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-l-md"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-md transition-colors">
                  Send
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Game Container */}
        <main className="flex-1 bg-gray-700 relative">
          <div id="game-container" className="absolute inset-0" />
        </main>
      </div>

      {/* Controls Footer */}
      <footer className="h-16 bg-gray-800 text-white flex items-center justify-between px-6 shadow-lg">
        <div className="flex items-center space-x-4">
          <span className="text-sm">Controls:</span>
          <div className="flex space-x-2">
            <kbd className="px-2 py-1 bg-gray-700 rounded">W</kbd>
            <kbd className="px-2 py-1 bg-gray-700 rounded">A</kbd>
            <kbd className="px-2 py-1 bg-gray-700 rounded">S</kbd>
            <kbd className="px-2 py-1 bg-gray-700 rounded">D</kbd>
          </div>
          <span className="text-sm">or</span>
          <div className="flex space-x-2">
            <kbd className="px-2 py-1 bg-gray-700 rounded">↑</kbd>
            <kbd className="px-2 py-1 bg-gray-700 rounded">←</kbd>
            <kbd className="px-2 py-1 bg-gray-700 rounded">↓</kbd>
            <kbd className="px-2 py-1 bg-gray-700 rounded">→</kbd>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <span className="text-xl">🔊</span>
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <span className="text-xl">⚙️</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default GameUI;