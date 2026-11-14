// Import React for rendering the animated Suspense loading placeholder
import React from 'react';

// Skeleton placeholder displayed while lazy-loaded tab components download
export const LoadingSkeleton: React.FC = () => {
  return (
    // Accessible status container announcing loading progress to assistive technologies
    <div className="civic-container py-12 space-y-6 animate-pulse" role="status" aria-label="Loading section">
      {/* Placeholder bar mimicking a page title */}
      <div className="h-8 bg-stone-200 rounded-xl w-1/3 mb-4" />
      {/* Placeholder bar mimicking a subtitle or description */}
      <div className="h-4 bg-stone-200 rounded-lg w-2/3" />
      {/* Responsive three-column card skeleton grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        {[1, 2, 3].map((i) => (
          // Individual shimmering card placeholder
          <div key={i} className="h-48 bg-stone-200/80 rounded-2xl p-6 space-y-3" />
        ))}
      </div>
      {/* Visually hidden text label for screen readers */}
      <span className="sr-only">Loading content...</span>
    </div>
  );
};
