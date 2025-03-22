import OBSWebSocket from 'obs-websocket-js';

class OBSWebSocketManager {
    private static instance: OBSWebSocketManager;
    private obs: OBSWebSocket;
    private connectionStatus: boolean = false;
    private statusListeners: ((status: boolean) => void)[] = [];
    private currentPassword: string | undefined;

    private constructor() {
        this.obs = new OBSWebSocket();
        this.setupEventListeners();
    }

    public static getInstance(): OBSWebSocketManager {
        if (!OBSWebSocketManager.instance) {
            OBSWebSocketManager.instance = new OBSWebSocketManager();
        }
        return OBSWebSocketManager.instance;
    }

    private setupEventListeners() {
        this.obs.on('ConnectionOpened', () => {
            this.connectionStatus = true;
            this.notifyStatusListeners();
        });

        this.obs.on('ConnectionClosed', () => {
            this.connectionStatus = false;
            this.notifyStatusListeners();
        });
    }

    public async connect(address: string = 'localhost:4455', password?: string) {
        try {
            this.currentPassword = password;
            await this.obs.connect(`ws://${address}`, password);
            return true;
        } catch (error) {
            console.error('Failed to connect:', error);
            return false;
        }
    }

    public async disconnect() {
        try {
            await this.obs.disconnect();
            return true;
        } catch (error) {
            console.error('Failed to disconnect:', error);
            return false;
        }
    }

    public isConnected(): boolean {
        return this.connectionStatus;
    }

    public addStatusListener(listener: (status: boolean) => void) {
        this.statusListeners.push(listener);
    }

    public removeStatusListener(listener: (status: boolean) => void) {
        this.statusListeners = this.statusListeners.filter(l => l !== listener);
    }

    private notifyStatusListeners() {
        this.statusListeners.forEach(listener => listener(this.connectionStatus));
    }

    // Add methods for interacting with video sources
    public async getScenes() {
        try {
            const { scenes } = await this.obs.call('GetSceneList');
            return scenes;
        } catch (error) {
            console.error('Failed to get scenes:', error);
            return [];
        }
    }

    public async getCurrentScene() {
        try {
            const { currentProgramSceneName } = await this.obs.call('GetCurrentProgramScene');
            return currentProgramSceneName;
        } catch (error) {
            console.error('Failed to get current scene:', error);
            return null;
        }
    }

    // Method to apply protection filter
    public async applyProtectionFilter(sourceId: string, params: {
        model: string;
        strength: number;
        iterations: number;
        alpha: number;
        epsilon: number;
        targetArea: 'face' | 'full' | 'custom';
    }) {
        try {
            // Check if filters exist and get their settings
            let existingFilters;
            try {
                existingFilters = await this.obs.call('GetSourceFilterList', {
                    sourceName: sourceId
                });
            } catch (error) {
                console.error('Failed to get filter list:', error);
                existingFilters = { filters: [] };
            }

            const hasColorFilter = existingFilters.filters.some((f: any) => f.filterName === 'DeepfakeProtection');
            const hasLUTFilter = existingFilters.filters.some((f: any) => f.filterName === 'DeepfakeProtection_LUT');

            // Update or create color correction filter
            const colorFilterSettings = {
                contrast: 1.0 + (params.strength / 200),
                brightness: 1.0 - (params.strength / 400),
                gamma: 1.0 + (params.alpha * 10),
                saturation: 1.0 + (params.epsilon),
                hue_shift: params.iterations % 360,
                opacity: 1.0
            };

            if (hasColorFilter) {
                await this.obs.call('SetSourceFilterSettings', {
                    sourceName: sourceId,
                    filterName: 'DeepfakeProtection',
                    filterSettings: colorFilterSettings
                });
            } else {
                await this.obs.call('CreateSourceFilter', {
                    sourceName: sourceId,
                    filterName: 'DeepfakeProtection',
                    filterKind: 'color_filter_v2',
                    filterSettings: colorFilterSettings
                });
            }

            // Update or create LUT filter
            const lutFilterSettings = {
                image_path: '', // We'll need to generate a LUT file
                amount: params.strength / 100
            };

            if (hasLUTFilter) {
                await this.obs.call('SetSourceFilterSettings', {
                    sourceName: sourceId,
                    filterName: 'DeepfakeProtection_LUT',
                    filterSettings: lutFilterSettings
                });
            } else {
                await this.obs.call('CreateSourceFilter', {
                    sourceName: sourceId,
                    filterName: 'DeepfakeProtection_LUT',
                    filterKind: 'clut_filter',
                    filterSettings: lutFilterSettings
                });
            }

            // Enable both filters
            await this.obs.call('SetSourceFilterEnabled', {
                sourceName: sourceId,
                filterName: 'DeepfakeProtection',
                filterEnabled: true
            });

            await this.obs.call('SetSourceFilterEnabled', {
                sourceName: sourceId,
                filterName: 'DeepfakeProtection_LUT',
                filterEnabled: true
            });

            return true;
        } catch (error) {
            console.error('Failed to apply protection filter:', error);
            return false;
        }
    }

    // Add method to remove protection
    public async removeProtectionFilter(sourceId: string) {
        try {
            // First try to disable the filters
            try {
                await this.obs.call('SetSourceFilterEnabled', {
                    sourceName: sourceId,
                    filterName: 'DeepfakeProtection',
                    filterEnabled: false
                });

                await this.obs.call('SetSourceFilterEnabled', {
                    sourceName: sourceId,
                    filterName: 'DeepfakeProtection_LUT',
                    filterEnabled: false
                });
            } catch (error) {
                console.warn('Failed to disable filters:', error);
            }

            // Then try to remove them
            try {
                await this.obs.call('RemoveSourceFilter', {
                    sourceName: sourceId,
                    filterName: 'DeepfakeProtection'
                });
            } catch (error) {
                console.warn('Failed to remove color filter:', error);
            }

            try {
                await this.obs.call('RemoveSourceFilter', {
                    sourceName: sourceId,
                    filterName: 'DeepfakeProtection_LUT'
                });
            } catch (error) {
                console.warn('Failed to remove LUT filter:', error);
            }

            return true;
        } catch (error) {
            console.error('Failed to remove protection filters:', error);
            return false;
        }
    }

    public async getSource(sourceName: string): Promise<HTMLVideoElement | null> {
        try {
            // Get source settings to verify it exists
            await this.obs.call('GetInputSettings', {
                inputName: sourceName
            });

            // Create a video element to display the source
            const video = document.createElement('video');
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;

            // Get the stream URL with authentication
            const { streamUrl } = await this.obs.call('GetInputSettings', {
                inputName: sourceName
            });

            if (streamUrl) {
                video.src = streamUrl;
                return video;
            }

            return null;
        } catch (error) {
            console.error('Failed to get source:', error);
            return null;
        }
    }

    public async getSceneSources(sceneName: string): Promise<Array<{ sourceName: string }>> {
        try {
            const { sceneItems } = await this.obs.call('GetSceneItemList', {
                sceneName: sceneName
            });
            return sceneItems.map((item: any) => ({
                sourceName: item.sourceName
            }));
        } catch (error) {
            console.error('Failed to get scene sources:', error);
            return [];
        }
    }
}

export default OBSWebSocketManager; 