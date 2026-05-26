import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import Features from '../components/landing/Features';
import BoothStyles from '../components/landing/BoothStyles';
import Testimonials from '../components/landing/Testimonials';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <Hero />
      <HowItWorks />
      <Features />
      <BoothStyles />
      <Testimonials />
      <Footer />
    </div>
  );
}
