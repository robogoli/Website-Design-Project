import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="civic-container py-12 space-y-6 animate-pulse" role="status" aria-label="Loading section">
      <div className="h-8 bg-stone-200 rounded-xl w-1/3 mb-4" />
      <div className="h-4 bg-stone-200 rounded-lg w-2/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-stone-200/80 rounded-2xl p-6 space-y-3" />
        ))}
      </div>
      <span className="sr-only">Loading content...</span>
    </div>
  );
};
