
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GlitchText from '@/components/GlitchText';
import AnimatedSection from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import BackToTop from '@/components/BackToTop';
import GlitchLogo from '@/components/GlitchLogo';
import TarotCardSection from '@/components/TarotCardSection';

const Index = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleClick = () => {
    window.open('https://app-fudfate.blackmouthgames.com/', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <BackToTop />
      
      {/* Hero Section */}
      <section id="hero" className="min-h-screen relative flex items-center justify-center py-16 px-4 md:px-8 lg:px-16 overflow-hidden">
        <div className="max-w-6xl w-full mx-auto text-center relative z-10">
          <AnimatedSection animation="fade-in" className="mb-6">
            <GlitchLogo 
              imageUrl="/img/logos/FUDFATE_logo.png" 
            />
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
              onClick={handleClick}
              data-text={t('hero.cta')}
              className="text-xl font-pixel glitch-button"
            >
              {t('hero.cta')}
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 md:px-8 lg:px-16 relative">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection animation="fade-in" className="mb-12 text-center">
            <GlitchText text={t('about.title')} goldEffect className="text-3xl md:text-4xl font-pixel-2p mb-6 text-black" />
            <p className="text-lg md:text-xl text-gray-700 font-pixel max-w-3xl mx-auto">
              {t('about.description')}
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection animation="slide-in-up" delay={100} className="bg-white gold-frame p-6 rounded-lg text-center">
              <h3 className="text-xl font-pixel gold-text mb-3">{t('about.feature1')}</h3>
              <p className="text-gray-700">Unique pixel art style blending classic tarot and modern crypto aesthetics</p>
            </AnimatedSection>
            
            <AnimatedSection animation="slide-in-up" delay={300} className="bg-white gold-frame p-6 rounded-lg text-center">
              <h3 className="text-xl font-pixel gold-text mb-3">{t('about.feature2')}</h3>
              <p className="text-gray-700">Features beloved crypto memes and characters from the Web3 universe</p>
            </AnimatedSection>
            
            <AnimatedSection animation="slide-in-up" delay={500} className="bg-white gold-frame p-6 rounded-lg text-center">
              <h3 className="text-xl font-pixel gold-text mb-3">{t('about.feature3')}</h3>
              <p className="text-gray-700">Predict your crypto future with our digital oracle and navigate market FUD</p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <TarotCardSection />

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16" style={{ backgroundColor: '#FAD12B' }}>
        <div className="max-w-6xl mx-auto text-center">
          <AnimatedSection animation="fade-in" className="mb-6">
            <GlitchText text={t('cta.title')} goldEffect className="text-3xl md:text-4xl font-pixel-2p mb-4 text-black" />
            <p className="text-lg md:text-xl text-gray-700 font-pixel max-w-3xl mx-auto mb-8">
              {t('cta.subtitle')}
            </p>
          </AnimatedSection>
          <AnimatedSection animation="slide-in-up" delay={300}>
            <Button 
              variant="glitch" 
              onClick={handleClick} 
              data-text="Reveal Your Destiny"
              className="text-xl font-pixel glitch-button"
            >
              Reveal Your Destiny
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Index;
