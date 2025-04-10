
import React from 'react';
import DevToolPanel from './dev/DevToolPanel';

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
