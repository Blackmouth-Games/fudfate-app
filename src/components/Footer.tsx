
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { X, MessageCircle, Github } from 'lucide-react';
import { socialLinks } from '@/config/socialConfig';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-2 sm:mb-0">
            &copy; {currentYear} FudFate
          </div>
          
          <div className="flex space-x-4 mb-2 sm:mb-0">
            <a 
              href={socialLinks.x} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-accent transition-colors"
              aria-label="X (Twitter)"
            >
              <X size={18} />
            </a>
            <a 
              href={socialLinks.telegram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-accent transition-colors"
              aria-label="Telegram"
            >
              <MessageCircle size={18} />
            </a>
            <a 
              href={socialLinks.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-accent transition-colors"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
          </div>
          
          <div className="flex space-x-4">
            <Link to="/cookies" className="text-gray-500 hover:text-accent transition-colors">
              {t('footer.cookiePolicy')}
            </Link>
            <Link to="/privacy" className="text-gray-500 hover:text-accent transition-colors">
              {t('footer.privacyPolicy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
