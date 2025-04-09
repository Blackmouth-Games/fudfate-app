
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@/contexts/WalletContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface ReadingHistoryProps {
  className?: string;
}

const ReadingHistory: React.FC<ReadingHistoryProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { userData } = useWallet();
  
  // This would ideally come from an API or context
  const mockReadings = [
    {
      id: '1',
      date: '2025-04-09',
      question: 'Will crypto prices rise?',
      cards: ['The Degen', 'The Whale', 'The Moon'],
      result: 'Positive outlook with potential volatility'
    },
    {
      id: '2',
      date: '2025-04-08',
      question: 'Should I invest in NFTs?',
      cards: ['The NFT', 'The Smart Contract', 'The DAO'],
      result: 'Consider carefully, mixed signals'
    }
  ];

  return (
    <Card className={`border-amber-400/50 shadow-md ${className}`}>
      <CardContent className="p-6">
        {mockReadings.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tarot.date')}</TableHead>
                  <TableHead>{t('tarot.question')}</TableHead>
                  <TableHead>{t('tarot.cards')}</TableHead>
                  <TableHead>{t('tarot.result')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReadings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell className="font-medium">{reading.date}</TableCell>
                    <TableCell>{reading.question}</TableCell>
                    <TableCell>{reading.cards.join(', ')}</TableCell>
                    <TableCell>{reading.result}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">{t('tarot.noReadings')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReadingHistory;
