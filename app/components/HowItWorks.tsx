import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    { number: 1, title: 'Install the Plugin', description: 'Download and install our plugin for your streaming software.' },
    { number: 2, title: 'Configure Settings', description: 'Adjust the perturbation settings to your liking.' },
    { number: 3, title: 'Stream Confidently', description: 'Start streaming knowing your content is protected.' },
  ];

  return (
    <section className="p-8 bg-blue-900">
      <h2 className="text-3xl font-bold mb-4 text-center">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            className="text-center"
          >
            <div className="text-4xl font-bold mb-2">{step.number}</div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p>{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}