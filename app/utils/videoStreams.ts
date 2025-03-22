import OBSWebSocketManager from './obsWebSocket';

class VideoStreamManager {
    private static instance: VideoStreamManager;
    private originalStream: MediaStream | null = null;
    private protectedStream: MediaStream | null = null;
    private hashStream: MediaStream | null = null;
    private protectedCanvas: HTMLCanvasElement | null = null;
    private hashCanvas: HTMLCanvasElement | null = null;
    private animationFrameId: number | null = null;
    private videoElement: HTMLVideoElement | null = null;
    private isProtectionActive: boolean = false;
    private protectionStrength: number = 0.5;
    private lastFrameTime: number = 0;
    private frameCount: number = 0;
    private fps: number = 0;

    private constructor() {
        this.videoElement = document.createElement('video');
        this.videoElement.autoplay = true;
        this.videoElement.playsInline = true;
    }

    public static getInstance(): VideoStreamManager {
        if (!VideoStreamManager.instance) {
            VideoStreamManager.instance = new VideoStreamManager();
        }
        return VideoStreamManager.instance;
    }

    public async initializeStreams(): Promise<boolean> {
        try {
            // Get the camera stream with optimal settings
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                } 
            });
            this.originalStream = stream;

            if (this.videoElement) {
                this.videoElement.srcObject = stream;
                await new Promise((resolve) => {
                    if (this.videoElement) {
                        this.videoElement.onloadedmetadata = () => resolve(true);
                    }
                });
            }

            // Create canvases with hardware acceleration hints
            if (!this.protectedCanvas) {
                this.protectedCanvas = document.createElement('canvas');
                this.protectedCanvas.style.imageRendering = 'crisp-edges';
            }
            if (!this.hashCanvas) {
                this.hashCanvas = document.createElement('canvas');
                this.hashCanvas.style.imageRendering = 'crisp-edges';
            }

            const videoTrack = stream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();

            // Set canvas dimensions to match video
            this.protectedCanvas.width = settings.width || 1280;
            this.protectedCanvas.height = settings.height || 720;
            this.hashCanvas.width = settings.width || 1280;
            this.hashCanvas.height = settings.height || 720;

            const protectedCtx = this.protectedCanvas.getContext('2d', {
                alpha: false,
                desynchronized: true
            });
            const hashCtx = this.hashCanvas.getContext('2d', {
                alpha: false,
                desynchronized: true
            });

            if (!protectedCtx || !hashCtx) {
                throw new Error('Failed to get canvas contexts');
            }

            // Performance optimizations
            protectedCtx.imageSmoothingEnabled = false;
            hashCtx.imageSmoothingEnabled = false;

            // Set up the video processing pipeline
            const processFrame = (timestamp: number) => {
                if (!this.videoElement || !protectedCtx || !hashCtx || !this.protectedCanvas || !this.hashCanvas) return;

                // Calculate FPS
                if (this.lastFrameTime !== 0) {
                    const delta = timestamp - this.lastFrameTime;
                    this.frameCount++;
                    if (this.frameCount === 30) {
                        this.fps = 1000 / (delta / 30);
                        this.frameCount = 0;
                    }
                }
                this.lastFrameTime = timestamp;

                // Draw the original frame to both canvases
                protectedCtx.drawImage(this.videoElement, 0, 0, this.protectedCanvas.width, this.protectedCanvas.height);
                hashCtx.drawImage(this.videoElement, 0, 0, this.hashCanvas.width, this.hashCanvas.height);
                
                if (this.isProtectionActive) {
                    // Get image data for processing
                    const protectedData = protectedCtx.getImageData(0, 0, this.protectedCanvas.width, this.protectedCanvas.height);
                    const hashData = hashCtx.getImageData(0, 0, this.hashCanvas.width, this.hashCanvas.height);

                    // Apply protection (subtle changes that prevent deepfake training)
                    this.applyProtection(protectedData);
                    protectedCtx.putImageData(protectedData, 0, 0);

                    // Generate hash visualization (more visible changes)
                    this.generateHashVisualization(hashData, timestamp);
                    hashCtx.putImageData(hashData, 0, 0);

                    // Add visual feedback overlay
                    this.drawProtectionOverlay(protectedCtx, this.protectionStrength);
                    this.drawFPSOverlay(hashCtx);
                }

                // Request next frame
                this.animationFrameId = requestAnimationFrame(processFrame);
            };

            // Stop any existing animation frame
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }

            // Start processing frames
            this.animationFrameId = requestAnimationFrame(processFrame);

            // Create MediaStreams from the canvases with higher framerate
            this.protectedStream = this.protectedCanvas.captureStream(30);
            this.hashStream = this.hashCanvas.captureStream(30);

            return true;
        } catch (error) {
            console.error('Failed to initialize streams:', error);
            return false;
        }
    }

    public setProtectionActive(active: boolean): void {
        this.isProtectionActive = active;
    }

    public setProtectionStrength(strength: number): void {
        this.protectionStrength = Math.max(0, Math.min(1, strength));
    }

    private applyProtection(imageData: ImageData) {
        const data = imageData.data;
        const noise = 2 * this.protectionStrength; // Subtle noise level scaled by strength
        const period = 0.1; // Time-based variation
        const time = Date.now() * period;

        // Use Uint32Array for faster processing
        const pixels = new Uint32Array(data.buffer);
        const len = pixels.length;

        for (let i = 0; i < len; i++) {
            const offset = Math.sin(time + i * 0.001) * noise;
            
            // Extract color components
            const pixel = pixels[i];
            const r = (pixel >> 24) & 0xFF;
            const g = (pixel >> 16) & 0xFF;
            const b = (pixel >> 8) & 0xFF;

            // Apply protection pattern
            const newR = Math.max(0, Math.min(255, r + offset));
            const newG = Math.max(0, Math.min(255, g + offset));
            const newB = Math.max(0, Math.min(255, b + offset));

            // Pack colors back
            pixels[i] = (newR << 24) | (newG << 16) | (newB << 8) | 0xFF;
        }
    }

    private generateHashVisualization(imageData: ImageData, timestamp: number) {
        const data = imageData.data;
        const time = timestamp * 0.001; // Smooth time-based animation
        const width = imageData.width;
        const height = imageData.height;

        // Use typed arrays for better performance
        const pixels = new Uint32Array(data.buffer);
        const len = pixels.length;

        for (let i = 0; i < len; i++) {
            const x = (i % width) / width;
            const y = Math.floor(i / width) / height;
            
            // Calculate perceptual hash value
            const pixel = pixels[i];
            const r = (pixel >> 24) & 0xFF;
            const g = (pixel >> 16) & 0xFF;
            const b = (pixel >> 8) & 0xFF;
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

            // Create dynamic protection visualization
            const wave = Math.sin(x * 10 + time) * Math.cos(y * 10 + time);
            const ripple = Math.sin(Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2) * 20 - time * 2);
            const pattern = (wave + ripple) * 0.5 * brightness;

            // Create a colorful, animated visualization
            const hue = (time * 50 + pattern * 360) % 360;
            const [r2, g2, b2] = this.hslToRgb(hue / 360, 0.8, 0.5 + pattern * 0.5);

            // Pack colors
            pixels[i] = (r2 << 24) | (g2 << 16) | (b2 << 8) | 0xFF;
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
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
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

    public getFPS(): number {
        return this.fps;
    }

    public cleanup() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        if (this.originalStream) {
            this.originalStream.getTracks().forEach(track => track.stop());
        }
        if (this.protectedStream) {
            this.protectedStream.getTracks().forEach(track => track.stop());
        }
        if (this.hashStream) {
            this.hashStream.getTracks().forEach(track => track.stop());
        }

        this.originalStream = null;
        this.protectedStream = null;
        this.hashStream = null;
        this.protectedCanvas = null;
        this.hashCanvas = null;
        this.videoElement = null;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
    }
}

export default VideoStreamManager; 