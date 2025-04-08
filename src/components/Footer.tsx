
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          </div>
          
          <div className="flex flex-col items-center">
            <h3 className="gold-text text-lg mb-3 font-pixel">{t('footer.language')}</h3>
            <LanguageSwitcher />
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <h3 className="gold-text text-lg mb-3 font-pixel">Links</h3>
            <div className="flex flex-col space-y-2 items-center md:items-end">
              <Link to="/cookies" className="text-gray-700 hover:text-accent transition-colors">
                {t('footer.cookiePolicy')}
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
