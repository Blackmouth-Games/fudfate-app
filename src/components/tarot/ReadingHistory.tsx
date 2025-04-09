
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

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
  const formattedReadings: Reading[] = readings && readings.length > 0 
    ? readings.map((reading: any) => ({
        id: reading.id || String(Math.random()),
        date: reading.date || new Date().toISOString().split('T')[0],
        question: reading.question || '',
        cards: Array.isArray(reading.cards) ? reading.cards : [],
        result: reading.result || ''
      }))
    : [];

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
        ) : formattedReadings.length > 0 ? (
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
                {formattedReadings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell className="font-medium">{reading.date}</TableCell>
                    <TableCell>{reading.question}</TableCell>
                    <TableCell>{Array.isArray(reading.cards) ? reading.cards.join(', ') : ''}</TableCell>
                    <TableCell className="max-w-xs truncate">{reading.result}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-6">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>{t('tarot.noReadingsTitle')}</AlertTitle>
              <AlertDescription>{t('tarot.noReadingsAvailable')}</AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReadingHistory;
