
import React, { useState, useEffect } from 'react';

const CommitSHA: React.FC = () => {
  const [commitSHA, setCommitSHA] = useState<string>('');

  useEffect(() => {
    // For demonstration purposes, we're using a placeholder SHA
    // In a real app, this would come from your CI/CD system or environment variables
    const sha = 'f8d9e7c6b5a4321'; // Sample SHA
    setCommitSHA(sha.substring(0, 8));
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-40 text-xs bg-black/70 text-white px-2 py-1 rounded font-mono">
      {commitSHA}
    </div>
  );
};

export default CommitSHA;
