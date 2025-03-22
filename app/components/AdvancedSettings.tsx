'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Slider } from './ui/slider';

interface AdvancedSettingsProps {
  onSettingsChange: (settings: {
    model: string;
    iterations: number;
    alpha: number;
    targetArea: string;
  }) => void;
}

export default function AdvancedSettings({ onSettingsChange }: AdvancedSettingsProps) {
  const [model, setModel] = useState('default');
  const [iterations, setIterations] = useState(1);
  const [alpha, setAlpha] = useState(0.1);
  const [targetArea, setTargetArea] = useState('face');

  const handleModelChange = (value: string) => {
    setModel(value);
    onSettingsChange({ model: value, iterations, alpha, targetArea });
  };

  const handleIterationsChange = (value: string) => {
    const numValue = parseInt(value);
    setIterations(numValue);
    onSettingsChange({ model, iterations: numValue, alpha, targetArea });
  };

  const handleAlphaChange = (value: number[]) => {
    const numValue = value[0] / 100;
    setAlpha(numValue);
    onSettingsChange({ model, iterations, alpha: numValue, targetArea });
  };

  const handleTargetAreaChange = (value: string) => {
    setTargetArea(value);
    onSettingsChange({ model, iterations, alpha, targetArea: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Protection Model</Label>
        <Select value={model} onValueChange={handleModelChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="strong">Strong Protection</SelectItem>
            <SelectItem value="subtle">Subtle Protection</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Iterations</Label>
        <Select value={iterations.toString()} onValueChange={handleIterationsChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select iterations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
            <SelectItem value="5">5</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Alpha (Step Size)</Label>
        <div className="space-y-2">
          <Slider
            value={[alpha * 100]}
            onValueChange={handleAlphaChange}
            min={1}
            max={20}
            step={1}
            className="w-full"
          />
          <div className="text-sm text-gray-400 text-right">
            {(alpha * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Target Area</Label>
        <Select value={targetArea} onValueChange={handleTargetAreaChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select target area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="face">Face Only</SelectItem>
            <SelectItem value="full">Full Frame</SelectItem>
            <SelectItem value="custom">Custom Region</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 