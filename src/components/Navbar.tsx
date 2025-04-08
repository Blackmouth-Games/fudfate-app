
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Smooth scroll function
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img 
                src="/img/logos/FUDFATE_logo.png" 
                alt="FUDfate Logo" 
                className="h-10 w-auto"
              />
            </Link>
          </div>
          
          {!isMobile ? (
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <button 
                  onClick={() => scrollToSection('hero')} 
                  className="text-black hover:text-accent px-3 py-2 rounded-md font-pixel"
                >
                  {t('nav.home')}
                </button>
                <button 
                  onClick={() => scrollToSection('about')} 
                  className="text-black hover:text-accent px-3 py-2 rounded-md font-pixel"
                >
                  {t('nav.about')}
                </button>
                <button 
                  onClick={() => scrollToSection('cards')} 
                  className="text-black hover:text-accent px-3 py-2 rounded-md font-pixel"
                >
                  {t('nav.cards')}
                </button>
                <Link 
                  to="https://app-fudfate.blackmouthgames.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-black font-bold px-4 py-2 rounded transition-colors pixel-btn pixel-btn-accent"
                >
                  {t('nav.app')}
                </Link>
                <LanguageSwitcher />
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <LanguageSwitcher />
              <button
                onClick={toggleMenu}
                className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-black hover:text-accent focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button 
              onClick={() => scrollToSection('hero')} 
              className="text-black hover:text-accent block px-3 py-2 rounded-md font-pixel w-full text-left"
            >
              {t('nav.home')}
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className="text-black hover:text-accent block px-3 py-2 rounded-md font-pixel w-full text-left"
            >
              {t('nav.about')}
            </button>
            <button 
              onClick={() => scrollToSection('cards')} 
              className="text-black hover:text-accent block px-3 py-2 rounded-md font-pixel w-full text-left"
            >
              {t('nav.cards')}
            </button>
            <Link 
              to="https://app-fudfate.blackmouthgames.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block w-full text-center text-black font-bold px-4 py-2 rounded transition-colors mt-4 pixel-btn pixel-btn-accent"
            >
              {t('nav.app')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
