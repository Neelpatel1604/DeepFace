'use client';
import { useEffect, useRef, useState } from 'react';
import VideoStreamManager from '../utils/videoStreams';

interface VideoStreamsProps {
    onError: (error: string) => void;
}

export default function VideoStreams({ onError }: VideoStreamsProps) {
    const originalVideoRef = useRef<HTMLVideoElement>(null);
    const protectedVideoRef = useRef<HTMLVideoElement>(null);
    const hashVideoRef = useRef<HTMLVideoElement>(null);
    const videoManager = VideoStreamManager.getInstance();
    const [obsProtectedStream, setObsProtectedStream] = useState<MediaStream | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const generateNoise = () => {
            const imageData = ctx.createImageData(canvas.width, canvas.height);
            const buffer = imageData.data;

            for (let i = 0; i < buffer.length; i += 4) {
                const color = Math.random() * 255; // Random grayscale
                buffer[i] = color;     // Red
                buffer[i + 1] = color; // Green
                buffer[i + 2] = color; // Blue
                buffer[i + 3] = 255;   // Alpha (fully opaque)
            }

            ctx.putImageData(imageData, 0, 0);
            requestAnimationFrame(generateNoise);
        };

        generateNoise();
    }, []);

    useEffect(() => {
        const initializeStreams = async () => {
            try {
                const success = await videoManager.initializeStreams();
                if (!success) {
                    onError('Failed to initialize video streams');
                    return;
                }
                const obsStream = await videoManager.getStreamFromOBS();
                if (obsStream && protectedVideoRef.current) {
                    setObsProtectedStream(obsStream);
                    protectedVideoRef.current.srcObject = obsStream;
                } else {
                    onError('Failed to retrieve protected stream from OBS; using local stream as fallback.');
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
                onError('Failed to initialize video streams');
                console.error('Stream initialization error:', error);
            }
        };

        initializeStreams();

        return () => {
            videoManager.cleanup();
            if (obsProtectedStream) {
                obsProtectedStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onError]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
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
                        <canvas ref={canvasRef} className="w-full h-full" />
                        <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                            Protection Pattern
                        </div>
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
    );
}