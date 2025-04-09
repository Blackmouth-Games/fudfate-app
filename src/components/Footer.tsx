
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { socialLinks } from '@/config/socialConfig';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
          <div className="mb-2 sm:mb-0 flex items-center">
            &copy; {currentYear} FudFate · <span className="ml-1">Created by Blackmouthgames</span>
          </div>
          
          <div className="flex space-x-3 mb-2 sm:mb-0">
            <a 
              href={socialLinks.web} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-accent transition-colors"
              aria-label="Website"
            >
              <Globe size={16} />
            </a>
            <Link to="/cookies" className="text-gray-400 hover:text-accent transition-colors">
              {t('footer.cookiePolicy')}
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-accent transition-colors">
              {t('footer.privacyPolicy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
