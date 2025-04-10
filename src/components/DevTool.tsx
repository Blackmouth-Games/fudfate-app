
import React from 'react';
import DevToolPanel from './DevToolPanel';

interface DevToolProps {
  routes: Array<{
    path: string;
    name: string;
  }>;
}

const DevTool: React.FC<DevToolProps> = ({ routes }) => {
  return <DevToolPanel routes={routes} />;
};

export default DevTool;
