import { motion } from 'framer-motion'; 

export default function Hero() {

  const handleOnClick = () => {
    window.location.href = '/home';
  };
  
  return (
    <section className="min-h-[80vh] flex flex-col justify-center items-center text-center p-4">
      <motion.h2
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-4xl md:text-5xl font-bold mb-4"
      >
        Stop Deepfakes Before They Start
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-lg md:text-xl mb-8"
      >
        Protect your live streams with real-time adversarial perturbations
      </motion.p>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        onClick={() => handleOnClick()}
      >
        Get Started
      </motion.button>
    </section>
  );
}