
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { X, Telegram } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  // Get social links from environment variable or config
  const socialLinks = {
    x: process.env.SOCIAL_X_URL || 'https://twitter.com',
    telegram: process.env.SOCIAL_TELEGRAM_URL || 'https://t.me'
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <Link to="/" className="mb-4">
              <img 
                src="/img/logos/FUDFATE_logo.png" 
                alt="FUDfate Logo" 
                className="h-14 w-auto"
              />
            </Link>
            <p className="text-gray-600 text-sm text-center md:text-left">
              &copy; {currentYear} FudFate. <br/>{t('footer.rights')}
            </p>
            <p className="text-gray-600 text-sm mt-2 text-center md:text-left">
              Created by <a 
                href="https://blackmouthgames.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Blackmouth Games
              </a>
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <h3 className="gold-text text-lg mb-3 font-pixel">{t('footer.language')}</h3>
            <LanguageSwitcher />
          </div>
          
          <div className="flex flex-col items-center">
            <h3 className="gold-text text-lg mb-3 font-pixel">Social</h3>
            <div className="flex space-x-4">
              <a 
                href={socialLinks.x} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-accent transition-colors"
                aria-label="X (Twitter)"
              >
                <X size={24} />
              </a>
              <a 
                href={socialLinks.telegram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-accent transition-colors"
                aria-label="Telegram"
              >
                <Telegram size={24} />
              </a>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <h3 className="gold-text text-lg mb-3 font-pixel">Links</h3>
            <div className="flex flex-col space-y-2 items-center md:items-end">
              <Link to="/cookies" className="text-gray-700 hover:text-accent transition-colors">
                {t('footer.cookiePolicy')}
              </Link>
              <Link to="/privacy" className="text-gray-700 hover:text-accent transition-colors">
                {t('footer.privacyPolicy')}
              </Link>
              <Link to="https://app-fudfate.blackmouthgames.com/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-accent transition-colors">
                {t('nav.app')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
