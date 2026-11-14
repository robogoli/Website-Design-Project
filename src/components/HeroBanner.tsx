// Import React functional component library
import React from 'react';
// Import search magnifying glass, clear cross, and sparkles icons from Lucide
import { Search, X, Sparkles } from 'lucide-react';

// Props interface definition for HeroBanner component
interface HeroBannerProps {
  // Current text entered into the search input
  searchQuery: string;
  // Handler updating query string on keystroke
  onSearchChange: (query: string) => void;
  // Handler clearing the search text when clicking the clear 'X' button
  onClearSearch: () => void;
}

// Hero banner component providing the main visual headline and instant search input for Forsyth County
export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch
}) => {
  return (
    // Semantic header landmark with gradient styling and high visual contrast
    <header className="hero-banner relative overflow-hidden bg-gradient-to-br from-[#71320f] to-[#4b210d] shadow-lg border border-amber-900/60 rounded-[32px] p-8 md:p-12 lg:p-16 pb-16 md:pb-20 flex flex-col justify-center min-h-[480px]">
      <div className="relative z-10 max-w-5xl space-y-5">
        {/* County directory badge with sparkles icon */}
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-950 border border-amber-300 px-5 py-3 font-bold text-xs sm:text-sm shadow-xs self-start">
          <Sparkles className="w-4 h-4 text-amber-900 shrink-0" />
          <span>FORSYTH COUNTY COMMUNITY DIRECTORY</span>
        </span>

        {/* Primary Page Heading with high accessibility contrast */}
        <h1 className="text-white font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-5xl">
          Find local help in Cumming without the runaround.
        </h1>

        {/* Descriptive mission sub-header explaining the services listed */}
        <p className="text-white/85 text-lg md:text-xl leading-relaxed max-w-3xl">
          Telephone numbers, hours, and addresses for emergency food pantries, free medical clinics, preschools, and home repair services across Forsyth County.
        </p>

        {/* Instant directory search box wrapper */}
        <div className="pt-2 w-full max-w-5xl">
          <div className="relative w-full rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200 focus-within:ring-4 focus-within:ring-amber-400/30">
            {/* Search magnifying glass icon placed inside input field */}
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
            
            {/* Native HTML search input tied to autocomplete suggestions */}
            <input
              id="hero-resource-search"
              type="text"
              list="civic-search-suggestions"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search clinics, pantries, mechanics, schools..."
              className="w-full rounded-2xl bg-transparent px-6 py-5 pl-14 text-base sm:text-lg text-stone-900 placeholder:text-stone-400 focus:outline-none"
              aria-label="Search community resources"
            />
            
            {/* Clear button displayed only when a query has been typed */}
            {searchQuery && (
              <button
                type="button"
                onClick={onClearSearch}
                aria-controls="hero-resource-search"
                aria-expanded={Boolean(searchQuery)}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-15 pointer-events-none bg-radial from-amber-400 to-transparent" />
    </header>
  );
};
