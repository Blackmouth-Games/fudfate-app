
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageSwitcherProps {
  className?: string;
}

type Language = {
  code: string;
  name: string;
  flag: string;
};

// Map language codes to names and flags
const getLanguageInfo = (code: string): Language => {
  const languageMap: Record<string, { name: string; flag: string }> = {
    en: { name: 'English', flag: '🇺🇸' },
    es: { name: 'Español', flag: '🇪🇸' },
    fr: { name: 'Français', flag: '🇫🇷' },
    de: { name: 'Deutsch', flag: '🇩🇪' },
    it: { name: 'Italiano', flag: '🇮🇹' },
    pt: { name: 'Português', flag: '🇵🇹' },
    ru: { name: 'Русский', flag: '🇷🇺' },
    zh: { name: '中文', flag: '🇨🇳' },
    ja: { name: '日本語', flag: '🇯🇵' },
    ko: { name: '한국어', flag: '🇰🇷' },
    // Add more languages as needed
  };

  // Default values for unknown language codes
  return {
    code,
    name: languageMap[code]?.name || code.toUpperCase(),
    flag: languageMap[code]?.flag || '🌐'
  };
};

const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);

  useEffect(() => {
    // Get available languages from i18n
    const langCodes = Object.keys(i18n.options.resources || {});
    
    // Convert language codes to Language objects with name and flag
    const languages = langCodes.map(code => getLanguageInfo(code));
    
    // Sort languages alphabetically by name
    languages.sort((a, b) => a.name.localeCompare(b.name));
    
    setAvailableLanguages(languages);
  }, [i18n.options.resources]);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setOpen(false);
  };

  const currentLanguage = getLanguageInfo(i18n.language);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn("font-pixel gap-1.5 flex items-center", className)}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
            {i18n.language === lang.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
