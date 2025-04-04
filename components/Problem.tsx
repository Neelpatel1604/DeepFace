import { motion } from 'framer-motion';

export default function Problem() {
  // Animation variants for text
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  // Animation for the stat highlight
  const statVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, delay: 0.4, ease: 'easeOut' },
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  return (
    <section className="relative py-16 px-8 bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 -z-10" />

      {/* Heading */}
      <motion.h2
        initial="hidden"
        animate="visible"
        variants={textVariants}
        className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-500"
      >
        The Deepfake Threat
      </motion.h2>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto text-center">
        <motion.p
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="text-lg md:text-xl mb-6 leading-relaxed"
        >
          By 2025, an estimated{' '}
          <motion.span
            variants={statVariants}
            initial="hidden"
            animate={['visible', 'pulse']}
            className="inline-block px-2 py-1 bg-red-600 rounded-md font-bold text-white"
          >
            8 million deepfakes
          </motion.span>{' '}
          will flood online platforms, with over{' '}
          <span className="font-semibold text-red-400">90%</span> used for malicious purposes like non-consensual pornography, financial fraud, and misinformation.
        </motion.p>
        
        {/* Sources */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="text-sm text-gray-400"
        >
          Sources:{' '}
          <a
            href="https://www.security.org/resources/deepfake-statistics/"
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            Security.org
          </a>
          ,{' '}
          <a
            href="https://www.spiralytics.com/blog/deepfake-statistics/"
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            Spiralytics
          </a>
        </motion.p>
      </div>
    </section>
  );
}