import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import WalletBalance from './WalletBalance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PumpTokenBalance: React.FC = () => {
  const { connected } = useWallet();

  if (!connected) {
    return null;
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">PUMP Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <WalletBalance 
          tokenMint="43YakhC3TcSuTgSXnxFgw8uKL8VkuLuFa4M6Bninpump"
          className="text-xl font-bold"
        />
      </CardContent>
    </Card>
  );
};

export default PumpTokenBalance; 