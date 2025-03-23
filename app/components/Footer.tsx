import { motion } from 'framer-motion';
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  // Animation variants for text and links
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const linkVariants = {
    hover: {
      y: -3,
      color: '#93c5fd',
      transition: { duration: 0.3 },
    },
  };

  const iconVariants = {
    hover: {
      scale: 1.2,
      rotate: 10,
      transition: { duration: 0.3 },
    },
  };

  return (
    <footer className="p-6 bg-gradient-to-t from-blue-900 via-indigo-900 to-blue-800 text-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Copyright */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="text-sm md:text-base mb-4"
        >
          © 2025 StreamShield. All rights reserved.
        </motion.p>

        {/* Links */}
        <div className="flex justify-center space-x-6 mb-6">
              {[
              { text: 'Privacy Policy', href: '/privacy', onClick: () => alert('Privacy Policy clicked') },
              { text: 'Terms of Service', href: '/terms', onClick: () => alert('Terms of Service clicked') },
              { text: 'Contact Us', href: '/contact', onClick: () => alert('Contact Us clicked') },
              ].map((item, index) => (
              <motion.a
                key={item.text}
                href={item.href}
                onClick={item.onClick}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                variants={{ ...textVariants, ...linkVariants }}
                transition={{ delay: index * 0.2 }}
                className="text-blue-400 font-medium hover:underline"
              >
                {item.text}
              </motion.a>
              ))}
        </div>

        {/* Social Icons */}
        <div className="flex justify-center space-x-6">
          {[
            { icon: FaTwitter, href: 'https://twitter.com' },
            { icon: FaGithub, href: 'https://github.com' },
            { icon: FaLinkedin, href: 'https://linkedin.com' },
          ].map((social, index) => (
            <motion.a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover="hover"
              variants={iconVariants}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="text-blue-300 text-2xl hover:text-blue-200"
            >
              <social.icon />
            </motion.a>
          ))}
        </div>
      </div>

      {/* Subtle Decorative Line */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 1, delay: 0.8 }}
        className="mt-6 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
      />
    </footer>
  );
}