'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import VideoStreamManager from '../utils/videoStreams';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { Label } from '../components/ui/label';
import VideoStreams from '../components/VideoStreams';

export default function ComparisonPage() {
    const [strength, setStrength] = useState(50);
    const [isProtectionActive, setIsProtectionActive] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('Idle');
    const router = useRouter();
    const videoManager = VideoStreamManager.getInstance();

    useEffect(() => {
        const initializeVideo = async () => {
            try {
                const success = await videoManager.initializeStreams();
                if (!success) {
                    setError('Failed to initialize streams');
                    toast.error('Failed to initialize streams');
                }
            } catch (error) {
                setError('Failed to initialize streams');
                toast.error('Failed to initialize streams: ' + (error as Error).message);
            }
        };
        initializeVideo();
        return () => {
            videoManager.cleanup();
            // Stop the virtual camera when the component unmounts
            if (videoManager.obsManager.isConnected()) {
                videoManager.obsManager.stopVirtualCamera();
            }
        };
    }, []);

    const handleProtectionToggle = () => {
        try {
            const newValue = !isProtectionActive;
            videoManager.setProtectionActive(newValue);
            setIsProtectionActive(newValue);
            setStatus(newValue ? 'Protection applied' : 'Protection removed');
            toast.success(newValue ? 'Protection applied successfully' : 'Protection removed successfully');
        } catch (error) {
            setError('Failed to toggle protection');
            console.error('Protection toggle error:', error);
            toast.error('Failed to toggle protection');
        }
    };

    const handleStrengthChange = (value: number[]) => {
        const newStrength = value[0];
        setStrength(newStrength);
        if (isProtectionActive) {
            try {
                videoManager.setProtectionStrength(newStrength / 100);
            } catch (error) {
                setError('Failed to update protection strength');
                console.error('Strength update error:', error);
                toast.error('Failed to update protection strength');
            }
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        Video Stream Protection
                    </h1>
                    <Button onClick={() => router.push('/')} variant="outline" className="border-gray-600">
                        Back to Settings
                    </Button>
                </div>
                <VideoStreams onError={setError} />
                <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="strength">Protection Strength</Label>
                            <span className="text-sm text-gray-400">{strength} %</span>
                        </div>
                        <Slider
                            id="strength"
                            value={[strength]}
                            onValueChange={handleStrengthChange}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                            disabled={!isProtectionActive}
                        />
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-sm text-gray-400">Status: {status}</span>
                            <Button
                                onClick={handleProtectionToggle}
                                className={`${isProtectionActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {isProtectionActive ? 'Remove Protection' : 'Apply Protection'}
                            </Button>
                        </div>
                    </div>
                </div>
                {error && (
                    <div className="bg-red-900/50 p-4 rounded-lg border border-red-700">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}
            </div>
        </main>
    );
}