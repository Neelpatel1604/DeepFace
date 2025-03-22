'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import OBSWebSocketManager from '../utils/obsWebSocket';
import PreviewPanel from './PreviewPanel';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

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

export default function ControlPanel() {
    const [isConnected, setIsConnected] = useState(false);
    const [address, setAddress] = useState('localhost:4455');
    const [password, setPassword] = useState('');
    const [selectedModel, setSelectedModel] = useState('dlib');
    const [strength, setStrength] = useState(50);
    const [scenes, setScenes] = useState<any[]>([]);
    const [currentScene, setCurrentScene] = useState<string>('');
    const [status, setStatus] = useState('Idle');
    const [isProtectionActive, setIsProtectionActive] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
        iterations: 10,
        alpha: 0.01,
        epsilon: 0.1,
        targetArea: 'face'
    });

    useEffect(() => {
        const obs = OBSWebSocketManager.getInstance();
        obs.addStatusListener(setIsConnected);

        return () => {
            obs.removeStatusListener(setIsConnected);
        };
    }, []);

    const handleConnect = async () => {
        const obs = OBSWebSocketManager.getInstance();
        try {
            const success = await obs.connect(address, password);
            if (success) {
                const sceneList = await obs.getScenes();
                setScenes(sceneList);
                const current = await obs.getCurrentScene();
                setCurrentScene(current || '');
                toast.success('Connected to OBS successfully!');
            } else {
                toast.error('Failed to connect to OBS');
            }
        } catch (error) {
            toast.error('Connection error: ' + (error as Error).message);
        }
    };

    const handleDisconnect = async () => {
        const obs = OBSWebSocketManager.getInstance();
        try {
            await obs.disconnect();
            toast.success('Disconnected from OBS');
        } catch (error) {
            toast.error('Disconnect error: ' + (error as Error).message);
        }
    };

    const handleApplyProtection = async () => {
        if (!currentScene) {
            toast.error('Please select a scene first');
            return;
        }
        
        setStatus('Applying protection...');
        const obs = OBSWebSocketManager.getInstance();
        try {
            const success = await obs.applyProtectionFilter(currentScene, {
                model: selectedModel,
                strength: strength,
                ...advancedSettings
            });
            
            if (success) {
                setIsProtectionActive(true);
                setStatus('Protection applied successfully');
                toast.success('Protection applied successfully');
            } else {
                setStatus('Failed to apply protection');
                toast.error('Failed to apply protection');
            }
        } catch (error) {
            setStatus('Error applying protection');
            toast.error('Error: ' + (error as Error).message);
        }
    };

    const handleRemoveProtection = async () => {
        if (!currentScene) return;
        
        setStatus('Removing protection...');
        const obs = OBSWebSocketManager.getInstance();
        try {
            const success = await obs.removeProtectionFilter(currentScene);
            if (success) {
                setIsProtectionActive(false);
                setStatus('Protection removed');
                toast.success('Protection removed successfully');
            } else {
                setStatus('Failed to remove protection');
                toast.error('Failed to remove protection');
            }
        } catch (error) {
            setStatus('Error removing protection');
            toast.error('Error: ' + (error as Error).message);
        }
    };

    const selectedModelInfo = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl text-black font-bold mb-8 text-center">
                    Deepfake Protection Control Panel
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        {/* Connection Controls */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl text-black  font-semibold mb-4">Connection Settings</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-black font-medium mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full text-black p-2 border rounded"
                                        disabled={isConnected}
                                    />
                                </div>
                                <div>
                                    <label className="block text-black text-sm font-medium mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full text-black p-2 border rounded"
                                        disabled={isConnected}
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Button
                                    onClick={isConnected ? handleDisconnect : handleConnect}
                                    variant={isConnected ? "destructive" : "default"}
                                >
                                    {isConnected ? 'Disconnect' : 'Connect'}
                                </Button>
                            </div>
                        </div>

                        {/* Protection Controls */}
                        <div className={`bg-white rounded-lg shadow-lg p-6 ${!isConnected && 'opacity-50'}`}>
                            <h2 className="text-xl text-black font-semibold mb-4">Protection Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-black text-sm font-medium mb-1">Model</label>
                                    <select
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        className="w-full text-black p-2 border rounded"
                                        disabled={!isConnected}
                                    >
                                        {AVAILABLE_MODELS.map((model) => (
                                            <option key={model.id} value={model.id}>
                                                {model.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-black text-sm font-medium mb-1">
                                        Protection Strength: {strength}% (Max: {selectedModelInfo.maxStrength}%)
                                    </label>
                                    <Slider
                                        value={[strength]}
                                        onValueChange={(values) => setStrength(values[0])}
                                        min={0}
                                        max={selectedModelInfo.maxStrength}
                                        step={1}
                                        disabled={!isConnected}
                                        className="py-4 w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-black font-medium mb-1">Scene</label>
                                    <select
                                        value={currentScene}
                                        onChange={(e) => setCurrentScene(e.target.value)}
                                        className="w-full text-black p-2 border rounded"
                                        disabled={!isConnected}
                                    >
                                        <option value="">Select a scene</option>
                                        {scenes.map((scene: any) => (
                                            <option key={scene.sceneName} value={scene.sceneName}>
                                                {scene.sceneName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <button
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="text-blue-500 hover:text-blue-600 text-sm"
                                    >
                                        {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                                    </button>

                                    {showAdvanced && (
                                        <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <label className="block text-black text-sm font-medium mb-1">
                                                    Iterations (1-50)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="50"
                                                    value={advancedSettings.iterations}
                                                    onChange={(e) => setAdvancedSettings({
                                                        ...advancedSettings,
                                                        iterations: Math.min(50, Math.max(1, parseInt(e.target.value) || 1))
                                                    })}
                                                    className="w-full text-black p-2 border rounded"
                                                    disabled={!isConnected}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-black text-sm font-medium mb-1">
                                                    Alpha (Step Size)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    min="0.001"
                                                    max="0.1"
                                                    value={advancedSettings.alpha}
                                                    onChange={(e) => setAdvancedSettings({
                                                        ...advancedSettings,
                                                        alpha: parseFloat(e.target.value)
                                                    })}
                                                    className="w-full text-black p-2 border rounded"
                                                    disabled={!isConnected}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-black  text-sm font-medium mb-1">
                                                    Target Area
                                                </label>
                                                <select
                                                    value={advancedSettings.targetArea}
                                                    onChange={(e) => setAdvancedSettings({
                                                        ...advancedSettings,
                                                        targetArea: e.target.value as 'face' | 'full' | 'custom'
                                                    })}
                                                    className="w-full text-black p-2 border rounded"
                                                    disabled={!isConnected}
                                                >
                                                    <option value="face">Face Only</option>
                                                    <option value="full">Full Frame</option>
                                                    <option value="custom">Custom Region</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-gray-600">Status: {status}</span>
                                <div className="space-x-4">
                                    <Button
                                        onClick={handleRemoveProtection}
                                        disabled={!isConnected || !isProtectionActive}
                                        variant="destructive"
                                    >
                                        Remove Protection
                                    </Button>
                                    <Button
                                        onClick={handleApplyProtection}
                                        disabled={!isConnected || !currentScene}
                                        variant="default"
                                    >
                                        Apply Protection
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Real-time Preview</h2>
                            <PreviewPanel
                                strength={strength}
                                model={selectedModel}
                                isProtectionActive={isProtectionActive}
                            />
                            <div className="mt-4 text-sm text-gray-500">
                                Preview shows how the protection will affect your stream. 
                                The pattern and intensity will vary based on your settings.
                            </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="text-center">
                                <div
                                    className={`inline-flex items-center px-4 py-2 rounded-full ${
                                        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    <div
                                        className={`w-3 h-3 rounded-full mr-2 ${
                                            isConnected ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                    />
                                    {isConnected ? 'Connected to OBS' : 'Disconnected'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 