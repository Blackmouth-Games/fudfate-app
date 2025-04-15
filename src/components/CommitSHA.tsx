import React from 'react';
import { GitCommit } from 'lucide-react';

interface CommitSHAProps {
  sha: string;
  className?: string;
}

const CommitSHA: React.FC<CommitSHAProps> = ({ sha, className }) => {
  if (!sha) return null;

  const shortSHA = sha.substring(0, 8);
  const commitUrl = `https://github.com/yourusername/yourrepo/commit/${sha}`;

  return (
    <a
      href={commitUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 ${className}`}
    >
      <GitCommit className="h-3.5 w-3.5 lucide-react" />
      <span>{shortSHA}</span>
    </a>
  );
};

export default CommitSHA;
