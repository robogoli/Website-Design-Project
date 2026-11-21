// Import React state and memoization hooks for efficient directory filtering
import { useState, useMemo } from 'react';
// Import domain interfaces for directory listings, civic categories, and county districts
import { CategoryType, DistrictType } from '../types';
// Import the comprehensive 213 verified community resources data array
import { COMMUNITY_RESOURCES } from '../data/mockData';
// Import shared typo-tolerant, synonym-aware relevance scorer and immediate autocorrect engine
import { scoreResourceMatch, autocorrectQuery } from '../utils/resourceSearch';

// Parse a formatted verification date label (e.g., "Verified Nov 21, 2026") into a comparable timestamp
function parseVerificationTimestamp(verificationDate?: string): number {
  if (!verificationDate) return 0;
  // Strip the leading "Verified " prefix before parsing the calendar date
  const cleaned = verificationDate.replace(/^Verified\s+/i, '').trim();
  const parsed = Date.parse(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

// Custom hook that encapsulates directory filtering, immediate autocorrect, recency sorting, resource starring, and verification logic
export function useResources() {
  // Active civic category filter state ('all' displays every category)
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  
  // Real-time keyword text search query state entered by the user
  const [searchQuery, setSearchQuery] = useState('');

  // Optional literal query string for which the visitor explicitly chose "Undo / Search literal"
  const [bypassedLiteralQuery, setBypassedLiteralQuery] = useState<string | null>(null);
  
  // Geographic zone filter state across Forsyth County ('all' or specific county district)
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictType>('all');

  // Toggle restricting directory results to resources starred by the current visitor
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Checkbox flag allowing visitors to optionally sort listings by most recently verified first
  const [sortByRecent, setSortByRecent] = useState(false);
  
  // Persistent map of resources the current visitor has checked or marked as confirmed
  const [userConfirmations, setUserConfirmations] = useState<Record<string, boolean>>(() => {
    try {
      // Retrieve previously stored community confirmation preferences from local browser storage
      const saved = localStorage.getItem('civicbridge_user_confirmations');
      // Parse the JSON record if available, otherwise return an empty object
      return saved ? JSON.parse(saved) : {};
    } catch {
      // Fallback gracefully to an empty dictionary if localStorage is restricted
      return {};
    }
  });

  // Persistent map of resources bookmarked/starred by the current visitor
  const [starredResources, setStarredResources] = useState<Record<string, boolean>>(() => {
    try {
      // Read saved starred resource IDs from localStorage
      const saved = localStorage.getItem('civicbridge_starred_resources');
      return saved ? JSON.parse(saved) : {};
    } catch {
      // Fall back to an empty dictionary if browser storage is unavailable
      return {};
    }
  });

  // Compute immediate autocorrect result for the current search text
  const autocorrectResult = useMemo(() => autocorrectQuery(searchQuery), [searchQuery]);

  // Bypass autocorrection only while the input strictly matches the query the user reverted
  const isAutocorrectBypassed =
    bypassedLiteralQuery !== null && bypassedLiteralQuery === searchQuery;

  // Determine the effective search string applied to directory matching
  const effectiveSearchQuery =
    autocorrectResult.wasCorrected && !isAutocorrectBypassed
      ? autocorrectResult.correctedQuery
      : searchQuery;

  // Derived boolean flag checking whether any filter or search query is currently active
  const isFiltered = useMemo(() => {
    // True if a keyword search, category selection, district filter, or starred filter is active
    return (
      effectiveSearchQuery.trim() !== '' ||
      selectedCategory !== 'all' ||
      selectedDistrict !== 'all' ||
      showStarredOnly
    );
  }, [effectiveSearchQuery, selectedCategory, selectedDistrict, showStarredOnly]);

  // Memoized array of filtered and sorted resources recalculated when filters or stars change
  const filteredResources = useMemo(() => {
    // Normalize effective search query (autocorrected when active) into lowercase and trim whitespace
    const q = effectiveSearchQuery.toLowerCase().trim();

    // Filter and score the master directory list against active category, district, star, and query criteria
    const scoredMatches = COMMUNITY_RESOURCES
      .filter(item => {
        // Restrict to starred items when the starred-only filter is enabled
        if (showStarredOnly && !starredResources[item.id]) {
          return false;
        }

        // Filter out resources whose category does not match the active selection
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Filter out resources outside the selected geographic Forsyth County district
        if (selectedDistrict !== 'all' && item.district !== selectedDistrict) {
          return false;
        }

        return true;
      })
      .map(item => ({
        item,
        // Score against every listing attribute, synonym, category alias, and typo tolerance when searching
        score: q ? scoreResourceMatch(item, q) : 1
      }))
      .filter(entry => !q || entry.score >= 10);

    // Sort by verification date when checked, or by search relevance score when typing a query
    if (sortByRecent) {
      return [...scoredMatches]
        .sort((a, b) => {
          const dateDiff =
            parseVerificationTimestamp(b.item.verificationDate) -
            parseVerificationTimestamp(a.item.verificationDate);
          return dateDiff !== 0 ? dateDiff : b.score - a.score;
        })
        .map(entry => entry.item);
    }

    if (q) {
      return [...scoredMatches]
        .sort((a, b) => b.score - a.score)
        .map(entry => entry.item);
    }

    return scoredMatches.map(entry => entry.item);
  }, [effectiveSearchQuery, selectedCategory, selectedDistrict, showStarredOnly, starredResources, sortByRecent]);

  // Precomputed list of starred resources sorted by verification recency for quick access
  const starredList = useMemo(() => {
    return COMMUNITY_RESOURCES
      .filter(item => starredResources[item.id])
      .sort(
        (a, b) =>
          parseVerificationTimestamp(b.verificationDate) -
          parseVerificationTimestamp(a.verificationDate)
      );
  }, [starredResources]);

  // Handler allowing a user to toggle community verification checkmark on an organization
  const toggleUserConfirmation = (id: string) => {
    setUserConfirmations(prev => {
      // Invert the confirmed status for the specified resource ID
      const updated = { ...prev, [id]: !prev[id] };
      try {
        // Persist the updated confirmation dictionary to localStorage
        localStorage.setItem('civicbridge_user_confirmations', JSON.stringify(updated));
      } catch {
        // Prevent crashes if localStorage storage limit or permissions fail
      }
      return updated;
    });
  };

  // Handler allowing a user to star or unstar a resource for quick bookmark access
  const toggleStarResource = (id: string) => {
    setStarredResources(prev => {
      // Copy previous star map and toggle the requested listing ID
      const updated = { ...prev };
      if (updated[id]) {
        delete updated[id];
      } else {
        updated[id] = true;
      }
      try {
        // Persist starred resource IDs to browser localStorage
        localStorage.setItem('civicbridge_starred_resources', JSON.stringify(updated));
      } catch {
        // Ignore storage quota or privacy-mode write restrictions
      }
      return updated;
    });
  };

  // Revert an autocorrected query back to the visitor's literal spelling without re-rewriting it
  const bypassAutocorrect = (literalQuery: string) => {
    setBypassedLiteralQuery(literalQuery);
    setSearchQuery(literalQuery);
  };

  // Reset all filters back to default values to view the entire countywide directory
  const resetFilters = () => {
    // Reset category dropdown / tabs back to all
    setSelectedCategory('all');
    // Clear the search input text and any literal autocorrect bypass
    setSearchQuery('');
    setBypassedLiteralQuery(null);
    // Reset district selection back to all
    setSelectedDistrict('all');
    // Clear the starred-only filter toggle
    setShowStarredOnly(false);
    // Return listing sort order back to normal
    setSortByRecent(false);
  };

  // Expose state variables and manipulation methods to consuming components
  return {
    // Array of resources matching the current filters
    resources: filteredResources,
    // Unfiltered raw master directory list
    allResources: COMMUNITY_RESOURCES,
    // Total count of verified organizations in the directory
    totalCount: COMMUNITY_RESOURCES.length,
    // Currently active category identifier
    selectedCategory,
    // Setter function to update the active category
    setSelectedCategory,
    // Current user search text
    searchQuery,
    // Effective query after immediate autocorrection (unless bypassed)
    effectiveSearchQuery,
    // Detailed autocorrect metadata for inline UI banners and undo controls
    autocorrectResult,
    // Whether the user explicitly opted to keep their literal uncorrected spelling
    isAutocorrectBypassed,
    // Action reverting autocorrection to the visitor's literal spelling
    bypassAutocorrect,
    // Setter function to update the search query
    setSearchQuery,
    // Currently selected geographic district
    selectedDistrict,
    // Setter function to update the selected district
    setSelectedDistrict,
    // Whether only starred listings are currently displayed
    showStarredOnly,
    // Setter toggling the starred-only filter
    setShowStarredOnly,
    // Checkbox state controlling whether recently verified listings appear first
    sortByRecent,
    // Setter toggling the recently-verified sort checkbox
    setSortByRecent,
    // Boolean indicator for showing reset buttons and result counts
    isFiltered,
    // Action to clear all filters simultaneously
    resetFilters,
    // Dictionary of user verification status per resource
    userConfirmations,
    // Action to toggle a resource's verified checkmark
    toggleUserConfirmation,
    // Dictionary of visitor-starred resource IDs
    starredResources,
    // Filtered array of starred ResourceItem records
    starredList,
    // Total number of starred resources saved by the visitor
    starredCount: starredList.length,
    // Action to star or unstar a resource
    toggleStarResource
  };
}

