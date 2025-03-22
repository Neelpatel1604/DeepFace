'use client';

import { useEffect, useRef } from 'react';

interface PreviewPanelProps {
    strength: number;
    model: string;
    isProtectionActive: boolean;
}

export default function PreviewPanel({ strength, model, isProtectionActive }: PreviewPanelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw base white image
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (isProtectionActive) {
            // Create gradient based on model and strength
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            
            // Different colors for different models
            const modelColors: { [key: string]: string } = {
                'dlib': '#FF6B6B',
                'arcface': '#4ECDC4',
                'facenet': '#45B7D1',
                'vggface2': '#96CEB4'
            };

            const baseColor = modelColors[model] || '#FF6B6B';
            
            // Calculate gradient opacity based on strength
            const opacity = strength / 100;
            
            gradient.addColorStop(0, `${baseColor}00`);
            gradient.addColorStop(0.5, `${baseColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `${baseColor}00`);

            // Apply gradient
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add noise effect
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const noiseIntensity = strength / 1000;

            for (let i = 0; i < data.length; i += 4) {
                const noise = (Math.random() - 0.5) * noiseIntensity;
                data[i] += noise;     // Red
                data[i + 1] += noise; // Green
                data[i + 2] += noise; // Blue
            }

            ctx.putImageData(imageData, 0, 0);
        }
    }, [strength, model, isProtectionActive]);

    return (
        <div className="relative w-full aspect-video bg-white rounded-lg overflow-hidden shadow-lg">
            <canvas
                ref={canvasRef}
                width={640}
                height={360}
                className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                Preview
            </div>
            {isProtectionActive && (
                <div className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    Protection Active
                </div>
            )}
        </div>
    );
} 