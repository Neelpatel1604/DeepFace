import React from 'react';
import { motion } from 'framer-motion';
import Stepper, { Step } from './ui/stepper';

const HowItWorks: React.FC = () => {

  // Animation variants for steps
  const stepVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    exit: { opacity: 0, x: 50, transition: { duration: 0.4 } },
  };

  // Animation variants for the button
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.2, duration: 0.8, ease: 'easeOut' },
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
    <section className="py-16 px-8 bg-gradient-to-b from-emerald-50 to-yellow-50 text-gray-900">
      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-yellow-600"
      >
        How It Works
      </motion.h1>

      <div className="max-w-3xl mx-auto">
        <Stepper
          initialStep={1}
          onStepChange={(step) => console.log(`Step ${step}`)}
          onFinalStepCompleted={() => console.log("All steps completed!")}
          backButtonText="Previous"
          nextButtonText="Next"
        >
          {[
            {
              title: 'Launch OBS & Connect',
              content: 'Open OBS and link it to the DeepFace client.',
            },
            {
              title: 'Set DeepFace Parameters',
              content: (
                <>
                  Customize your settings for optimal protection.
                </>
              ),
            },
            {
              title: 'Start Recording',
              content:(
                <>
                 Hit protection and start recording in OBS and let DeepFace do its magic.
                 Adjust your strength and Protection Strength and Iteration.
                </>

              ),
            },
            {
              title: 'Download Your Video',
              content: 'Save your protected video with from OBS.',
            },
            {
              title: 'Deepfake-Proof Video',
              content: 'Your video is now immunized against deepfakes!',
            },
            {
              title: 'Thank Us Later',
              content: (
                <>
                  Enjoy peace of mind with top-tier security.
                  <motion.button
                    variants={buttonVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg relative z-10 mt-4"
                    onClick={handleOnClick}
                  >
                    Get Started
                  </motion.button>
                </>
              ),
            },
          ].map((step, index) => (
            <Step key={index}>
              <motion.div
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="p-6 bg-white rounded-xl shadow-lg border border-emerald-100"
              >
                <h2 className="text-2xl font-semibold text-emerald-700 mb-4">
                  {index + 1}. {step.title}
                </h2>
                <div className="text-gray-700">{step.content}</div>
              </motion.div>
            </Step>
          ))}
        </Stepper>
      </div>
    </section>
  );
};

export default HowItWorks;