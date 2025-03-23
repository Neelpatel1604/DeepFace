'use client';

import Header from './components/Header';
import Hero from './components/Hero';
import Problem from './components/Problem';
import Solution from './components/Solution';
import Features from './components/Features';
import Aurora from './components/ui/aurora';
import HowItWorks from './components/HowItWorks';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Head from 'next/head';

export default function Home() {


  return (
    <main className="relative min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Square Background - Only shown on landing page */}
     
        <div className="absolute inset-0 z-0">
         <Aurora
        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
        />
        
        </div>
    

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
      
          <div className="text-center">
            <Head>
                <title>StreamShield - Protect Your Streams from Deepfakes</title>
                <meta
                name="description"
                content="Protect your live streams from deepfake misuse with real-time adversarial perturbations."
                />
            </Head>
            <Header />
            <Hero />
            <Problem />
            <Solution />
            <Features />
            <HowItWorks />
            <CTA />
            <Footer />
          </div>
        </div>
    </main>
  );
}