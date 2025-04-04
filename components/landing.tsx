'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import SettingsPanel from './SettingsPanel';
import Squares from './ui/square'; // Adjust the import path as needed

export default function Home() {
  const router = useRouter();
  const [showApp, setShowApp] = useState(false);
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);

  // Transition from landing page to main app view
  const handleGetStarted = () => {
    setShowApp(true);
  };

  // Handle the connect button in SettingsPanel (main app view)
  const handleConnect = () => {
    router.push('/comparison');
  };

  // Toggle password help visibility in the main app view
  const togglePasswordHelp = () => {
    setShowPasswordHelp(!showPasswordHelp);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      <Toaster position="top-right" />
      {/* Squares Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
        }}
      >
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#fff"
          hoverFillColor="#222"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-8">
        {!showApp ? (
          // Landing Page View
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
              Welcome to DeepFace
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Analyze and compare videos effortlessly using cutting-edge AI technology.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-blue-500 text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Get Started
            </button>
          </div>
        ) : (
          // Main App View
          <div className="w-full max-w-3xl">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-8 text-center">
              DeepFace
            </h1>
            <SettingsPanel onConnect={handleConnect} />

            {/* Password Help Section */}
            <div className="mt-6 text-center">
              <button
                onClick={togglePasswordHelp}
                className="text-blue-400 hover:text-blue-300 focus:outline-none"
              >
                Where do I find my password?
              </button>
              {showPasswordHelp && (
                <div className="bg-gray-800 p-4 rounded-md mt-2 text-left">
                  <h3 className="font-semibold mb-2">
                    Finding Your OBS WebSocket Password
                  </h3>
                  <p>1. Open OBS Studio.</p>
                  <p>2. Go to &quot;Tools&quot; in the top menu.</p>
                  <p>3. Select &quot;WebSocket Server Settings&quot;.</p>
                  <p>
                    4. If &quot;Enable Authentication&quot; is checked, your password will
                    be displayed in the &quot;Server Password&quot; field.
                  </p>
                  <p>
                    5. If &quot;Enable Authentication&quot; is not checked, you do not
                    need a password.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}