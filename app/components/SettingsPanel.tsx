'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import OBSWebSocketManager from '../utils/obsWebSocket';
import {Input} from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

const AVAILABLE_MODELS = [
    { id: 'dlib', name: 'Dlib (Smallest)', maxStrength: 70 },
    { id: 'arcface', name: 'ArcFace', maxStrength: 85 },
    { id: 'facenet', name: 'FaceNet', maxStrength: 90 },
    { id: 'vggface2', name: 'VGGFace2', maxStrength: 100 }
];

interface AdvancedSettings {
    iterations: number;
    alpha: number;
    epsilon: number;
    targetArea: 'face' | 'full' | 'custom';
    customRegion?: { x: number; y: number; width: number; height: number };
}

interface SettingsPanelProps {
    onConnect: () => void;
}

export default function SettingsPanel({ onConnect }: SettingsPanelProps) {
    const [address, setAddress] = useState('localhost:4455');
    const [password, setPassword] = useState('');
    const [selectedModel, setSelectedModel] = useState('dlib');
    const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
        iterations: 10,
        alpha: 0.01,
        epsilon: 0.1,
        targetArea: 'face'
    });
    const obsManager = OBSWebSocketManager.getInstance();

    const handleConnect = async () => {
        try {
            const success = await obsManager.connect(address, password);
            if (success) {
                // Store settings in localStorage for the comparison page
                localStorage.setItem('protectionSettings', JSON.stringify({
                    model: selectedModel,
                    ...advancedSettings
                }));
                toast.success('Connected to OBS successfully!');
                onConnect();
            } else {
                toast.error('Failed to connect to OBS');
            }
        } catch (error) {
            toast.error('Connection error: ' + (error as Error).message);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Connection Settings */}
            <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Connection Settings</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="address">Address</Label>
                        <input
                            id="address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-gray-700 p-2 rounded border border-gray-600"
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <input
                            id="address"
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-700 p-2 rounded border border-gray-600"
                        />
                    </div>
                </div>
            </div>

            {/* Protection Parameters */}
            <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Protection Parameters</h2>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="model">Model</Label>
                        <select
                            id="model"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                        >
                            {AVAILABLE_MODELS.map((model) => (
                                <option key={model.id} value={model.id}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="iterations">Iterations (1-50)</Label>
                        <input
                            id="iterations"
                            type="number"
                            min="1"
                            max="50"
                            value={advancedSettings.iterations}
                            onChange={(e) => setAdvancedSettings({
                                ...advancedSettings,
                                iterations: Math.min(50, Math.max(1, parseInt(e.target.value) || 1))
                            })}
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                        />
                    </div>

                    <div>
                        <Label htmlFor="alpha">Alpha (Step Size)</Label>
                        <input
                            id="alpha"
                            type="number"
                            step="0.001"
                            min="0.001"
                            max="0.1"
                            value={advancedSettings.alpha}
                            onChange={(e) => setAdvancedSettings({
                                ...advancedSettings,
                                alpha: parseFloat(e.target.value)
                            })}
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                        />
                    </div>

                    <div>
                        <Label htmlFor="targetArea">Target Area</Label>
                        <select
                            id="targetArea"
                            value={advancedSettings.targetArea}
                            onChange={(e) => setAdvancedSettings({
                                ...advancedSettings,
                                targetArea: e.target.value as 'face' | 'full' | 'custom'
                            })}
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                        >
                            <option value="face">Face Only</option>
                            <option value="full">Full Frame</option>
                            <option value="custom">Custom Region</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Connect Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleConnect}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Connect and Continue
                </Button>
            </div>
        </div>
    );
} 