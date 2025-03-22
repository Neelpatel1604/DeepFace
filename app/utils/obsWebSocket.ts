import OBSWebSocket from 'obs-websocket-js';

// Type definitions for OBS WebSocket responses
interface SourceFilter {
    filterName: string;
    filterKind: string;
    filterSettings?: Record<string, unknown>;
    [key: string]: unknown;
}

interface SceneItem {
    sourceName: string;
    sceneItemId: number;
    [key: string]: unknown;
}

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

    public async applyProtectionFilter(sourceName: string, params: {
        model: string;
        strength: number;
        iterations: number;
        alpha: number;
        epsilon: number;
        targetArea: 'face' | 'full' | 'custom';
    }): Promise<boolean> {
        try {
            const existingFilters = await this.obs.call('GetSourceFilterList', { sourceName });
            const hasProtectionFilter = (existingFilters.filters as SourceFilter[]).some((f: SourceFilter) => f.filterName === 'DeepfakeProtection');

            const filterSettings = {
                contrast: 1.0 + (params.strength / 200),
                brightness: 1.0 - (params.strength / 400),
                gamma: 1.0 + (params.alpha * 10),
                saturation: 1.0 + (params.epsilon),
                hue_shift: params.iterations % 360,
                opacity: 1.0,
            };

            if (hasProtectionFilter) {
                await this.obs.call('SetSourceFilterSettings', {
                    sourceName,
                    filterName: 'DeepfakeProtection',
                    filterSettings,
                });
            } else {
                await this.obs.call('CreateSourceFilter', {
                    sourceName,
                    filterName: 'DeepfakeProtection',
                    filterKind: 'color_filter_v2',
                    filterSettings,
                });
            }

            await this.obs.call('SetSourceFilterEnabled', {
                sourceName,
                filterName: 'DeepfakeProtection',
                filterEnabled: true,
            });
            return true;
        } catch (error) {
            console.error('Failed to apply protection filter:', error);
            return false;
        }
    }

    public async removeProtectionFilter(sourceId: string) {
        try {
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

    public async startVirtualCamera(): Promise<boolean> {
        try {
            await this.obs.call('StartVirtualCam');
            return true;
        } catch (error) {
            console.error('Failed to start virtual camera:', error);
            return false;
        }
    }

    public async stopVirtualCamera(): Promise<boolean> {
        try {
            await this.obs.call('StopVirtualCam');
            return true;
        } catch (error) {
            console.error('Failed to stop virtual camera:', error);
            return false;
        }
    }

    public async getSceneSources(sceneName: string): Promise<Array<{ sourceName: string }>> {
        try {
            const { sceneItems } = await this.obs.call('GetSceneItemList', {
                sceneName: sceneName
            });
            return (sceneItems as SceneItem[]).map((item: SceneItem) => ({
                sourceName: item.sourceName
            }));
        } catch (error) {
            console.error('Failed to get scene sources:', error);
            return [];
        }
    }
}

export default OBSWebSocketManager;