import { useState } from 'react';

export default function CTA() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    // Add backend integration here later
    setEmail('');
  };

  return (
    <section className="p-8 text-center">
      <h2 className="text-3xl font-bold mb-4">Be the First to Know</h2>
      <p className="mb-4">
        Sign up now to join our waitlist and be among the first to access our beta when it’s ready.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row justify-center items-center gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="p-2 w-64 text-black rounded"
          required
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Join Waitlist
        </button>
      </form>
    </section>
  );
}