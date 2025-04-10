
import React, { useState, useEffect } from 'react';
import { GitCommitHorizontal } from 'lucide-react';

const CommitSHA: React.FC = () => {
  const [commitSHA, setCommitSHA] = useState<string>('');

  useEffect(() => {
    // In a real application, this would be injected during the build process
    // We can access it via import.meta.env.VITE_COMMIT_SHA or similar
    const sha = import.meta.env.VITE_COMMIT_SHA || 'development';
    
    // If we have a full SHA, only display the first 8 characters
    const displaySHA = sha.length > 8 ? sha.substring(0, 8) : sha;
    
    setCommitSHA(displaySHA);
  }, []);

  if (!commitSHA) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 text-xs bg-black/70 text-white px-2 py-1 rounded font-mono flex items-center gap-1.5 hover:bg-black/80 transition-colors">
      <GitCommitHorizontal className="h-3.5 w-3.5" />
      {commitSHA}
    </div>
  );
};

export default CommitSHA;
