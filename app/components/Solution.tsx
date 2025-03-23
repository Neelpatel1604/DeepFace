import { motion } from 'framer-motion';
import { FaVideo, FaShieldAlt, FaBrain } from 'react-icons/fa';

export default function Solution() {
  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: 'easeOut',
      },
    }),
    hover: {
      scale: 1.05,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
      transition: { duration: 0.3 },
    },
  };

  // Icon animation
  const iconVariants = {
    hover: {
      rotate: [0, 10, -10, 0],
      scale: 1.2,
      transition: { duration: 0.5, repeat: 1 },
    },
  };

  return (
    <section className="relative py-16 px-8 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#60a5fa_0%,transparent_50%)] opacity-30 -z-10" />

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-4xl md:text-5xl font-extrabold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300"
      >
        Our Cutting-Edge Solution
      </motion.h2>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: FaVideo,
            title: 'Live Stream Protection',
            desc: 'Adds perturbations in real-time to your stream.',
            color: 'from-blue-600 to-blue-800',
          },
          {
            icon: FaShieldAlt,
            title: 'Invisible to Viewers',
            desc: 'Changes are imperceptible to your audience.',
            color: 'from-indigo-600 to-indigo-800',
          },
          {
            icon: FaBrain,
            title: 'Confuses Deepfakes',
            desc: 'Makes it tough for AI to train deepfake models.',
            color: 'from-purple-600 to-purple-800',
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            custom={index}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={cardVariants}
            className={`p-6 rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}
          >
            {/* Animated Icon */}
            <motion.div
              variants={iconVariants}
              className="text-5xl mb-4 mx-auto text-blue-200"
            >
              <item.icon />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-sm opacity-85">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}