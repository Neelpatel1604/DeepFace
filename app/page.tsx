'use client';

import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import SettingsPanel from './components/SettingsPanel';
import { useState } from 'react';

export default function Home() {
    const router = useRouter();
    const [showPasswordHelp, setShowPasswordHelp] = useState(false);

    const handleConnect = () => {
        router.push('/comparison');
    };

    const togglePasswordHelp = () => {
        setShowPasswordHelp(!showPasswordHelp);
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
            <Toaster position="top-right" />
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-8">
                    Deepfake Protection Settings
                </h1>
                <SettingsPanel onConnect={handleConnect} />

                {/* Password Help Section */}
                <div className="mt-4">
                    <button
                        onClick={togglePasswordHelp}
                        className="text-blue-400 hover:text-blue-300 focus:outline-none"
                    >
                        Where do I find my password?
                    </button>
                    {showPasswordHelp && (
                        <div className="bg-gray-800 p-4 rounded-md mt-2">
                            <h3 className="font-semibold mb-2">Finding Your OBS WebSocket Password</h3>
                            <p>
                                1. Open OBS Studio.
                            </p>
                            <p>
                                2. Go to "Tools" in the top menu.
                            </p>
                            <p>
                                3. Select "WebSocket Server Settings".
                            </p>
                            <p>
                                4. If "Enable Authentication" is checked, your password will be displayed in the "Server Password" field.
                            </p>
                            <p>
                                5. If "Enable Authentication" is not checked, you do not need a password.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
