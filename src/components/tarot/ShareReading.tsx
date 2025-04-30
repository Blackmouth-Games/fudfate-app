import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Share2, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useTarot } from '@/contexts/TarotContext';
import { motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import html2canvas from 'html2canvas';

interface ShareReadingProps {
  className?: string;
}

const debug = (type: 'info' | 'error' | 'warn' | 'debug', ...args: any[]) => {
  const styles = {
    info: 'color: #00b894; font-weight: bold;',
    error: 'color: #d63031; font-weight: bold;',
    warn: 'color: #fdcb6e; font-weight: bold;',
    debug: 'color: #0984e3; font-weight: bold;'
  };
  
  console.log(`%c[ShareReading] ${type.toUpperCase()}:`, styles[type], ...args);
};

const ShareReading: React.FC<ShareReadingProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { intention, selectedCards, interpretation, finalMessage, webhookResponse, selectedDeck } = useTarot();
  const { walletAddress } = useWallet();
  const readingRef = useRef<HTMLDivElement>(null);

  // Log all relevant data when component renders
  React.useEffect(() => {
    console.log('=== ShareReading Debug Info ===');
    console.log('Selected Cards:', selectedCards);
    console.log('Webhook Response:', webhookResponse);
    console.log('Selected Deck:', selectedDeck);
  }, [selectedCards, webhookResponse, selectedDeck]);

  const getSelectedCards = () => {
    console.log('=== Getting Selected Cards ===');
    
    // 1. First try to get cards from webhook response
    if (webhookResponse) {
      console.log('Webhook response:', webhookResponse);
      
      // Try to get cards from returnwebhoock first
      if (webhookResponse.returnwebhoock) {
        try {
          const parsedData = JSON.parse(webhookResponse.returnwebhoock);
          console.log('Parsed webhook data:', parsedData);
          
          if (parsedData.selected_cards && Array.isArray(parsedData.selected_cards)) {
            const cards = parsedData.selected_cards.map((cardId: number) => {
              const cardName = getCardName(cardId);
              return {
                id: cardId.toString(),
                name: cardName,
                cardId: cardId.toString()
              };
            });
            console.log('Using cards from parsed webhook:', cards);
            return cards;
          }
        } catch (e) {
          console.error('Error parsing webhook data:', e);
        }
      }
      
      // Then try selected_cards directly from webhook
      if (webhookResponse.selected_cards && Array.isArray(webhookResponse.selected_cards)) {
        const cards = webhookResponse.selected_cards.map((cardId: number) => {
          const cardName = getCardName(cardId);
          return {
            id: cardId.toString(),
            name: cardName,
            cardId: cardId.toString()
          };
        });
        console.log('Using cards directly from webhook:', cards);
        return cards;
      }
    }
    
    // 2. If no webhook cards found, use manually selected cards
    if (selectedCards && selectedCards.length > 0) {
      console.log('Using manually selected cards:', selectedCards);
      return selectedCards;
    }
    
    console.warn('No cards found in any source');
    return [];
  };

  const getCardName = (cardId: number): string => {
    const cardNames: { [key: number]: string } = {
      0: 'TheDegen',
      1: 'TheMiner',
      13: 'TheRugpull',
      20: 'TheHalving',
      19: 'TheMemecoin',
      10: 'TheAirdrop'
      // Add more mappings as needed
    };
    return cardNames[cardId] || `Card${cardId}`;
  };

  const getWebhookMessage = (): string => {
    if (finalMessage) return finalMessage;
    
    if (webhookResponse) {
      if (Array.isArray(webhookResponse) && webhookResponse.length > 0) {
        if (webhookResponse[0].message) return webhookResponse[0].message;
        
        if (webhookResponse[0].returnwebhoock) {
          try {
            const parsedData = JSON.parse(webhookResponse[0].returnwebhoock);
            if (parsedData && parsedData.message) return parsedData.message;
          } catch (e) {
            console.error("Error parsing webhook message for sharing:", e);
          }
        }
      } else if (typeof webhookResponse === 'object' && webhookResponse !== null) {
        if (webhookResponse.message) return webhookResponse.message;
        
        if (webhookResponse.returnwebhoock) {
          try {
            const parsedData = JSON.parse(webhookResponse.returnwebhoock);
            if (parsedData && parsedData.message) return parsedData.message;
          } catch (e) {
            console.error("Error parsing webhook message for sharing:", e);
          }
        }
      }
    }
    
    return interpretation?.summary || "";
  };

  const downloadImage = async () => {
    if (!readingRef.current) return;

    const loadingToast = toast.loading('Generating image...');

    try {
      debug('info', 'Starting image generation process');
      debug('debug', 'Selected cards:', selectedCards);

      // Esperar a que las imágenes se carguen
      const images = readingRef.current.getElementsByTagName('img');
      debug('info', `Found ${images.length} images to load`);

      const imagePromises = Array.from(images).map((img, index) => {
        return new Promise((resolve, reject) => {
          if (img.complete) {
            debug('debug', `Image ${index} already loaded:`, img.src);
            resolve(null);
            return;
          }

          img.onload = () => {
            debug('debug', `Image ${index} loaded successfully:`, img.src);
            resolve(null);
          };

          img.onerror = (error) => {
            debug('error', `Error loading image ${index}:`, img.src, error);
            // Resolvemos en lugar de rechazar para no bloquear el proceso
            resolve(null);
          };

          debug('debug', `Waiting for image ${index} to load:`, img.src);
        });
      });

      debug('info', 'Waiting for all images to load...');
      await Promise.all(imagePromises);
      debug('info', 'All images loaded or handled');

      debug('info', 'Starting canvas generation...');
      const canvas = await html2canvas(readingRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        onclone: (clonedDoc) => {
          debug('debug', 'Cloning document for canvas...');
          const element = clonedDoc.querySelector('[data-reading-container]') as HTMLElement;
          if (element) {
            element.style.transform = 'none';
            element.style.position = 'relative';
            element.style.left = '0';
            debug('debug', 'Adjusted cloned element styles');
          } else {
            debug('warn', 'Could not find reading container in cloned document');
          }
        }
      });
      debug('info', 'Canvas generated successfully');

      canvas.toBlob((blob) => {
        if (!blob) {
          debug('error', 'Failed to create blob from canvas');
          toast.dismiss(loadingToast);
          toast.error('Could not generate image');
          return;
        }

        debug('info', 'Creating download link...');
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'fudfate-reading.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.dismiss(loadingToast);
        toast.success('Image downloaded! You can now attach it to your tweet.');
        debug('info', 'Image generation and download completed successfully');
      }, 'image/png', 1.0);

    } catch (error) {
      debug('error', 'Error in image generation process:', error);
      toast.dismiss(loadingToast);
      toast.error('Could not generate image');
    }
  };

  const shareOnTwitter = () => {
    if (!selectedCards.length) return;
    
    let shareMessage = getWebhookMessage();
    const maxMsgLength = 180;
    
    if (shareMessage.length > maxMsgLength) {
      shareMessage = shareMessage.substring(0, maxMsgLength) + '...';
    }
    
    const text = t('tarot.shareText', {
      cards: selectedCards.map(card => card.name).join(', '),
      intention: intention.length > 30 ? intention.substring(0, 30) + '...' : intention,
      message: shareMessage ? `"${shareMessage}"` : ''
    });

    const url = 'https://app.fudfate.xyz/';
    const token = '$FDft @FUDfate';
    const hashtags = 'FUDfate,Tarot,Crypto';

    const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}&via=${encodeURIComponent('FUDfate')}&text=${encodeURIComponent(`via $FDft`)}`;
    window.open(twitterUrl, '_blank');
  };

  const copyToClipboard = () => {
    if (!selectedCards.length) return;
    
    const cardNames = selectedCards
      .map(card => card.name)
      .join(', ');
    
    let shareMessage = getWebhookMessage();
    
    if (shareMessage.length > 280) {
      shareMessage = shareMessage.substring(0, 277) + '...';
    }
    
    const text = t('tarot.shareClipboardText', {
      cards: cardNames,
      intention: intention,
      interpretation: shareMessage || ''
    });
    
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(t('tarot.copiedToClipboard'));
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        toast.error(t('tarot.copyFailed'));
      });
  };

  const getCardFileName = (card: any) => {
    console.log('Processing card:', card);
    
    const id = card.id || card.cardId;
    if (!id) {
      console.warn('No card ID found, using default');
      return '0_TheDegen.jpg';
    }
    
    const cardName = getCardName(parseInt(id));
    const fileName = `${id}_${cardName}.jpg`;
    console.log('Generated filename:', fileName);
    return fileName;
  };

  return (
    <>
      <div 
        ref={readingRef}
        data-reading-container
        className="fixed left-[-9999px]"
        style={{ 
          width: '1200px',
          padding: '40px',
          background: 'linear-gradient(45deg, #000066, #6600cc)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Grid Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(0deg, transparent 0%, rgba(0, 0, 0, 0.3) 2%, transparent 3%),
            linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.3) 2%, transparent 3%),
            linear-gradient(180deg, rgba(255, 0, 255, 0.1) 0%, rgba(0, 255, 255, 0.1) 100%)
          `,
          backgroundSize: '40px 40px, 40px 40px, 100% 100%',
          transform: 'perspective(500px) rotateX(30deg)',
          transformOrigin: 'center center',
          opacity: 0.5,
          zIndex: 0
        }} />

        {/* Horizontal lines for retro effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0px, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 2px)',
          backgroundSize: '100% 4px',
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 1
        }} />

        <div className="flex flex-col items-center space-y-8" style={{
          position: 'relative',
          zIndex: 2,
          background: 'radial-gradient(circle at center, rgba(255, 0, 255, 0.2) 0%, rgba(0, 255, 255, 0.2) 100%)',
          backdropFilter: 'blur(5px)',
          padding: '20px',
          borderRadius: '20px'
        }}>
          <div className="flex items-center gap-4">
            <img 
              src="/img/logos/FUDFATE_logo.png" 
              alt="FudFate Logo" 
              className="h-16 w-auto"
              crossOrigin="anonymous"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(255, 0, 255, 0.5))'
              }}
            />
          </div>
          
          <div className="text-2xl text-center" style={{
            color: '#00ffff',
            textShadow: '2px 2px 4px rgba(255, 0, 255, 0.5), -2px -2px 4px rgba(0, 255, 255, 0.5)',
            fontStyle: 'italic'
          }}>
            <p>"{intention}"</p>
          </div>
          
          <div className="flex justify-center gap-8">
            {getSelectedCards().map((card, index) => {
              const fileName = getCardFileName(card);
              console.log(`Card ${index} filename:`, fileName);
              
              return (
                <div key={index} style={{
                  width: '320px',
                  height: '512px',
                  background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
                  borderRadius: '16px',
                  padding: '3px',
                  boxShadow: '0 0 20px rgba(255, 0, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#000033',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {/* Decorative border */}
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      right: '8px',
                      bottom: '8px',
                      border: '2px solid rgba(255, 0, 255, 0.3)',
                      borderRadius: '8px',
                      pointerEvents: 'none',
                      boxShadow: 'inset 0 0 10px rgba(0, 255, 255, 0.2)'
                    }} />
                    <img 
                      src={`/img/cards/${selectedDeck}/${fileName}`}
                      alt={card.name}
                      crossOrigin="anonymous"
                      style={{ 
                        width: 'calc(100% - 32px)',
                        height: 'calc(100% - 32px)',
                        objectFit: 'contain',
                        borderRadius: '4px',
                        filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.3))'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error('Failed to load image:', target.src);
                        target.src = `/img/cards/${selectedDeck}/0_TheDegen.jpg`;
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-xl text-center max-w-4xl" style={{
            color: '#ffffff',
            textShadow: '2px 2px 4px rgba(255, 0, 255, 0.5)',
            background: 'linear-gradient(90deg, rgba(255, 0, 255, 0.2), rgba(0, 255, 255, 0.2))',
            padding: '20px',
            borderRadius: '8px',
            fontStyle: 'italic',
            backdropFilter: 'blur(5px)'
          }}>
            <p>"{getWebhookMessage()}"</p>
          </div>
          
          <div className="text-lg mt-4" style={{
            color: '#00ffff',
            textShadow: '1px 1px 2px rgba(255, 0, 255, 0.3), -1px -1px 2px rgba(0, 255, 255, 0.3)'
          }}>
            <p>Visit app.fudfate.xyz for your own reading</p>
          </div>
        </div>
      </div>

      <motion.div 
        className={`flex flex-col sm:flex-row items-center justify-center gap-3 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <Button
          variant="outline"
          onClick={copyToClipboard}
          className="w-full sm:w-auto flex items-center gap-2 border-amber-300 hover:bg-amber-50"
        >
          <Share2 className="h-4 w-4" />
          {t('tarot.copyReading')}
        </Button>

        <Button
          variant="outline"
          onClick={downloadImage}
          className="w-full sm:w-auto flex items-center gap-2 border-amber-300 hover:bg-amber-50"
        >
          <Download className="h-4 w-4" />
          Download Image
        </Button>
        
        <Button
          onClick={shareOnTwitter}
          className="w-full sm:w-auto flex items-center gap-2 bg-black hover:bg-gray-800 text-white"
        >
          <X className="h-4 w-4" />
          {t('tarot.shareOnX')}
        </Button>
      </motion.div>
    </>
  );
};

export default ShareReading;

