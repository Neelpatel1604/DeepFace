import { motion } from 'framer-motion';

export default function Features() {
  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.3, // Staggered entry
        duration: 0.6,
        ease: 'easeOut',
      },
    }),
    hover: {
      scale: 1.05,
      rotateX: 5,
      rotateY: 5,
      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
      transition: { duration: 0.3 },
    },
  };

  // Animation variants for the button
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 1.2, duration: 0.8, ease: 'easeOut' },
    },
    hover: {
      scale: 1.1,
      boxShadow: '0 0 15px rgba(59, 130, 246, 0.8)',
      transition: { duration: 0.3 },
    },
  };

  const handleOnClick = () => {
    window.location.href = '/home'; // Redirects to /home
  };

  return (
    <section className="relative py-20 px-8 overflow-hidden bg-gray-900 text-white">
      {/* Radial Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3b82f6_0%,#1e3a8a_50%,#111827_100%)] opacity-80 -z-10" />

      {/* Animated Heading */}
      <motion.h2
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-5xl md:text-6xl font-extrabold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
      >
        Unleash the Power
      </motion.h2>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            emoji: '⚡',
            title: 'Lightning Fast',
            desc: 'Real-time processing with <33ms latency',
            color: 'from-blue-500 to-blue-700',
          },
          {
            emoji: '🔌',
            title: 'Easy Integration',
            desc: 'Works with OBS, Streamlabs, and more',
            color: 'from-purple-500 to-purple-700',
          },
          {
            emoji: '🎛️',
            title: 'Customizable',
            desc: 'Adjust perturbation strength to your liking',
            color: 'from-green-500 to-green-700',
          },
          {
            emoji: '✅',
            title: 'Proven Effective',
            desc: 'Tested against top deepfake models',
            color: 'from-teal-500 to-teal-700',
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            custom={index}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={cardVariants}
            className={`relative p-6 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-xl transform-gpu`}
          >
            {/* Floating Emoji */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="text-5xl mb-4"
            >
              {feature.emoji}
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
            <p className="text-sm opacity-90">{feature.desc}</p>
            {/* Subtle Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-white opacity-10 blur-xl -z-10" />
          </motion.div>
        ))}
      </div>

      {/* Get Started Button */}
      <div className="mt-12 text-center">
        <motion.button
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg"
          onClick={handleOnClick}
        >
          Get Started
        </motion.button>
      </div>
    </section>
  );
}