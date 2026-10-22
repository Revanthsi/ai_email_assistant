import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../sections/Hero';
import Features from '../sections/Features';
import FeatureHighlight from '../sections/FeatureHighlight';
import HowItWorks from '../sections/HowItWorks';
import InteractiveDemo from '../sections/InteractiveDemo';
import SecurityShowcase from '../sections/SecurityShowcase';
import ExplainableAI from '../sections/ExplainableAI';
import About from '../sections/About';
import CTA from '../sections/CTA';
import Footer from '../components/Footer';
import DemoModal from '../components/DemoModal';

const Home = () => {
  const navigate = useNavigate();
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'getStarted',
  });

  const handleOpenGetStarted = () => navigate('/app');

  const handleOpenSeeDemo = () => {
    setModalState({
      isOpen: true,
      type: 'seeDemo',
    });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col font-sans text-[#0F1F3D] overflow-x-hidden selection:bg-[#1677FF]/15 selection:text-[#1677FF]">
      {/* Sticky Navigation */}
      <Navbar onOpenGetStarted={handleOpenGetStarted} />

      {/* Main Sections */}
      <main className="flex-grow">
        <Hero
          onOpenGetStarted={handleOpenGetStarted}
          onOpenSeeDemo={handleOpenSeeDemo}
        />
        <Features />
        <FeatureHighlight />
        <HowItWorks />
        <InteractiveDemo />
        <SecurityShowcase />
        <ExplainableAI />
        <About />
        <CTA onOpenGetStarted={handleOpenGetStarted} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Frontend-Only Demonstration Modals */}
      <DemoModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        type={modalState.type}
      />
    </div>
  );
};

export default Home;
