'use client'

import { useRouter } from 'next/navigation';
import SettingsPanel from '../../components/SettingsPanel';

const Home = () => {
    const router = useRouter();

    const handleConnect = () => {
        router.push('/comparison');
    };
    return (
        <div className="max-w-3xl w-full mx-auto">
            <div className="max-w-3xl mx-auto"></div>
                <h1 className="text-3xl font-bold bg-clip-text mt-2 text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-8">
                    DeepFace
                </h1>
                <SettingsPanel onConnect={handleConnect} />
        </div>

    );
};

export default Home;
