DeepFace 

## What is DeepFace?
An OBS plugin that immunizes your recordings from being used in deepfakes. When a deepfake model tries to use you or your content, our immunization prevents the model from making any meaningful output. 
This is a big win for creators online, and helps them get protection without relying on platforms. Creators can make sure:
 - they aren’t being used in sexual content
 = their aren’t being used to defraud others
 = they aren’t being impersonated.

## How do I use DeepFace?

1. Launch your OBS client. Make sure your OBS has OBS Websockets API installed. (may not be downloaded for versions before 28)
2. In Tools, open Websocket Server Settings.
3. In plugin settings, click Enable Websocket Server.
4. In the Server Settings section, click Show Connect Info. Copy your password.
5. Launch https://deepfacegenai.netlify.app/
6. Click Get Started
7. In Connection Settings, type in your OBS Websocket Address and paste your copied password from earlier. The OBS Websocket Address is by default 4455.
8. If you'd like to customize your protection parameters before you connect, click Protection Weighting and adjust as needed.
9. Click Connect and Continue.
10. At this point, you will see two camera feeds of your facecam. The left stream is unprotected, and the right stream is set to be protected.
11. Click Apply Protection. A Hash Visualization will appear, demonstrating how strong your current protection is. You can use the sliders to change its strength and iteration count.
12. You can now return to your OBS client and start recording. Recorded videos will now be immunized using DeepFace.
