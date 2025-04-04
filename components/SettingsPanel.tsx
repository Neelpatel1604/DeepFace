'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import OBSWebSocketManager from '../utils/obsWebSocket';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { InfoCircledIcon, ChevronDownIcon, EyeOpenIcon, MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';

const AVAILABLE_MODELS = [
    { id: 'deepfake-lab', name: 'Deepfake-Lab'},
    { id: 'faceswap', name: 'Faces Wap' },
    { id: 'simswap', name: 'Sim Swap'},
    { id: 'faceshifter', name: 'Face Shifter' },
    { id: 'difffake', name: 'Difffake' }
];

const TARGET_AREAS = [
    { value: 'face', label: 'Face Only', description: 'Apply protection only to detected facial areas' },
    { value: 'full', label: 'Full Frame', description: 'Apply protection to the entire video frame' },
    { value: 'custom', label: 'Custom Region', description: 'Define specific areas for protection' }
];

interface AdvancedSettings {
    projections: number;
    MTCNN: number;
    identity: number;
    attention: number;
    alpha: number;
    epsilon: number;
    targetArea: 'face' | 'full' | 'custom';
    gaussainblur: boolean;
}

interface SettingsPanelProps {
    onConnect: () => void;
}

export default function SettingsPanel({ onConnect }: SettingsPanelProps) {
    const [address, setAddress] = useState('localhost:4455');
    const [password, setPassword] = useState('');
    const [showPasswordHelp, setShowPasswordHelp] = useState(false);
    const [selectedModel, setSelectedModel] = useState('deepfake-lab');
    const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
        projections: 1,
        MTCNN: 1,
        identity: 1,
        attention: 1,
        alpha: 0.01,
        epsilon: 0.1,
        targetArea: 'face',
        gaussainblur: false
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
                // Start the virtual camera after connecting
                await obsManager.startVirtualCamera();
            } else {
                toast.error('Failed to connect to OBS');
            }
        } catch (error) {
            toast.error('Connection error: ' + (error as Error).message);
        }
    };

    // Get model details for the selected model
    const selectedModelDetails = AVAILABLE_MODELS.find(model => model.id === selectedModel) || AVAILABLE_MODELS[0];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-8">
            <Card className="border border-gray-600 bg-gray-800/50 backdrop-blur">
                <CardHeader className="border-b border-gray-800">
                    <CardTitle className="text-2xl font-bold text-white">Protection Settings</CardTitle>
                    <CardDescription>
                        Configure your OBS connection and protection parameters
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <Tabs defaultValue="connection" className="w-full">
                        <TabsList className="grid grid-cols-2 mb-6">
                            <TabsTrigger value="connection">
                                Connection Settings
                            </TabsTrigger>
                            <TabsTrigger value="protection">
                                Protection Weighting
                            </TabsTrigger>
                        </TabsList>

                        {/* Connection Settings Tab */}
                        <TabsContent value="connection" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="address" className="text-sm font-medium">
                                        OBS WebSocket Address
                                    </Label>
                                    <Input
                                        id="address"
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="bg-gray-800 border-gray-700"
                                        placeholder="localhost:4455"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        OBS WebSocket Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-gray-800 border-gray-700"
                                        placeholder="Leave empty if authentication is disabled"
                                    />
                                </div>
                            </div>

                            <Collapsible open={showPasswordHelp} onOpenChange={setShowPasswordHelp}>
                                <CollapsibleTrigger className="flex items-center text-sm text-blue-400 hover:text-blue-300 focus:outline-none">
                                    <ChevronDownIcon className={`mr-1 h-4 w-4 transition-transform ${showPasswordHelp ? 'transform rotate-180' : ''}`} />
                                    Where do I find my password?
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="mt-2 p-4 bg-gray-800/80 rounded-md border border-gray-700 text-sm">
                                        <h3 className="font-semibold mb-2">Finding Your OBS WebSocket Password</h3>
                                        <ol className="space-y-1 list-decimal list-inside">
                                            <li>Open OBS Studio</li>
                                            <li>Go to &quot;Tools&quot; in the top menu</li>
                                            <li>Select &quot;WebSocket Server Settings&quot;</li>
                                            <li>If &quot;Enable Authentication&quot; is checked, your password will be in the &quot;Server Password&quot; field</li>
                                            <li>If not checked, leave the password field empty</li>
                                        </ol>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </TabsContent>

                        {/* Protection Parameters Tab */}
                        <TabsContent value="protection" className="space-y-8">
                            <div className="space-y-6">
                                {/* Model Selection with Visual Indicators */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="model" className="text-sm font-medium">Protection Model</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <InfoCircledIcon className="h-4 w-4 text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    <p className="w-64">Different models offer varying levels of protection effectiveness and performance impact</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <Select 
                                        value={selectedModel} 
                                        onValueChange={setSelectedModel}
                                    >
                                        <SelectTrigger className="bg-gray-800 border-gray-700 h-12">
                                            <SelectValue placeholder="Select a model">
                                                <div className="flex items-center space-x-2">
                                                    <span>{selectedModelDetails.name}</span>
                                                   
                                                </div>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700">
                                            {AVAILABLE_MODELS.map((model) => (
                                                <SelectItem key={model.id} value={model.id} className="py-3 hover:bg-gray-700">
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="font-medium">{model.name}</span>
                                                        
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Main Protection Parameters */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Parameter Groups */}
                                    <div className="space-y-4">
                                        <h3 className="text-md font-medium text-gray-300">Detection Weighting</h3>
                                        
                                        {/* MTCNN Parameter */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="MTCNN" className="text-sm">MTCNN (1-5)</Label>
                                                <span className="text-sm font-mono bg-gray-800 px-2 py-0.5 rounded">
                                                    {advancedSettings.MTCNN}
                                                </span>
                                            </div>
                                            <Slider
                                                id="MTCNN"
                                                min={1}
                                                max={5}
                                                step={1}
                                                value={[advancedSettings.MTCNN]}
                                                onValueChange={(value) => setAdvancedSettings({
                                                    ...advancedSettings,
                                                    MTCNN: value[0]
                                                })}
                                                className="w-full"
                                            />
                                        </div>
                                        
                                        {/* Projections Parameter */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="projections" className="text-sm">Projections (1-5)</Label>
                                                <span className="text-sm font-mono bg-gray-800 px-2 py-0.5 rounded">
                                                    {advancedSettings.projections}
                                                </span>
                                            </div>
                                            <Slider
                                                id="projections"
                                                min={1}
                                                max={5}
                                                step={1}
                                                value={[advancedSettings.projections]}
                                                onValueChange={(value) => setAdvancedSettings({
                                                    ...advancedSettings,
                                                    projections: value[0]
                                                })}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-md font-medium text-gray-300">Identity Protection</h3>
                                        
                                        {/* Identity Parameter */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="identity" className="text-sm">Identity Strength (1-5)</Label>
                                                <span className="text-sm font-mono bg-gray-800 px-2 py-0.5 rounded">
                                                    {advancedSettings.identity}
                                                </span>
                                            </div>
                                            <Slider
                                                id="identity"
                                                min={1}
                                                max={5}
                                                step={1}
                                                value={[advancedSettings.identity]}
                                                onValueChange={(value) => setAdvancedSettings({
                                                    ...advancedSettings,
                                                    identity: value[0]
                                                })}
                                                className="w-full"
                                            />
                                        </div>
                                        
                                        {/* Attention Parameter */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="attention" className="text-sm">Attention Level (1-5)</Label>
                                                <span className="text-sm font-mono bg-gray-800 px-2 py-0.5 rounded">
                                                    {advancedSettings.attention}
                                                </span>
                                            </div>
                                            <Slider
                                                id="attention"
                                                min={1}
                                                max={5}
                                                step={1}
                                                value={[advancedSettings.attention]}
                                                onValueChange={(value) => setAdvancedSettings({
                                                    ...advancedSettings,
                                                    attention: value[0]
                                                })}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Options */}
                                <div className="pt-4 border-t border-gray-800">
                                    <div className="flex items-center mb-4">
                                        <MixerHorizontalIcon className="mr-2 h-5 w-5 text-gray-400" />
                                        <h3 className="text-md font-medium text-gray-300">Advanced Options</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            {/* Iterations */}
                                            
                                            {/* Alpha */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <Label htmlFor="alpha" className="text-sm">Alpha (Step Size)</Label>
                                                    <span className="text-sm font-mono bg-gray-800 px-2 py-0.5 rounded">
                                                        {advancedSettings.alpha.toFixed(3)}
                                                    </span>
                                                </div>
                                                <Slider
                                                    id="alpha"
                                                    min={0.001}
                                                    max={0.1}
                                                    step={0.001}
                                                    value={[advancedSettings.alpha]}
                                                    onValueChange={(value) => setAdvancedSettings({
                                                        ...advancedSettings,
                                                        alpha: value[0]
                                                    })}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {/* Target Area - Improved Dropdown */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="targetArea" className="text-sm flex items-center">
                                                        <EyeOpenIcon className="mr-1.5 h-3.5 w-3.5" />
                                                        Target Area
                                                    </Label>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <InfoCircledIcon className="h-4 w-4 text-gray-400" />
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top">
                                                                <p className="w-64">Controls which parts of the video frame are processed</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                                <Select
                                                    value={advancedSettings.targetArea}
                                                    onValueChange={(value) => setAdvancedSettings({
                                                        ...advancedSettings,
                                                        targetArea: value as 'face' | 'full' | 'custom'
                                                    })}
                                                >
                                                    <SelectTrigger className="bg-gray-800 border-gray-700 h-12">
                                                        <SelectValue placeholder="Select target area">
                                                            {TARGET_AREAS.find(item => item.value === advancedSettings.targetArea)?.label}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-700">
                                                        {TARGET_AREAS.map((area) => (
                                                            <SelectItem key={area.value} value={area.value} className="py-3 hover:bg-gray-700">
                                                                <div className="space-y-1">
                                                                    <div className="font-medium">{area.label}</div>
                                                                    <p className="text-xs text-gray-400">{area.description}</p>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            
                                            {/* Improved Gaussian Blur Toggle */}
                                            <div className="mt-4 p-3 rounded-lg bg-gray-800/60 border border-gray-700 transition-all hover:bg-gray-800 hover:border-gray-600">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <Label htmlFor="gaussainblur" className="text-sm font-medium flex items-center">
                                                            Apply Gaussian Blur
                                                            {advancedSettings.gaussainblur && 
                                                                <Badge className="ml-2 bg-green-900/30 text-green-300 border-green-800">
                                                                    Enabled
                                                                </Badge>
                                                            }
                                                        </Label>
                                                        <p className="text-xs text-gray-400">Adds additional layer of obfuscation to protected areas</p>
                                                    </div>
                                                    <Switch
                                                        id="gaussainblur"
                                                        checked={advancedSettings.gaussainblur}
                                                        onCheckedChange={(checked) => setAdvancedSettings({
                                                            ...advancedSettings,
                                                            gaussainblur: checked
                                                        })}
                                                        className="data-[state=checked]:bg-blue-600"
                                                    />
                                                </div>
                                                
                                                {advancedSettings.gaussainblur && (
                                                    <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-300">
                                                        <p>
                                                            Gaussian blur applies a smoothing effect that helps mask detailed features 
                                                            while maintaining overall structure.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Connect Button */}
            <div className="flex justify-end mt-6">
                <Button
                    onClick={handleConnect}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-md transition-colors duration-200 shadow-lg shadow-blue-900/30"
                    size="lg"
                >
                    Connect and Continue
                </Button>
            </div>
        </div>
    );
}