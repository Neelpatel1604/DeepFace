import os
import argparse
from solver import Solver
from data_loader import get_loader
from torch.backends import cudnn
from torchvision import transforms
from PIL import Image


def str2bool(v):
    return v.lower() in ('true')

def load_single_image(image_path, image_size):
    transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ])
    image = Image.open(image_path).convert('RGB')
    image = transform(image).unsqueeze(0)  # Add batch dimension
    return image

def main(config):
    # For fast training.
    cudnn.benchmark = True

    # Create directories if not exist.
    if not os.path.exists(config.log_dir):
        os.makedirs(config.log_dir)
    if not os.path.exists(config.model_save_dir):
        os.makedirs(config.model_save_dir)
    if not os.path.exists(config.sample_dir):
        os.makedirs(config.sample_dir)
    if not os.path.exists(config.result_dir):
        os.makedirs(config.result_dir)

    # Data loader.
    celeba_loader = None
    rafd_loader = None

    if config.dataset in ['CelebA', 'Both']:
        celeba_loader = get_loader(config.celeba_image_dir, config.attr_path, config.selected_attrs,
                                   config.celeba_crop_size, config.image_size, config.batch_size,
                                   'CelebA', config.mode, config.num_workers)
    if config.dataset in ['RaFD', 'Both']:
        rafd_loader = get_loader(config.rafd_image_dir, None, None,
                                 config.rafd_crop_size, config.image_size, config.batch_size,
                                 'RaFD', config.mode, config.num_workers)
    

    # Solver for training and testing StarGAN.
    solver = Solver(celeba_loader, rafd_loader, config)

    if config.image_path:
        # Load single image
        image_tensor = load_single_image(config.image_path, config.image_size)

        # Initialize solver
        solver = Solver(None, None, config)

        # Run perturbation
        solver.test_attack_single(image_tensor)
    else:
        if config.mode == 'train':
            if config.dataset in ['CelebA', 'RaFD']:
                # Vanilla training
                # solver.train()
                # Generator adversarial training
                # solver.train_adv_gen()
                # G+D adversarial training
                solver.train_adv_both()
            elif config.dataset in ['Both']:
                solver.train_multi()
        elif config.mode == 'test':
            if config.dataset in ['CelebA', 'RaFD']:
                # Normal inference
                # solver.test()
                # Attack inference
                solver.test_attack()
                # Feature attack experiment
                # solver.test_attack_feats()
                # Conditional attack experiment
                # solver.test_attack_cond()
            elif config.dataset in ['Both']:
                solver.test_multi()


def process_video_main():
    """Main function for processing videos with StarGAN and attacks"""
    import argparse
    from solver import Solver
    from video_processor import VideoProcessor
    import torch

    # Parse arguments
    parser = argparse.ArgumentParser()
    parser.add_argument('--mode', type=str, default='test', choices=['train', 'test'])
    parser.add_argument('--dataset', type=str, default='CelebA', choices=['CelebA', 'RaFD', 'Both'])
    parser.add_argument('--batch_size', type=int, default=16)
    parser.add_argument('--num_iters', type=int, default=200000)
    parser.add_argument('--num_iters_decay', type=int, default=100000)
    parser.add_argument('--g_lr', type=float, default=0.0001)
    parser.add_argument('--d_lr', type=float, default=0.0001)
    parser.add_argument('--n_critic', type=int, default=5)
    parser.add_argument('--beta1', type=float, default=0.5)
    parser.add_argument('--beta2', type=float, default=0.999)
    parser.add_argument('--resume_iters', type=int, default=200000)
    parser.add_argument('--selected_attrs', '--list', nargs='+', help='selected attributes for the CelebA dataset',
                        default=['Black_Hair', 'Blond_Hair', 'Brown_Hair', 'Male', 'Young'])
    parser.add_argument('--test_iters', type=int, default=200000)
    parser.add_argument('--num_workers', type=int, default=1)
    parser.add_argument('--use_tensorboard', type=str2bool, default=False)
    parser.add_argument('--device_id', type=int, default=0)
    parser.add_argument('--log_dir', type=str, default='stargan_celeba_256/logs')
    parser.add_argument('--model_save_dir', type=str, default='stargan_celeba_256/models')
    parser.add_argument('--sample_dir', type=str, default='stargan_celeba_256/samples')
    parser.add_argument('--result_dir', type=str, default='stargan_celeba_256/results')
    parser.add_argument('--log_step', type=int, default=10)
    parser.add_argument('--sample_step', type=int, default=1000)
    parser.add_argument('--model_save_step', type=int, default=10000)
    parser.add_argument('--lr_update_step', type=int, default=1000)
    parser.add_argument('--celeba_image_dir', type=str, default='data/celeba/images')
    parser.add_argument('--attr_path', type=str, default='data/celeba/list_attr_celeba.txt')
    parser.add_argument('--rafd_image_dir', type=str, default='data/RaFD/train')
    parser.add_argument('--c_dim', type=int, default=5)
    parser.add_argument('--c2_dim', type=int, default=8)
    parser.add_argument('--celeba_crop_size', type=int, default=178)
    parser.add_argument('--rafd_crop_size', type=int, default=256)
    parser.add_argument('--image_size', type=int, default=256)
    parser.add_argument('--g_conv_dim', type=int, default=64)
    parser.add_argument('--d_conv_dim', type=int, default=64)
    parser.add_argument('--g_repeat_num', type=int, default=6)
    parser.add_argument('--d_repeat_num', type=int, default=6)
    parser.add_argument('--lambda_cls', type=float, default=1.0)
    parser.add_argument('--lambda_rec', type=float, default=10.0)
    parser.add_argument('--lambda_gp', type=float, default=10.0)
    parser.add_argument('--input_video', type=str, required=True, help='Path to input video')
    parser.add_argument('--output_video', type=str, required=True, help='Path to output video')
    parser.add_argument('--target_attr', type=str, required=True, help='Target attribute (e.g., "Male", "Young")')
    parser.add_argument('--attack_epsilon', type=float, default=0.05, help='Attack epsilon value')
    parser.add_argument('--attack_iterations', type=int, default=10, help='Number of attack iterations')
    parser.add_argument('--attack_step_size', type=float, default=0.01, help='Attack step size')
    config = parser.parse_args()

    # Set device
    device = torch.device(f'cuda:{config.device_id}' if torch.cuda.is_available() else 'cpu')
    
    # Initialize solver and load model
    solver = Solver(None, None, config)
    solver.build_model()
    solver.restore_model(config.resume_iters)
    
    # Initialize video processor
    processor = VideoProcessor(
        model=solver.G,
        device=device,
        attack_params={
            'epsilon': config.attack_epsilon,
            'k': config.attack_iterations,
            'a': config.attack_step_size
        }
    )
    
    # Create target attribute vector with batch dimension
    c_trg = torch.zeros(1, config.c_dim).to(device)  # Add batch dimension
    if config.target_attr in config.selected_attrs:
        idx = config.selected_attrs.index(config.target_attr)
        c_trg[0, idx] = 1  # Set the attribute for the first (and only) item in the batch
    
    # Process video
    print(f"Processing video: {config.input_video}")
    print(f"Target attribute: {config.target_attr}")
    processor.process_video(
        input_path=config.input_video,
        output_path=config.output_video,
        c_trg=c_trg,  # Pass the tensor directly
        fps=30
    )
    print(f"Video processing complete. Output saved to: {config.output_video}")

if __name__ == '__main__':
    process_video_main()