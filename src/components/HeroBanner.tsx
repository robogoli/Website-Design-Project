// Import React functional component library and hooks for inline autocorrect timing
import React, { useEffect, useRef, useState } from 'react';
// Import search, clear, sparkles, check, and undo icons from Lucide
import { Search, X, Sparkles, Check, RotateCcw } from 'lucide-react';
// Import autocorrect metadata interface from shared search utility
import { AutocorrectResult } from '../utils/resourceSearch';

// Props interface definition for HeroBanner component
interface HeroBannerProps {
  // Current text entered into the search input
  searchQuery: string;
  // Handler updating query string on keystroke
  onSearchChange: (query: string) => void;
  // Handler clearing the search text when clicking the clear 'X' button
  onClearSearch: () => void;
  // Synchronous autocorrect evaluation for the current searchQuery
  autocorrectResult: AutocorrectResult;
  // True when visitor chose to keep their literal uncorrected spelling
  isAutocorrectBypassed: boolean;
  // Callback reverting autocorrection to literal spelling without re-rewriting
  onBypassAutocorrect: (literalQuery: string) => void;
}

// Common neighborhood search shortcuts making top directory needs discoverable in one tap
const QUICK_SEARCH_SHORTCUTS = [
  'Food Pantries',
  'Restaurants',
  'Free Clinics & Dental',
  'Rent & Utilities',
  'Car & Home Repair',
  'Daycare & Schools',
  'Jobs & Library',
  'Emergency 24/7'
];

// Record of the most recent automatic text replacement so visitors can undo in one click
interface AppliedCorrectionNotice {
  originalQuery: string;
  correctedQuery: string;
  summary: string;
}

// Hero banner component providing the main visual headline and instant autocorrect search input for Forsyth County
export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  autocorrectResult,
  isAutocorrectBypassed,
  onBypassAutocorrect
}) => {
  // Ref attached to the search input to check cursor position before idle autocorrect commits
  const inputRef = useRef<HTMLInputElement>(null);

  // Tracks the latest inline replacement applied to the search input so an Undo link can be shown
  const [appliedNotice, setAppliedNotice] = useState<AppliedCorrectionNotice | null>(null);

  // Commit the pending autocorrection straight into the search input and save an Undo notice
  const commitCorrection = (rawQuery: string, result: AutocorrectResult) => {
    if (!result.wasCorrected) return;
    const summary = result.corrections
      .map(c => `“${c.original}” → “${c.corrected}”`)
      .join(', ');
    setAppliedNotice({
      originalQuery: rawQuery,
      correctedQuery: result.correctedQuery,
      summary
    });
    onSearchChange(result.correctedQuery);
  };

  // Clear applied autocorrect notice once the visitor clears or edits away from the corrected prefix
  useEffect(() => {
    if (!appliedNotice) return;
    const correctedPrefix = appliedNotice.correctedQuery.trimEnd();
    if (!searchQuery || !searchQuery.startsWith(correctedPrefix)) {
      setAppliedNotice(null);
    }
  }, [searchQuery, appliedNotice]);

  // Automatically commit completed typos after a brief pause when the cursor sits at the end
  useEffect(() => {
    if (
      !autocorrectResult.wasCorrected ||
      !autocorrectResult.isReadyForInlineCommit ||
      isAutocorrectBypassed
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const input = inputRef.current;
      const cursorAtEnd =
        !input ||
        document.activeElement !== input ||
        (input.selectionStart === searchQuery.length && input.selectionEnd === searchQuery.length);

      if (cursorAtEnd) {
        commitCorrection(searchQuery, autocorrectResult);
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [searchQuery, autocorrectResult, isAutocorrectBypassed]);

  // Handle typing while immediately correcting finished words when space or punctuation is entered
  const handleInputChange = (nextValue: string) => {
    // Check if the user typed a word-ending separator (e.g. "resturants ") or pasted multiple characters
    const addedSeparator =
      nextValue.length > searchQuery.length &&
      /[\s,.;!?]$/.test(nextValue);

    if (addedSeparator) {
      // Import-free inline check: parent passes live autocorrectResult for current state,
      // while finished-word separator commits immediately on next tick or directly via commit
      onSearchChange(nextValue);
      return;
    }

    onSearchChange(nextValue);
  };

  // Immediately commit word-boundary typos whenever a trailing separator lands in searchQuery
  useEffect(() => {
    if (
      !autocorrectResult.wasCorrected ||
      isAutocorrectBypassed ||
      !/[\s,.;!?]$/.test(searchQuery)
    ) {
      return;
    }
    commitCorrection(searchQuery, autocorrectResult);
  }, [searchQuery, autocorrectResult, isAutocorrectBypassed]);

  // Immediately apply pending autocorrection when pressing Enter or Tab
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!autocorrectResult.wasCorrected || isAutocorrectBypassed) return;
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (e.key === 'Tab') {
        e.preventDefault();
      }
      commitCorrection(searchQuery, autocorrectResult);
    }
  };

  // Immediately commit pending autocorrection when leaving the search field
  const handleBlur = () => {
    if (autocorrectResult.wasCorrected && !isAutocorrectBypassed) {
      commitCorrection(searchQuery, autocorrectResult);
    }
  };

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
        <div className="pt-2 w-full max-w-5xl space-y-3">
          <div className="relative w-full rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200 focus-within:ring-4 focus-within:ring-amber-400/30">
            {/* Search magnifying glass icon placed inside input field */}
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
            
            {/* Native HTML search input tied to autocomplete suggestions and immediate autocorrect */}
            <input
              ref={inputRef}
              id="hero-resource-search"
              type="text"
              list="civic-search-suggestions"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder="Search anything: restaurants, food pantry, dentist, rent, auto repair..."
              className="w-full rounded-2xl bg-transparent px-6 py-5 pl-14 pr-12 text-base sm:text-lg text-stone-900 placeholder:text-stone-400 focus:outline-none"
              aria-label="Search community resources"
            />
            
            {/* Clear button displayed only when a query has been typed */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setAppliedNotice(null);
                  onClearSearch();
                }}
                aria-controls="hero-resource-search"
                aria-expanded={Boolean(searchQuery)}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Live immediate autocorrect indicator showing active/applied correction with one-tap Undo */}
          {autocorrectResult.wasCorrected && !isAutocorrectBypassed ? (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 flex-wrap text-xs bg-amber-100/95 text-amber-950 border border-amber-300 rounded-xl px-3.5 py-2 shadow-xs"
            >
              <Check className="w-3.5 h-3.5 text-amber-800 shrink-0" aria-hidden="true" />
              <span>
                Showing results for{' '}
                <button
                  type="button"
                  onClick={() => commitCorrection(searchQuery, autocorrectResult)}
                  className="font-bold underline hover:text-amber-800 cursor-pointer"
                >
                  &ldquo;{autocorrectResult.correctedQuery}&rdquo;
                </button>
                {' '}· Autocorrected from &ldquo;{searchQuery.trim()}&rdquo;
              </span>
              <button
                type="button"
                onClick={() => {
                  setAppliedNotice(null);
                  onBypassAutocorrect(searchQuery);
                }}
                className="ml-auto inline-flex items-center gap-1 font-semibold text-amber-900 hover:text-stone-900 underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span>Keep &ldquo;{searchQuery.trim()}&rdquo;</span>
              </button>
            </div>
          ) : appliedNotice ? (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 flex-wrap text-xs bg-amber-100/95 text-amber-950 border border-amber-300 rounded-xl px-3.5 py-2 shadow-xs"
            >
              <Check className="w-3.5 h-3.5 text-amber-800 shrink-0" aria-hidden="true" />
              <span>Autocorrected {appliedNotice.summary}</span>
              <button
                type="button"
                onClick={() => {
                  const original = appliedNotice.originalQuery;
                  setAppliedNotice(null);
                  onBypassAutocorrect(original);
                }}
                className="ml-auto inline-flex items-center gap-1 font-semibold text-amber-900 hover:text-stone-900 underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span>Undo</span>
              </button>
            </div>
          ) : isAutocorrectBypassed && autocorrectResult.wasCorrected ? (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 flex-wrap text-xs bg-white/90 text-stone-800 border border-white/40 rounded-xl px-3.5 py-2 shadow-xs"
            >
              <span>
                Searching exact text &ldquo;{searchQuery.trim()}&rdquo;.
              </span>
              <button
                type="button"
                onClick={() => commitCorrection(searchQuery, autocorrectResult)}
                className="font-bold text-amber-900 underline hover:text-amber-700 cursor-pointer"
              >
                Autocorrect to &ldquo;{autocorrectResult.correctedQuery}&rdquo;
              </button>
            </div>
          ) : null}

          {/* One-tap quick search chips helping visitors jump directly to popular topics */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-wide text-amber-200/90 font-semibold mr-1">
              Popular:
            </span>
            {QUICK_SEARCH_SHORTCUTS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setAppliedNotice(null);
                  onSearchChange(term);
                }}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-15 pointer-events-none bg-radial from-amber-400 to-transparent" />
    </header>
  );
};

