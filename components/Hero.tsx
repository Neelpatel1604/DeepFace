import { motion } from 'framer-motion';
import FuzzyText from './ui/fuzzytext';

export default function Hero() {
  const handleOnClick = () => {
    window.location.href = '/home';
  };

  const hoverIntensity = 0.5;
  const enableHover = true;

  // Animation variants
  const circularTextVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 0.8,
      scale: 1,
      transition: { duration: 1.2, ease: 'easeOut' },
    },
    hover: {
      opacity: 1,
      scale: 1.1,
      rotate: 360,
      transition: { duration: 3, ease: 'linear', repeat: Infinity },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -70 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: 'easeOut', staggerChildren: 0.2 },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 1.4, duration: 0.8, ease: 'easeOut' },
    },
    hover: {
      scale: 1.15,
      boxShadow: '0 0 20px rgba(236, 72, 153, 0.9), 0 0 40px rgba(236, 72, 153, 0.5)',
      transition: { duration: 0.3 },
    },
  };

  return (
    <section className="relative min-h-[80vh] flex flex-col justify-center items-center text-center p-4 bg-gradient-to-br from-gray-950 via-purple-900 to-pink-900 text-white overflow-hidden">
      {/* Particle Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,#ec4899_0%,transparent_60%)] opacity-25 animate-pulse" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmY2FjY2EiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')] bg-repeat opacity-10 animate-twinkle" />
      </div>

      {/* Circular Rotating Text */}
      <motion.div
        variants={circularTextVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
     
      </motion.div>

      {/* Title with Fuzzy Effect */}
      <motion.h2
        variants={titleVariants}
        initial="hidden"
        animate="visible"
        className="text-5xl md:text-7xl font-extrabold mb-8 relative z-10"
      >
        <FuzzyText
          baseIntensity={0.1}
          hoverIntensity={hoverIntensity}
          enableHover={enableHover}
        >
          Stop
        </FuzzyText>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"
        >
          Deepfakes
        </motion.span>
        Before They Start
      </motion.h2>
      {/* Description */}
      <motion.p
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }}
        className="text-lg md:text-2xl mb-12 max-w-2xl leading-relaxed text-gray-200 drop-shadow-md"
      >
        Protect your live streams with real-time adversarial perturbations
      </motion.p>

      {/* Get Started Button */}
      <motion.button
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg relative z-10 border border-pink-400/50"
        onClick={handleOnClick}
      >
        Get Started
      </motion.button>

      {/* Custom CSS for particle twinkle effect */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        .animate-twinkle {
          animation: twinkle 4s infinite ease-in-out;
        }
      `}</style>
    </section>
  );
}