import { motion } from 'framer-motion';

export default function Header() {
  // Animation variants for the logo
  const logoVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    hover: {
      scale: 1.05,
      textShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
      transition: { duration: 0.3 },
    },
  };

  return (
    <header className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <motion.h1
          initial="hidden"
          animate="visible"
          whileHover="hover"
          variants={logoVariants}
          className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300 cursor-pointer"
        >
          DeepFace
        </motion.h1>

        {/* Navigation */}


        {/* Mobile Menu Toggle (Optional) */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="md:hidden text-2xl focus:outline-none"
          aria-label="Toggle menu"
        >
          ☰
        </motion.button>
      </div>
    </header>
  );
}