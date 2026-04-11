'use client';

// import LandingNavbar from '@/components/landing/LandingNavbar';
// import HeroSection from '@/components/landing/HeroSection';
// import IntegrationStrip from '@/components/landing/IntegrationStrip';
// import BentoFeatures from '@/components/landing/BentoFeatures';
// import CopilotShowcase from '@/components/landing/CopilotShowcase';
// import DashboardShowcase from '@/components/landing/DashboardShowcase';
// import TestimonialsFooter from '@/components/landing/TestimonialsFooter';
import LandingPage from '@/components/landing/finlanding';
export default function HomePage() {
  return (
    // FIXED: overflow-x-hidden moved to an outer wrapper div, not on main
    // overflow-x-hidden on main breaks position:sticky and can misalign mx-auto containers
    // The outer div clips horizontal overflow while main remains a proper block container
    <div className="overflow-x-hidden">
      <main className="w-full min-h-screen bg-[#080B14] text-[#f0f4fa] font-sans selection:bg-indigo-500/30 antialiased">
        <LandingPage />
        {/* <LandingNavbar />
        <HeroSection />
        <IntegrationStrip />
        <BentoFeatures />
        <CopilotShowcase />
        <DashboardShowcase />
        <TestimonialsFooter /> */}
      </main>
    </div>
  );
}