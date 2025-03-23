import cv2
import numpy as np
import torch
from torchvision import transforms
from PIL import Image
import os

class VideoProcessor:
    def __init__(self, model, device, attack_params=None):
        """
        Initialize video processor with StarGAN model and attack parameters
        
        Args:
            model: StarGAN model instance
            device: torch device (cuda/cpu)
            attack_params: dict containing attack parameters (epsilon, k, a)
        """
        self.model = model
        self.device = device
        self.attack_params = attack_params or {'epsilon': 0.05, 'k': 10, 'a': 0.01}
        
        # Initialize image transforms
        self.transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
        ])
        
        self.inverse_transform = transforms.Compose([
            transforms.Normalize((-1, -1, -1), (2, 2, 2)),
            transforms.ToPILImage()
        ])

    def read_video(self, video_path):
        """
        Read video and return frames as PIL Images
        
        Args:
            video_path: path to video file
            
        Returns:
            list of PIL Images
        """
        cap = cv2.VideoCapture(video_path)
        frames = []
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            # Convert to PIL Image
            frame_pil = Image.fromarray(frame_rgb)
            frames.append(frame_pil)
            
        cap.release()
        return frames

    def extract_frames(self, video_path, output_dir):
        """
        Extract frames from a video and save them as images in the specified directory.
        
        Args:
            video_path: path to the input video file.
            output_dir: directory where the extracted frames will be saved.
        """
        os.makedirs(output_dir, exist_ok=True)  # Create the output directory if it doesn't exist
        cap = cv2.VideoCapture(video_path)
        frame_count = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            # Create a PIL Image from the frame
            frame_pil = Image.fromarray(frame_rgb)
            # Save the frame as an image
            frame_filename = os.path.join(output_dir, f"frame_{frame_count:04d}.png")
            frame_pil.save(frame_filename)
            frame_count += 1

        cap.release()
        print(f"Extracted {frame_count} frames to {output_dir}.")

    def process_frame(self, frame, c_trg):
        """
        Process a single frame through StarGAN model and attack
        
        Args:
            frame: PIL Image
            c_trg: target attribute vector (tensor of shape [1, c_dim])
            
        Returns:
            tuple of (original_stargan_output, perturbed_frame, perturbed_stargan_output)
        """
        # Get original dimensions
        orig_width, orig_height = frame.size
        
        # Transform frame to tensor
        x = self.transform(frame).unsqueeze(0).to(self.device)
        
        # Ensure c_trg is a tensor with correct shape
        if isinstance(c_trg, tuple):
            c_trg = c_trg[0]  # Take first element if it's a tuple
        c_trg = c_trg.to(self.device)
        
        # Get original StarGAN output
        with torch.no_grad():
            original_output, _ = self.model(x, c_trg)
        original_output_pil = self.inverse_transform(original_output.squeeze(0))
        original_output_pil = original_output_pil.resize((orig_width, orig_height), Image.Resampling.LANCZOS)
        
        # Apply attack if parameters are provided
        if self.attack_params:
            from attacks import LinfPGDAttack
            adversary = LinfPGDAttack(
                model=self.model,
                device=self.device,
                epsilon=self.attack_params['epsilon'],
                k=self.attack_params['k'],
                a=self.attack_params['a']
            )
            # Get the original output as target
            with torch.no_grad():
                target_output, _ = self.model(x, c_trg)
            # Get perturbed frame
            x_adv, _ = adversary.perturb(x, target_output, c_trg)
            perturbed_frame = self.inverse_transform(x_adv.squeeze(0))
            perturbed_frame = perturbed_frame.resize((orig_width, orig_height), Image.Resampling.LANCZOS)
            
            # Get StarGAN output on perturbed frame
            with torch.no_grad():
                perturbed_output, _ = self.model(x_adv, c_trg)
            perturbed_output_pil = self.inverse_transform(perturbed_output.squeeze(0))
            perturbed_output_pil = perturbed_output_pil.resize((orig_width, orig_height), Image.Resampling.LANCZOS)
        else:
            perturbed_frame = frame
            perturbed_output_pil = original_output_pil
            
        return original_output_pil, perturbed_frame, perturbed_output_pil

    def save_video(self, frames, output_path, fps=30):
        """
        Save processed frames as video
        
        Args:
            frames: list of PIL Images
            output_path: path to save video
            fps: frames per second
        """
        if not frames:
            return
            
        # Get frame size from first frame
        frame_size = frames[0].size
        
        # Initialize video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, frame_size)
        
        for frame in frames:
            # Convert PIL Image to numpy array
            frame_np = np.array(frame)
            # Convert RGB to BGR for OpenCV
            frame_bgr = cv2.cvtColor(frame_np, cv2.COLOR_RGB2BGR)
            out.write(frame_bgr)
            
        out.release()

    def process_video(self, input_path, output_base_path, c_trg, fps=30):
        """
        Process entire video through StarGAN model and attack
        
        Args:
            input_path: path to input video
            output_base_path: base path for output videos (without extension)
            c_trg: target attribute vector
            fps: frames per second for output video
        """
        # Read frames
        frames = self.read_video(input_path)
        
        # Process each frame
        original_outputs = []
        perturbed_frames = []
        perturbed_outputs = []
        
        for frame in frames:
            orig_output, pert_frame, pert_output = self.process_frame(frame, c_trg)
            original_outputs.append(orig_output)
            perturbed_frames.append(pert_frame)
            perturbed_outputs.append(pert_output)
            
        # Save all three videos
        self.save_video(original_outputs, f"{output_base_path}_original.mp4", fps)
        self.save_video(perturbed_frames, f"{output_base_path}_perturbed.mp4", fps)
        self.save_video(perturbed_outputs, f"{output_base_path}_perturbed_stargan.mp4", fps) 