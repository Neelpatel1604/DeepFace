import { FaVideo, FaShieldAlt, FaBrain } from 'react-icons/fa';

export default function Solution() {
  return (
    <section className="p-8 bg-blue-900">
      <h2 className="text-3xl font-bold mb-4 text-center">Our Solution</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <FaVideo className="text-4xl mb-2 mx-auto" />
          <h3 className="text-xl font-semibold mb-2">Live Stream Protection</h3>
          <p>Adds perturbations in real time to your stream.</p>
        </div>
        <div className="text-center">
          <FaShieldAlt className="text-4xl mb-2 mx-auto" />
          <h3 className="text-xl font-semibold mb-2">Invisible to Viewers</h3>
          <p>Changes are imperceptible to your audience.</p>
        </div>
        <div className="text-center">
          <FaBrain className="text-4xl mb-2 mx-auto" />
          <h3 className="text-xl font-semibold mb-2">Confuses Deepfakes</h3>
          <p>Makes it difficult for AI to train deepfake models.</p>
        </div>
      </div>
    </section>
  );
}