
import React, { useEffect, useState } from 'react';
import { getAvailableDecks, DeckInfo, getCardBackPath } from '@/utils/deck-utils';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/hooks/useEnvironment';
import { fetchAvailableDecks } from '@/utils/wallet-connection-utils';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useTarot } from '@/contexts/TarotContext';

const DecksTab: React.FC = () => {
  const [decks, setDecks] = useState<DeckInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { userData } = useWallet();
  const { webhooks, environment } = useEnvironment();
  const { selectedDeck } = useTarot();
  
  const loadDecks = async () => {
    setIsLoading(true);
    try {
      // If user is logged in, try to fetch from API
      if (userData?.userId) {
        const apiDecks = await fetchAvailableDecks(webhooks.deck, userData.userId, environment);
        if (Array.isArray(apiDecks) && apiDecks.length > 0) {
          // Process the decks from API
          const processedDecks = apiDecks.map(deck => ({
            id: deck.id || '1',
            name: deck.name || 'deck_1',
            displayName: deck.description || 'Unknown Deck',
            backImage: getCardBackPath(deck.name?.replace('_', '') || 'deck1'),
            unlocked: deck.is_active === true,
            description: deck.description || '',
            createdAt: deck.created_at || new Date().toISOString(),
            url: deck.url || '',
            isActive: deck.is_active === true
          }));
          setDecks(processedDecks);
        } else {
          // Fallback to default decks
          setDecks(getAvailableDecks());
        }
      } else {
        // Use fallback decks if not logged in
        setDecks(getAvailableDecks());
      }
    } catch (error) {
      console.error("Error loading decks:", error);
      toast.error("Failed to load decks");
      setDecks(getAvailableDecks());
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadDecks();
  }, [userData?.userId, environment]);
  
  // Helper function to check if an image exists
  const checkImageExists = (imagePath: string) => {
    return new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imagePath;
    });
  };
  
  // Test deck images
  const testDeckImages = async (deck: DeckInfo) => {
    try {
      const backImageExists = await checkImageExists(deck.backImage);
      console.log(`Deck ${deck.id} back image (${deck.backImage}): ${backImageExists ? 'exists' : 'missing'}`);
      
      // Also check the formatted backpath
      const formattedBackPath = `/img/cards/${deck.name}/99_BACK.png`;
      const formattedBackExists = await checkImageExists(formattedBackPath);
      console.log(`Deck ${deck.id} formatted back (${formattedBackPath}): ${formattedBackExists ? 'exists' : 'missing'}`);
      
      toast.success(`Deck ${deck.id} image testing complete. Check console for details.`);
    } catch (error) {
      console.error(`Error testing deck ${deck.id} images:`, error);
      toast.error(`Error testing deck ${deck.id} images`);
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-medium">Available Decks</h4>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 text-xs px-2"
          onClick={loadDecks}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="text-xs bg-gray-50 rounded p-2">
        <div className="mb-2 py-1 px-2 bg-white rounded border border-amber-200">
          <div className="font-medium text-amber-800">Selected Deck:</div>
          <div className="font-mono">{selectedDeck || 'None'}</div>
        </div>
        
        <div className="grid gap-2">
          {decks.map((deck) => (
            <div key={deck.id} className="border border-gray-200 rounded bg-white p-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{deck.displayName}</div>
                  <div className="text-[10px] text-gray-600">ID: {deck.id} | API Name: {deck.name}</div>
                  <div className={`text-[10px] ${deck.unlocked ? 'text-green-600' : 'text-red-600'}`}>
                    {deck.unlocked ? 'Unlocked' : 'Locked'}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="w-10 h-14 border border-gray-300 rounded overflow-hidden">
                    <img 
                      src={deck.backImage} 
                      alt={deck.displayName} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.warn(`Failed to load deck image: ${deck.backImage}`);
                        e.currentTarget.src = "/img/cards/deck_1/99_BACK.png";
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 text-[10px] mt-1 px-1"
                    onClick={() => testDeckImages(deck)}
                  >
                    Test images
                  </Button>
                </div>
              </div>
              
              <div className="mt-1 text-[10px] space-y-1">
                <div>
                  <span className="text-gray-600">Back image path:</span>
                  <span className="font-mono block truncate">{deck.backImage}</span>
                </div>
                
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-1">{new Date(deck.createdAt || '').toLocaleString()}</span>
                </div>
                
                {deck.description && (
                  <div>
                    <span className="text-gray-600">Description:</span>
                    <span className="ml-1">{deck.description}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DecksTab;
