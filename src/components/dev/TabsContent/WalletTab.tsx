
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/contexts/WalletContext';

const WalletTab: React.FC = () => {
  const { walletAddress, walletType, userData, disconnectWallet, overrideUserData } = useWallet();
  const [mockRunsToday, setMockRunsToday] = React.useState<boolean>(false);
  const [mockUserId, setMockUserId] = React.useState<string>('');

  // Load stored values
  React.useEffect(() => {
    const savedMockRunsToday = localStorage.getItem('mockRunsToday');
    if (savedMockRunsToday) {
      setMockRunsToday(savedMockRunsToday === 'true');
    }
    
    const savedMockUserId = localStorage.getItem('mockUserId');
    if (savedMockUserId) {
      setMockUserId(savedMockUserId);
    }
  }, []);

  // Handle mock runs_today change
  const handleMockRunsTodayChange = (checked: boolean) => {
    setMockRunsToday(checked);
    localStorage.setItem('mockRunsToday', String(checked));
    
    // Apply the override
    overrideUserData({ runsToday: checked });
  };

  // Handle mock user ID change
  const handleMockUserIdChange = (value: string) => {
    setMockUserId(value);
    localStorage.setItem('mockUserId', value);
    
    if (value) {
      overrideUserData({ userId: value });
    }
  };

  // Format wallet address
  const formatAddress = (address: string | null): string => {
    if (!address) return 'Not connected';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      <div className="p-2 bg-gray-50 rounded-md text-xs">
        <div className="grid grid-cols-2 gap-1">
          <span className="text-gray-600">Status:</span>
          <span className={walletAddress ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {walletAddress ? 'Connected' : 'Disconnected'}
          </span>
          
          <span className="text-gray-600">Type:</span>
          <span className="font-mono">{walletType || 'None'}</span>
          
          <span className="text-gray-600">Address:</span>
          <span className="font-mono truncate">{formatAddress(walletAddress)}</span>
          
          <span className="text-gray-600">User ID:</span>
          <span className="font-mono text-xs truncate">{userData?.userId || 'None'}</span>
          
          <span className="text-gray-600">Can Read:</span>
          <span className={`font-medium ${userData?.runsToday ? 'text-green-600' : 'text-red-600'}`}>
            {userData?.runsToday ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="mock-runs-today" className="cursor-pointer text-xs">Allow Daily Reading</Label>
          <Switch 
            id="mock-runs-today" 
            checked={mockRunsToday}
            onCheckedChange={handleMockRunsTodayChange}
            className="scale-75"
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="mock-user-id" className="text-xs">Override User ID</Label>
          <Input 
            id="mock-user-id" 
            value={mockUserId} 
            onChange={(e) => handleMockUserIdChange(e.target.value)}
            placeholder="Enter custom user ID"
            className="text-xs h-7"
          />
        </div>
        
        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full text-xs h-7"
          onClick={disconnectWallet}
        >
          Disconnect Wallet
        </Button>
      </div>
    </>
  );
};

export default WalletTab;
