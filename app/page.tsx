'use client';

import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import SettingsPanel from './components/SettingsPanel';

export default function Home() {
    const router = useRouter();

    const handleConnect = () => {
        router.push('/comparison');
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
            <Toaster position="top-right" />
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-8">
                    Deepfake Protection Settings
                </h1>
                <SettingsPanel onConnect={handleConnect} />
            </div>
        </main>
    );
}
