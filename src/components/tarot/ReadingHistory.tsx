
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface Reading {
  id: string;
  date: string;
  question: string;
  cards: string[];
  result: string;
}

interface ReadingHistoryProps {
  className?: string;
  readings?: any[];
  isLoading?: boolean;
}

const ReadingHistory: React.FC<ReadingHistoryProps> = ({ 
  className = '', 
  readings = [], 
  isLoading = false 
}) => {
  const { t } = useTranslation();
  
  // Format the readings data to match our expected format
  const formattedReadings: Reading[] = readings.length > 0 
    ? readings.map((reading: any) => ({
        id: reading.id || String(Math.random()),
        date: reading.date || new Date().toISOString().split('T')[0],
        question: reading.question || '',
        cards: Array.isArray(reading.cards) ? reading.cards : [],
        result: reading.result || ''
      }))
    : [];

  // If there are no readings and we're not loading, show mock data
  const showMockData = formattedReadings.length === 0 && !isLoading;
  const mockReadings = [
    {
      id: '1',
      date: '2025-04-09',
      question: t('tarot.mockQuestion1'),
      cards: [t('tarot.mockCard1'), t('tarot.mockCard2'), t('tarot.mockCard3')],
      result: t('tarot.mockResult1')
    },
    {
      id: '2',
      date: '2025-04-08',
      question: t('tarot.mockQuestion2'),
      cards: [t('tarot.mockCard4'), t('tarot.mockCard5'), t('tarot.mockCard6')],
      result: t('tarot.mockResult2')
    }
  ];

  const displayReadings = showMockData ? mockReadings : formattedReadings;

  return (
    <Card className={`border-amber-400/50 shadow-md ${className}`}>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : displayReadings.length > 0 ? (
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
                {displayReadings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell className="font-medium">{reading.date}</TableCell>
                    <TableCell>{reading.question}</TableCell>
                    <TableCell>{Array.isArray(reading.cards) ? reading.cards.join(', ') : ''}</TableCell>
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
