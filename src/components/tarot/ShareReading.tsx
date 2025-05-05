import React, { useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Share2, Download, X, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useTarot } from '@/contexts/TarotContext';
import html2canvas from 'html2canvas';
import { ReadingCard } from '@/types/tarot';
import { DownloadHistoryEntry } from '@/types/debug';
import tarotCards from '@/data/tarotCards';

interface ShareReadingProps {
  className?: string;
  readingData?: {
    intention: string;
    selectedCards: ReadingCard[];
    interpretation: string;
    finalMessage: string;
  };
  onCopyToClipboard?: () => void;
  onShareOnTwitter?: () => void;
  source?: 'reading' | 'history';
}

// Extend Window interface to include our custom property
declare global {
  interface Window {
    imageDownloadHistory: Array<{
      url: string;
      timestamp: number;
      success: boolean;
      error?: string;
      cards?: Array<{
        name: string;
        id: string | number;
        image: string;
      }>;
      intention?: string;
      source: string;
    }>;
  }
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

const ShareReading: React.FC<ShareReadingProps> = ({ 
  className = '', 
  readingData,
  source = 'reading',
  onCopyToClipboard,
  onShareOnTwitter
}) => {
  const { t } = useTranslation();
  const { 
    intention: currentIntention, 
    selectedCards: contextSelectedCards, 
    interpretation: contextInterpretation, 
    finalMessage: contextFinalMessage, 
    webhookResponse, 
    selectedDeck 
  } = useTarot();
  const readingRef = useRef<HTMLDivElement>(null);

  // Función para obtener una carta del deck actual por su ID numérico
  const getCardFromDeck = (cardId: number): ReadingCard | undefined => {
    debug('debug', `Getting card from deck: ID=${cardId}, Deck=${selectedDeck}`);
    
    try {
      // Filtrar cartas por el deck actual
      const deckCards = tarotCards.filter(card => card.deck === selectedDeck);
      debug('debug', `Found ${deckCards.length} cards in deck ${selectedDeck}`);
      
      // Buscar la carta por su ID numérico
      const cardInfo = deckCards.find(card => {
        // Intentar extraer el ID del nombre del archivo de imagen
        const filename = card.image.split('/').pop() || '';
        const match = filename.match(/^(\d+)_/);
        const numericId = match ? parseInt(match[1]) : null;
        
        debug('debug', `Comparing card: filename=${filename}, extractedId=${numericId}, targetId=${cardId}`);
        return numericId === cardId;
      });

      if (!cardInfo) {
        debug('warn', `Card not found in deck ${selectedDeck} with ID ${cardId}`);
        return undefined;
      }

      // Extraer el nombre del archivo de la imagen original
      const originalFilename = cardInfo.image.split('/').pop() || '';
      // Asegurarse de que la extensión sea .jpg
      const filenameWithoutExt = originalFilename.replace(/\.[^/.]+$/, "");
      // Construir la ruta de la imagen usando el mismo formato que el original pero con .jpg
      const imagePath = `/img/cards/${selectedDeck}/${filenameWithoutExt}.jpg`;
      
      debug('info', 'Found card:', {
        id: cardId,
        name: cardInfo.name,
        imagePath: imagePath,
        originalImage: cardInfo.image,
        deck: selectedDeck
      });

      return {
        id: String(cardId),
        name: cardInfo.name,
        image: imagePath,
        description: cardInfo.description,
        revealed: true,
        deck: selectedDeck
      };
    } catch (error) {
      debug('error', 'Error getting card from deck:', error);
      return undefined;
    }
  };

  // Determinar las cartas a mostrar
  const displayCards = useMemo(() => {
    debug('info', 'Determining cards to display', {
      hasReadingData: !!readingData,
      hasWebhookResponse: !!webhookResponse,
      webhookCards: webhookResponse?.selected_cards,
      source
    });
    
    try {
      // Caso 1: Lectura del historial (mayor prioridad)
      if (source === 'history' && readingData?.selectedCards?.length) {
        debug('info', 'Using history cards:', readingData.selectedCards);
        return readingData.selectedCards;
      }
      
      // Caso 2: Lectura actual con respuesta del webhook
      if (webhookResponse?.selected_cards) {
        const webhookCards = webhookResponse.selected_cards;
        debug('info', 'Using webhook cards:', webhookCards);

        // Convertir directamente los IDs del webhook a cartas usando el deck seleccionado
        const cards = webhookCards
          .map(webhookId => {
            const card = getCardFromDeck(webhookId);
            if (!card) {
              debug('warn', `Could not create card for webhook ID ${webhookId}`);
              return null;
            }
            debug('info', `Created card for webhook ID ${webhookId}:`, card);
            return card;
          })
          .filter((card): card is ReadingCard => card !== null);

        if (cards.length > 0) {
          debug('info', 'Final webhook cards:', cards);
          return cards;
        }
      }
      
      // Caso 3: Fallback a las cartas del contexto
      if (contextSelectedCards?.length) {
        debug('info', 'Using context cards:', contextSelectedCards);
        return contextSelectedCards;
      }

      debug('warn', 'No valid cards found, returning empty array');
      return [];
    } catch (error) {
      debug('error', 'Error in displayCards:', error);
      return [];
    }
  }, [readingData, webhookResponse, contextSelectedCards, selectedDeck, source]);

  // Determinar el mensaje/interpretación a mostrar
  const displayMessage = useMemo(() => {
    debug('info', 'Determining message to display');
    
    // Caso 1: Mensaje del historial
    if (source === 'history' && readingData?.interpretation) {
      debug('info', 'Using history interpretation');
      return String(readingData.interpretation);
    }
    
    // Caso 2: Mensaje del webhook
    if (webhookResponse?.message) {
      debug('info', 'Using webhook message:', webhookResponse.message);
      return String(webhookResponse.message);
    }
    
    // Caso 3: Mensaje del contexto
    debug('info', 'Using context message:', contextFinalMessage);
    return String(contextFinalMessage || contextInterpretation || t('tarot.noMessageAvailable'));
  }, [readingData, webhookResponse, contextFinalMessage, contextInterpretation, source, t]);

  // Determinar la intención/pregunta a mostrar
  const displayIntention = useMemo(() => {
    debug('info', 'Determining intention to display', {
      readingDataIntention: readingData?.intention,
      webhookQuestion: webhookResponse?.question,
      currentIntention,
      source
    });
    
    // Si estamos en el historial, usar la intención del readingData
    if (source === 'history') {
      const historyIntention = readingData?.intention;
      debug('info', 'Using history intention:', historyIntention);
      return historyIntention || t('tarot.noQuestion');
    }
    
    // Para lecturas normales, seguir el orden de prioridad
    const intention = webhookResponse?.question || currentIntention;
    debug('info', 'Using normal reading intention:', intention);
    return intention || t('tarot.noQuestion');
  }, [readingData, webhookResponse, currentIntention, source]);

  const downloadImage = async () => {
    if (!readingRef.current) return;

    debug('info', 'Starting image download with data:', {
      displayIntention,
      displayMessage,
      displayCards,
      source,
      readingData,
      readingDataIntention: readingData?.intention
    });

    const loadingToast = toast.loading('Generating image...');

    try {
      const targetWidth = 1080;
      const targetHeight = 1350;

      // Crear un contenedor temporal que sea una copia exacta del original
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.top = '0';
      tempContainer.style.left = '0';
      tempContainer.style.width = `${targetWidth}px`;
      tempContainer.style.height = `${targetHeight}px`;
      tempContainer.style.zIndex = '-9999';
      tempContainer.style.backgroundColor = '#0a0014';
      tempContainer.style.overflow = 'hidden';
      document.body.appendChild(tempContainer);

      // Clonar el contenido manteniendo todos los estilos
      const clone = readingRef.current.cloneNode(true) as HTMLElement;
      
      // Asegurarse de que el clon tenga las dimensiones correctas
      clone.style.position = 'absolute';
      clone.style.left = '0';
      clone.style.top = '0';
      clone.style.width = `${targetWidth}px`;
      clone.style.height = `${targetHeight}px`;
      clone.style.visibility = 'visible';
      clone.style.opacity = '1';
      clone.style.transform = 'none';
      
      // Asegurarse de que las imágenes mantengan su calidad
      const images = clone.getElementsByTagName('img');
      Array.from(images).forEach(img => {
        img.style.imageRendering = 'pixelated';
        img.style.transform = 'none';
      });
      
      tempContainer.appendChild(clone);

      // Esperar a que las imágenes se carguen
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      // Dar tiempo al navegador para renderizar
      await new Promise(resolve => setTimeout(resolve, 200));

      // Configuración de html2canvas con opciones optimizadas
      const canvas = await html2canvas(tempContainer, {
        width: targetWidth,
        height: targetHeight,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a0014',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-reading-container]');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.transform = 'none';
          }
        },
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
      });

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error('Failed to generate image');
            if (typeof window !== 'undefined') {
              window.imageDownloadHistory = window.imageDownloadHistory || [];
              window.imageDownloadHistory.unshift({
                url: 'Failed to generate image',
                timestamp: Date.now(),
                success: false,
                error: 'Failed to generate image blob',
                source: source
              });
              window.dispatchEvent(new Event('imageDownloadHistoryUpdate'));
            }
            return;
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'fudfate-reading.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          // Registrar la descarga exitosa en el historial
          if (typeof window !== 'undefined') {
            const cardInfo = displayCards.map(card => ({
              name: card.name,
              id: card.id,
              image: card.image
            }));
            
            const downloadEntry: DownloadHistoryEntry = {
              url: 'fudfate-reading.png',
              timestamp: Date.now(),
              success: true,
              cards: cardInfo,
              intention: source === 'history' && readingData ? readingData.intention : displayIntention,
              source: source
            };

            window.imageDownloadHistory = window.imageDownloadHistory || [];
            window.imageDownloadHistory.unshift(downloadEntry);
            window.dispatchEvent(new Event('imageDownloadHistoryUpdate'));
          }
          
          document.body.removeChild(tempContainer);
          toast.dismiss(loadingToast);
          toast.success('Image downloaded successfully!');
        },
        'image/png',
        1.0
      );

    } catch (error) {
      console.error('Error generating image:', error);
      if (typeof window !== 'undefined') {
        window.imageDownloadHistory = window.imageDownloadHistory || [];
        window.imageDownloadHistory.unshift({
          url: 'Error generating image',
          timestamp: Date.now(),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          source: source
        });
        window.dispatchEvent(new Event('imageDownloadHistoryUpdate'));
      }
      toast.dismiss(loadingToast);
      toast.error('Could not generate image');
    }
  };

  const handleCopyToClipboard = () => {
    if (onCopyToClipboard) {
      onCopyToClipboard();
    }
  };

  const handleShareOnTwitter = () => {
    if (onShareOnTwitter) {
      onShareOnTwitter();
    }
  };

  return (
    <>
      <div
        ref={readingRef}
        data-reading-container
        style={{
          width: '1080px',
          height: '1350px',
          position: 'absolute',
          visibility: 'visible',
          opacity: '1',
          left: '-9999px',
          top: 0,
          background: 'radial-gradient(circle at 50% 50%, #ff1e6b 0%, #FFD700 50%, #00bfff 100%)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '40px',
          fontFamily: '"Press Start 2P", system-ui',
          imageRendering: 'pixelated',
          overflow: 'visible',
          zIndex: -1
        }}
      >
        {/* SVG Sunburst Background */}
        <svg
          width="1080"
          height="1350"
          viewBox="0 0 1080 1350"
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}
        >
          {Array.from({ length: 10 }).map((_, i) => {
            const cx = 540, cy = 675, r = 900;
            const angleStart = ((360 / 20) * (2 * i - 0.5)) * Math.PI / 180;
            const angleEnd = ((360 / 20) * (2 * i + 0.5)) * Math.PI / 180;
            const x1 = cx + r * Math.cos(angleStart);
            const y1 = cy + r * Math.sin(angleStart);
            const x2 = cx + r * Math.cos(angleEnd);
            const y2 = cy + r * Math.sin(angleEnd);
            // Paleta vaporwave
            const vaporwaveColors = [
              '#ff71ce', // pink
              '#01cdfa', // cyan
              '#b967ff', // purple
              '#faff00', // yellow
              '#05ffa1', // mint
              '#00bfff', // electric blue
              '#fffb96', // pastel yellow
              '#ff1e6b', // hot pink
              '#3ad6ff', // light blue
              '#a259ff'  // violet
            ];
            const color = vaporwaveColors[i % vaporwaveColors.length];
            return (
              <polygon
                key={i}
                points={`${cx},${cy} ${x1},${y1} ${x2},${y2}`}
                fill={color}
                opacity="0.6"
                style={{ filter: `drop-shadow(0 0 64px ${color}) drop-shadow(0 0 32px #fff)` }}
              />
            );
          })}
        </svg>

        {/* Confetti Pixel Stars */}
        {Array.from({ length: 200 }).map((_, i) => {
          // Paleta vaporwave/confetti ajustada para un look más vaporwave y crypto-pixelart
          const confettiColors = [
            '#ff71ce', '#01cdfa', '#b967ff', '#faff00', '#05ffa1', '#00bfff', '#fffb96', '#ff1e6b', '#3ad6ff', '#a259ff',
            '#ff00ff', '#00ffff', '#ffff00', '#ff00ff', '#00ff00', '#ff0000', '#0000ff', '#ff00ff', '#00ffff', '#ffff00'
          ];
          // Selección determinista de color para evitar repeticiones adyacentes
          const color = confettiColors[i % confettiColors.length];
          // Distribución cuadrática para más densidad en el centro
          const rand = () => 50 + (Math.random() - 0.5) * 2 * 50 * Math.pow(Math.random(), 0.5);
          const left = rand();
          const top = rand();
          // Variación de tamaño entre 4px y 12px
          const size = 4 + Math.random() * 8;
          // Reducir la opacidad de los píxeles detrás de la interpretación
          const opacity = top > 50 ? 0.85 : 0.4;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                background: color,
                left: `${left}%`,
                top: `${top}%`,
                zIndex: 2,
                opacity: opacity
              }}
            />
          );
        })}

        {/* Base Sunburst Layer */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: `
            conic-gradient(from 0deg at 50% 50%,
              #ff1e6b 0deg 20deg,
              transparent 20deg 40deg,
              #ff1e6b 40deg 60deg,
              transparent 60deg 80deg,
              #ff1e6b 80deg 100deg,
              transparent 100deg 120deg,
              #ff1e6b 120deg 140deg,
              transparent 140deg 160deg,
              #ff1e6b 160deg 180deg,
              transparent 180deg 200deg,
              #ff1e6b 200deg 220deg,
              transparent 220deg 240deg,
              #ff1e6b 240deg 260deg,
              transparent 260deg 280deg,
              #ff1e6b 280deg 300deg,
              transparent 300deg 320deg,
              #ff1e6b 320deg 340deg,
              transparent 340deg 360deg
            )
          `,
          opacity: 0.7,
          zIndex: 1,
          animation: 'slowRotate 60s linear infinite'
        }} />

        {/* Secondary Sunburst Layer - Offset */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: `
            conic-gradient(from 20deg at 50% 50%,
              #00fff2 0deg 20deg,
              transparent 20deg 40deg,
              #00fff2 40deg 60deg,
              transparent 60deg 80deg,
              #00fff2 80deg 100deg,
              transparent 100deg 120deg,
              #00fff2 120deg 140deg,
              transparent 140deg 160deg,
              #00fff2 160deg 180deg,
              transparent 180deg 200deg,
              #00fff2 200deg 220deg,
              transparent 220deg 240deg,
              #00fff2 240deg 260deg,
              transparent 260deg 280deg,
              #00fff2 280deg 300deg,
              transparent 300deg 320deg,
              #00fff2 320deg 340deg,
              transparent 340deg 360deg
            )
          `,
          opacity: 0.5,
          zIndex: 2,
          animation: 'slowRotateReverse 45s linear infinite'
        }} />

        {/* Sharp Ray Overlay */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: `
            repeating-conic-gradient(
              from 0deg at 50% 50%,
              rgba(255, 255, 255, 0.1) 0deg 5deg,
              transparent 5deg 10deg,
              rgba(255, 255, 255, 0.1) 10deg 15deg,
              transparent 15deg 20deg
            )
          `,
          zIndex: 4
        }} />

        {/* Content container */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{ 
            width: '400px',
            marginTop: '40px',
            marginBottom: '20px',
            filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.8))'
          }}>
            <img 
              src="/img/logos/FUDFATE_logo.png" 
              alt="FUDFATE"
              style={{
                width: '100%',
                height: 'auto',
                imageRendering: 'pixelated'
              }}
            />
          </div>

          {/* Question */}
          <div className="text-center" style={{ 
            marginBottom: '60px',
            width: '90%'
          }}>
            <h2 style={{ 
              color: '#ffffff',
              textShadow: '2px 2px 15px rgba(255,30,107,0.6)',
              letterSpacing: '4px',
              fontFamily: '"Press Start 2P", system-ui',
              transform: 'scale(1.3)',
              fontSize: '42px',
              lineHeight: '1.6',
              padding: '0 40px',
              fontWeight: 'bold'
            }}>
              {displayIntention}
            </h2>
          </div>

          {/* Cards */}
          <div className="flex gap-6 justify-center" style={{ 
            marginBottom: '60px'
          }}>
            {displayCards.map((card, index) => (
              <div key={index} className="relative" style={{
                boxShadow: '0 0 10px #ff1e6b, 0 0 20px #ff1e6b, 0 0 30px #ff1e6b, 0 0 40px #ff1e6b',
                borderRadius: '30px',
                overflow: 'hidden',
                width: '300px',
                height: '450px',
                border: '8px solid #FFD700',
                animation: 'borderGlow 2s infinite alternate'
              }}>
                <img
                  src={card.image}
                  alt={card.name}
                  style={{
                    imageRendering: 'pixelated',
                    borderRadius: '24px',
                    width: '100%',
                    height: '100%',
                    display: 'block'
                  }}
                  onError={(e) => {
                    const fallbackPath = `/img/cards/${selectedDeck}/99_BACK.png`;
                    e.currentTarget.src = fallbackPath;
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Interpretation - Modified to be more transparent without borders */}
          <div className="text-center" style={{ 
            background: 'rgba(255, 255, 255, 0.7)',
            padding: '32px',
            borderRadius: '20px',
            width: '92%',
            maxHeight: '320px',
            marginTop: '24px',
            overflow: 'auto',
            backdropFilter: 'blur(8px)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <p style={{ 
              color: '#0F2E6B',
              letterSpacing: '2px',
              lineHeight: '1.6',
              fontFamily: '"Press Start 2P", system-ui',
              fontSize: '24px',
              fontWeight: 'bold',
              margin: 0
            }}>
              {displayMessage}
            </p>
          </div>
          {/* CTA: Discover your fate at FUDfate */}
          <div style={{
            marginTop: '18px',
            marginBottom: '32px',
            textAlign: 'center',
            fontFamily: '"Press Start 2P", system-ui',
            fontSize: '28px',
            color: '#111',
            borderRadius: '12px',
            padding: '16px 10px',
            letterSpacing: '1.5px',
            userSelect: 'text',
            background: 'transparent',
            display: 'inline-block',
          }}>
            <span>
              Discover your fate at{' '}
              <a
                href="https://app.fudfate.xyz"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#0F2E6B',
                  textDecoration: 'underline',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1.1em'
                }}
              >
                FUDfate
              </a>
              : app.fudfate.xyz
            </span>
          </div>
        </div>

        <style>{`
          @keyframes slowRotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes slowRotateReverse {
            from {
              transform: rotate(360deg);
            }
            to {
              transform: rotate(0deg);
            }
          }
          @keyframes pulse {
            0% {
              opacity: 0.5;
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              opacity: 0.7;
              transform: translate(-50%, -50%) scale(1.1);
            }
            100% {
              opacity: 0.5;
              transform: translate(-50%, -50%) scale(1);
            }
          }
          @keyframes borderGlow {
            from {
              border-color: #FFD700;
              box-shadow: 0 0 10px #ff1e6b, 0 0 20px #ff1e6b, 0 0 30px #ff1e6b, 0 0 40px #ff1e6b;
            }
            to {
              border-color: #ff1e6b;
              box-shadow: 0 0 20px #ff1e6b, 0 0 40px #ff1e6b, 0 0 60px #ff1e6b, 0 0 80px #ff1e6b;
            }
          }
        `}</style>
      </div>

      {/* Botones */}
      <div className={`flex gap-2 justify-center ${className}`}>
        <Button onClick={downloadImage} className="w-auto h-10 px-4 flex items-center gap-2 border-[#00fff2] hover:bg-[#00fff2]/10 text-[#00fff2]">
          <Download className="h-5 w-5" />
          {t('tarot.download')}
        </Button>
        <Button onClick={handleShareOnTwitter} className="w-auto h-10 px-4 flex items-center gap-2 border-[#00fff2] hover:bg-[#00fff2]/10 text-[#00fff2]">
          <X className="h-5 w-5" />
          {t('tarot.share')}
        </Button>
        <Button onClick={handleCopyToClipboard} className="w-10 h-10 p-0 flex items-center justify-center border-[#00fff2] hover:bg-[#00fff2]/10 text-[#00fff2]">
          <Copy className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
};

export default ShareReading;


