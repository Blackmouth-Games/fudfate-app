import React from 'react';
import { useTranslation } from 'react-i18next';
import AnimatedSection from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import GlitchLogo from '@/components/GlitchLogo';

const HeroSection = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <section id="hero" className="min-h-screen relative flex items-center justify-center py-16 px-4 md:px-8 lg:px-16 overflow-hidden">
      <div className="max-w-6xl w-full mx-auto text-center relative z-10">
        <AnimatedSection animation="fade-in" className="mb-6">
          <GlitchLogo imageUrl="/img/logos/logo.png" />
          <p className="text-xl md:text-2xl text-secondary font-pixel mb-8">
            {t('hero.subtitle')}
          </p>
        </AnimatedSection>
        <AnimatedSection animation="slide-in-up" delay={300} className="mb-10">
          <p className="text-lg md:text-xl text-gray-700 font-pixel max-w-3xl mx-auto">
            {t('hero.description')}
          </p>
        </AnimatedSection>
        <AnimatedSection animation="slide-in-up" delay={600}>
          <Button 
            variant="glitch" 
            onClick={onClick}
            data-text={t('hero.cta')}
            className="text-xl font-pixel glitch-button"
          >
            {t('hero.cta')}
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default HeroSection;
