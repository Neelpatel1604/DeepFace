'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import OBSWebSocket from 'obs-websocket-js';
import { toast, Toaster } from 'react-hot-toast';
import VideoStreamManager from '../utils/videoStreams';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function VideoStreams() {
    const originalVideoRef = useRef<HTMLVideoElement>(null);
    const protectedVideoRef = useRef<HTMLVideoElement>(null);
    const hashVideoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoManager = VideoStreamManager.getInstance();
    const [obsProtectedStream, setObsProtectedStream] = useState<MediaStream | null>(null);
    const [noiseLevel, setNoiseLevel] = useState(50); // State for slider (0-100)
    const [isProtectionActive, setIsProtectionActive] = useState(false); // State for protection toggle
    const [status, setStatus] = useState('Idle'); // Status for protection
    const [error, setError] = useState(''); // Error state
    const router = useRouter();
    const [transitionStrength, setTransitionStrength] = useState(0);

    useEffect(() => {
        // Effect for smooth transition when protection is toggled
        let transitionInterval: NodeJS.Timeout;
        
        if (isProtectionActive) {
            // Gradually increase transition strength for smooth effect
            transitionInterval = setInterval(() => {
                setTransitionStrength(prev => {
                    const newValue = Math.min(prev + 5, noiseLevel);
                    if (newValue >= noiseLevel) {
                        clearInterval(transitionInterval);
                    }
                    return newValue;
                });
            }, 50);
        } else {
            // Reset transition strength when protection is turned off
            setTransitionStrength(0);
        }

        return () => {
            clearInterval(transitionInterval);
        };
    }, [isProtectionActive, noiseLevel]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        let animationFrameId: number;

        const generateNoise = () => {
            const imageData = ctx.createImageData(canvas.width, canvas.height);
            const buffer = imageData.data;

            for (let i = 0; i < buffer.length; i += 4) {
                const color = Math.random() * (400 * (noiseLevel / 100));
                buffer[i] = color;     // Red
                buffer[i + 1] = color; // Green
                buffer[i + 2] = color; // Blue
                buffer[i + 3] = 255;   // Alpha (fully opaque)
            }

            ctx.putImageData(imageData, 0, 0);
            animationFrameId = requestAnimationFrame(generateNoise);
        };

        if (isProtectionActive) {
            generateNoise();
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [noiseLevel, isProtectionActive]);

    useEffect(() => {
        const initializeStreams = async () => {
            try {
                const success = await videoManager.initializeStreams();
                if (!success) {
                    setError('Failed to initialize video streams');
                    toast.error('Failed to initialize streams');
                    return;
                }
                const obsStream = await videoManager.getStreamFromOBS();
                if (obsStream && protectedVideoRef.current) {
                    setObsProtectedStream(obsStream);
                    protectedVideoRef.current.srcObject = obsStream;
                } else {
                    setError('Failed to retrieve protected stream from OBS; using local stream as fallback.');
                    toast.error('Failed to retrieve protected stream from OBS; using local stream as fallback.');
                    if (protectedVideoRef.current) {
                        protectedVideoRef.current.srcObject = videoManager.getProtectedStream();
                    }
                }
                if (originalVideoRef.current) {
                    originalVideoRef.current.srcObject = videoManager.getOriginalStream();
                }
                if (hashVideoRef.current) {
                    hashVideoRef.current.srcObject = videoManager.getHashStream();
                }
            } catch (error) {
                setError('Failed to initialize video streams');
                toast.error('Failed to initialize streams: ' + (error as Error).message);
                console.error('Stream initialization error:', error);
            }
        };

        initializeStreams();

        return () => {
            videoManager.cleanup();
            if (obsProtectedStream) {
                obsProtectedStream.getTracks().forEach(track => track.stop());
            }
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
        setNoiseLevel(newStrength);
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
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        Video Stream Protection
                    </h1>
                    <Button onClick={() => router.push('/')} variant="outline" className="border-gray-600 cursor-pointer">
                        Back to Settings
                    </Button>
                </div>

                {/* Video Streams Section */}
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        {/* Original Video Frame */}
                        <div className="bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm border border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Original</h2>
                                <span className="text-sm text-yellow-400">Trainable</span>
                            </div>
                            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                                <video
                                    ref={originalVideoRef}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    playsInline
                                />
                                <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                                    Raw Input
                                </div>
                            </div>
                        </div>

                        {/* Hash Visualization Frame */}
                        <div className="bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm border border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Hash Visualization</h2>
                                <span className="text-sm text-blue-400">Processing</span>
                            </div>
                            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                                <canvas
                                    ref={canvasRef}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                                    Protection Pattern
                                </div>
                                {isProtectionActive && (
                                    <div className="absolute top-2 right-2 text-xs text-white bg-green-600/70 px-2 py-1 rounded">
                                        {Math.round(transitionStrength)}% Active
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Protected Video Frame */}
                        <div className="bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm border border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Protected</h2>
                                <span className="text-sm text-green-400">Secured</span>
                            </div>
                            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                                <video
                                    ref={protectedVideoRef}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    playsInline
                                />
                                <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                                    Protected Output
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Panel */}
                    <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm border border-gray-700">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <h3 className="font-medium text-gray-400 mb-1">Original Stream</h3>
                                <p className="text-yellow-400">
                                    Unprotected feed - vulnerable to deepfake training
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-400 mb-1">Hash Visualization</h3>
                                <p className="text-blue-400">
                                    Real-time protection pattern generation
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-400 mb-1">Protected Stream</h3>
                                <p className="text-green-400">
                                    Adversarial protection applied - resistant to deepfakes
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Protection Strength Section */}
                <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="strength">Protection Strength</Label>
                            <span className="text-sm text-gray-400">{noiseLevel} %</span>
                        </div>
                        <Slider
                            id="strength"
                            value={[noiseLevel]}
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

                {/* Error Display */}
                {error && (
                    <div className="bg-red-900/50 p-4 rounded-lg border border-red-700">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}
            </div>
        </main>
    );
}