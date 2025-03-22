// videoStream.ts
import OBSWebSocketManager from './obsWebSocket';

class VideoStreamManager {
    private static instance: VideoStreamManager;
    private originalStream: MediaStream | null = null;
    private protectedStream: MediaStream | null = null;
    private hashStream: MediaStream | null = null;
    private protectedCanvas: HTMLCanvasElement | null = null;
    private hashCanvas: HTMLCanvasElement | null = null;
    private animationFrameId: number | null = null;
    private obsVirtualCameraStream: MediaStream | null = null;
    private videoElement: HTMLVideoElement | null = null;
    private isProtectionActive: boolean = false;
    private protectionStrength: number = 0.5;
    private lastFrameTime: number = 0;
    private frameCount: number = 0;
    private fps: number = 0;
    public obsManager: OBSWebSocketManager;

    private constructor() {
        this.obsManager = OBSWebSocketManager.getInstance();
    }

    public static getInstance(): VideoStreamManager {
        if (!VideoStreamManager.instance) {
            VideoStreamManager.instance = new VideoStreamManager();
        }
        return VideoStreamManager.instance;
    }

    public async initializeStreams(): Promise<boolean> {
        try {
            // Attempt to connect to OBS if not already connected
            if (this.obsManager.isConnected()) {
                const cameraStarted = await this.obsManager.startVirtualCamera();
                if (!cameraStarted) {
                    console.warn('Failed to start OBS Virtual Camera.');
                }
            }

            this.originalStream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoElement = document.createElement('video');
            this.videoElement.srcObject = this.originalStream;
            this.videoElement.play();

            this.protectedCanvas = document.createElement('canvas');
            this.hashCanvas = document.createElement('canvas');
            this.protectedCanvas.width = 1280;
            this.protectedCanvas.height = 720;
            this.hashCanvas.width = 1280;
            this.hashCanvas.height = 720;

            const protectedCtx = this.protectedCanvas.getContext('2d', { alpha: false, desynchronized: true });
            const hashCtx = this.hashCanvas.getContext('2d', { alpha: false, desynchronized: true });

            if (!protectedCtx || !hashCtx) {
                throw new Error('Failed to get canvas contexts');
            }

            protectedCtx.imageSmoothingEnabled = false;
            hashCtx.imageSmoothingEnabled = false;

            const processFrame = (timestamp: number) => {
                if (!this.videoElement || !protectedCtx || !hashCtx || !this.protectedCanvas || !this.hashCanvas) return;

                if (this.lastFrameTime !== 0) {
                    const delta = timestamp - this.lastFrameTime;
                    this.frameCount++;
                    if (this.frameCount === 30) {
                        this.fps = 1000 / (delta / 30);
                        this.frameCount = 0;
                    }
                }
                this.lastFrameTime = timestamp;

                protectedCtx.drawImage(this.videoElement, 0, 0, this.protectedCanvas.width, this.protectedCanvas.height);
                hashCtx.drawImage(this.videoElement, 0, 0, this.hashCanvas.width, this.hashCanvas.height);

                if (this.isProtectionActive) {
                    const protectedData = protectedCtx.getImageData(0, 0, this.protectedCanvas.width, this.protectedCanvas.height);
                    this.applyProtection(protectedData);
                    protectedCtx.putImageData(protectedData, 0, 0);

                    const hashData = hashCtx.getImageData(0, 0, this.hashCanvas.width, this.hashCanvas.height);
                    this.generateHashVisualization(hashData, timestamp);
                    hashCtx.putImageData(hashData, 0, 0);
                }

                this.drawProtectionOverlay(protectedCtx, this.protectionStrength);
                this.drawFPSOverlay(hashCtx);

                this.sendToOBS();

                this.animationFrameId = requestAnimationFrame(processFrame);
            };

            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            this.animationFrameId = requestAnimationFrame(processFrame);

            this.protectedStream = this.protectedCanvas.captureStream(30);
            this.hashStream = this.hashCanvas.captureStream(30);

            return true;
        } catch (error) {
            console.error('Failed to initialize streams:', error);
            return false;
        }
    }

    private async sendToOBS() {
        if (!this.protectedStream || !this.obsManager.isConnected()) return;

        const sourceName = 'WebAppProtectedSource';
        try {
            await this.obsManager.applyProtectionFilter(sourceName, {
                model: 'default',
                strength: this.protectionStrength * 100,
                iterations: 10,
                alpha: 0.01,
                epsilon: 0.1,
                targetArea: 'full',
            });
        } catch (error) {
            console.error('Failed to send to OBS:', error);
        }
    }

    public async getStreamFromOBS(): Promise<MediaStream | null> {
        try {
            if (!this.obsManager.isConnected()) {
                console.warn('OBS not connected; returning local protected stream.');
                return this.protectedStream;
            }
            // Get the virtual camera stream from the browser
            this.obsVirtualCameraStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: 'OBS Virtual Camera' } });
            if (this.obsVirtualCameraStream) {
                return this.obsVirtualCameraStream;
            } else {
                console.warn('Failed to get OBS Virtual Camera stream; using local protected stream.');
                return this.protectedStream;
            }
        } catch (error) {
            console.error('Failed to get stream from OBS:', error);
            return this.protectedStream; // Fallback
        }
    }
    public setProtectionActive(active: boolean): void {
        this.isProtectionActive = active;
    }

    public setProtectionStrength(strength: number): void {
        this.protectionStrength = Math.max(0, Math.min(1, strength));
    }

    public getOriginalStream(): MediaStream | null {
        return this.originalStream;
    }

    public getProtectedStream(): MediaStream | null {
        return this.protectedStream;
    }

    public getHashStream(): MediaStream | null {
        return this.hashStream;
    }

    public cleanup() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.originalStream) {
            this.originalStream.getTracks().forEach(track => track.stop());
        }
        if (this.obsVirtualCameraStream) {
            this.obsVirtualCameraStream.getTracks().forEach(track => track.stop());
            this.obsVirtualCameraStream = null;
        }
        this.originalStream = null;
        this.protectedStream = null;
        this.hashStream = null;
        this.protectedCanvas = null;
        this.hashCanvas = null;
    }

    private applyProtection(imageData: ImageData) {
        const data = imageData.data;
        const noise = 2 * this.protectionStrength;
        const time = Date.now() * 0.1;
        const pixels = new Uint32Array(data.buffer);
        const len = pixels.length;
        for (let i = 0; i < len; i++) {
            const offset = Math.sin(time + i * 0.001) * noise;
            const pixel = pixels[i];
            const r = (pixel >> 24) & 0xFF;
            const g = (pixel >> 16) & 0xFF;
            const b = (pixel >> 8) & 0xFF;
            const newR = Math.max(0, Math.min(255, r + offset));
            const newG = Math.max(0, Math.min(255, g + offset));
            const newB = Math.max(0, Math.min(255, b + offset));
            pixels[i] = (newR << 24) | (newG << 16) | (newB << 8) | 0xFF;
        }
    }

    private generateHashVisualization(imageData: ImageData, timestamp: number) {
        const data = imageData.data;
        const time = timestamp * 0.001;
        const width = imageData.width;
        const height = imageData.height;
        const pixels = new Uint32Array(data.buffer);
        const len = pixels.length;
        for (let i = 0; i < len; i++) {
            const x = (i % width) / width;
            const y = Math.floor(i / width) / height;
            const brightness = ((pixels[i] >> 24) & 0xFF) * 0.299 + ((pixels[i] >> 16) & 0xFF) * 0.587 + ((pixels[i] >> 8) & 0xFF) * 0.114;
            const wave = Math.sin(x * 10 + time) * Math.cos(y * 10 + time);
            const ripple = Math.sin(Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2) * 20 - time * 2);
            const pattern = (wave + ripple) * 0.5 * (brightness / 255);
            const hue = (time * 50 + pattern * 360) % 360;
            const [r, g, b] = this.hslToRgb(hue / 360, 0.8, 0.5 + pattern * 0.5);
            pixels[i] = (r << 24) | (g << 16) | (b << 8) | 0xFF;
        }
    }

    private drawProtectionOverlay(ctx: CanvasRenderingContext2D, strength: number) {
        const text = `Protection: ${Math.round(strength * 100)}%`;
        ctx.font = '16px monospace';
        ctx.fillStyle = `rgba(0, 255, 0, ${strength * 0.5})`;
        ctx.fillText(text, 10, 20);
    }

    private drawFPSOverlay(ctx: CanvasRenderingContext2D) {
        const text = `FPS: ${Math.round(this.fps)}`;
        ctx.font = '16px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(text, 10, 20);
    }

    private hslToRgb(h: number, s: number, l: number): [number, number, number] {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
}

export default VideoStreamManager;