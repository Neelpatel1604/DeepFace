'use client';

import { useEffect, useState } from 'react';
import OBSWebSocketManager from '../utils/obsWebSocket';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface SourceSelectorProps {
  onSourceSelect: (sourceName: string) => void;
}

export default function SourceSelector({ onSourceSelect }: SourceSelectorProps) {
  const [sources, setSources] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [error, setError] = useState<string>('');
  const obsManager = OBSWebSocketManager.getInstance();

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const scenes = await obsManager.getScenes();
        const allSources = new Set<string>();
        
        // Get sources from each scene

        setSources(Array.from(allSources));
      } catch (error) {
        setError('Failed to fetch sources');
        console.error('Error fetching sources:', error);
      }
    };

    if (obsManager.isConnected()) {
      fetchSources();
    }
  }, [obsManager]);

  const handleSourceChange = (value: string) => {
    setSelectedSource(value);
    onSourceSelect(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Select value={selectedSource} onValueChange={handleSourceChange}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a video source" />
          </SelectTrigger>
          <SelectContent>
            {sources.map((source) => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
} 