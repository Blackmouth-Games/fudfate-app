
import React from 'react';
import { Button } from '@/components/ui/button';

interface RoutesTabProps {
  routes: Array<{
    path: string;
    name: string;
  }>;
}

const RoutesTab: React.FC<RoutesTabProps> = ({ routes }) => {
  if (routes.length === 0) {
    return <div className="text-xs text-gray-500">No routes available</div>;
  }

  return (
    <div className="grid gap-1">
      {routes.map((route) => (
        <Button
          key={route.path}
          variant="outline"
          size="sm"
          className="justify-start text-xs h-7"
          onClick={() => {
            window.location.href = route.path;
          }}
        >
          {route.name}
        </Button>
      ))}
    </div>
  );
};

export default RoutesTab;
