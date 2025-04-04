# DeepFace

> Protect your content from deepfake manipulation with real-time immunization

## Overview
DeepFace is an innovative OBS plugin designed to protect your content from deepfake manipulation. By implementing advanced immunization techniques, DeepFace prevents deepfake models from successfully utilizing your recordings to create synthetic content.

### Benefits
DeepFace empowers creators with direct control over their content protection, eliminating dependency on platform-specific safeguards. With DeepFace, you can prevent:
- Unauthorized use of your likeness in inappropriate or sexual content
- Financial fraud through impersonation
- General misuse of your identity in synthetic media

## Installation and Setup Guide

### System Requirements
- OBS Studio 28.0.0 or higher
- OBS Websockets API (included by default in OBS 28+)
- Modern web browser (Chrome, Firefox, Edge recommended)
- Stable internet connection

### Configuration Steps

#### 1. OBS Setup
   - Open OBS Studio
   - Navigate to Tools → Websocket Server Settings
   - Enable the Websocket Server in plugin settings
   - Click "Show Connect Info" and copy your password

#### 2. DeepFace Configuration
   - Visit https://deepfacegenai.netlify.app/
   - Click "Get Started"
   - Enter your connection details:
     - OBS Websocket Address (default port: 4455)
     - Paste your OBS websocket password
   - (Optional) Adjust Protection Weighting parameters to customize your security settings

#### 3. Activation
   - Click "Connect and Continue"
   - You'll see a split-screen view of your facecam:
     - Left side: Original unprotected feed
     - Right side: Protected feed preview
   - Click "Apply Protection" to activate
   - Use the Hash Visualization display to monitor and adjust your protection strength using the provided sliders

#### 4. Start Recording
   - Return to OBS
   - Begin your recording session
   - All recorded content will now be automatically protected by DeepFace's immunization system

### Troubleshooting

If you encounter connection issues:
1. Verify that OBS is running and the Websocket Server is enabled
2. Confirm your password was copied correctly
3. Check that port 4455 isn't blocked by your firewall
4. Ensure you're using a compatible OBS version
