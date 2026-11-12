// Import React state and memoization hooks for efficient directory filtering
import { useState, useMemo } from 'react';
// Import domain interfaces for directory listings, civic categories, and county districts
import { CategoryType, DistrictType } from '../types';
// Import the comprehensive 213 verified community resources data array
import { COMMUNITY_RESOURCES } from '../data/mockData';

// Custom hook that encapsulates all directory filtering, text querying, and user verification logic
export function useResources() {
  // Active civic category filter state ('all' displays every category)
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  
  // Real-time keyword text search query state entered by the user
  const [searchQuery, setSearchQuery] = useState('');
  
  // Geographic zone filter state across Forsyth County ('all' or specific county district)
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictType>('all');
  
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

  // Derived boolean flag checking whether any filter or search query is currently active
  const isFiltered = useMemo(() => {
    // True if a keyword search, category selection, or district filter has been applied
    return searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedDistrict !== 'all';
  }, [searchQuery, selectedCategory, selectedDistrict]);

  // Memoized array of filtered resources recalculated only when search or filter criteria change
  const filteredResources = useMemo(() => {
    // Normalize user search query into lowercase and trim whitespace
    const q = searchQuery.toLowerCase().trim();

    // Filter the primary community resources master list against active criteria
    return COMMUNITY_RESOURCES.filter(item => {
      // Filter out resources whose category does not match the active selection
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Filter out resources outside the selected geographic Forsyth County district
      if (selectedDistrict !== 'all' && item.district !== selectedDistrict) {
        return false;
      }

      // If a keyword query is provided, evaluate text matching across all relevant listing fields
      if (q) {
        // Match against organization name
        const matchesName = item.name.toLowerCase().includes(q);
        // Match against comprehensive program description
        const matchesDesc = item.description.toLowerCase().includes(q);
        // Match against quick summary tagline
        const matchesTagline = item.tagline.toLowerCase().includes(q);
        // Match against key services and offering labels
        const matchesServices = item.keyServices.some(s => s.toLowerCase().includes(q));
        // Match against physical street address and city
        const matchesAddress = item.address.toLowerCase().includes(q);
        // Match against eligibility guidelines and program requirements
        const matchesEligibility = item.eligibility.toLowerCase().includes(q);
        // Match against contact telephone numbers
        const matchesPhone = item.phone.toLowerCase().includes(q);
        // Match against spoken and supported languages
        const matchesLanguages = item.languages.some(language =>
          language.toLowerCase().includes(q)
        );

        // Keep item if query appears in any of the primary searchable properties
        return (
          matchesName ||
          matchesDesc ||
          matchesTagline ||
          matchesServices ||
          matchesAddress ||
          matchesEligibility ||
          matchesPhone ||
          matchesLanguages
        );
      }

      // Include all resources that passed category and district filters when query is empty
      return true;
    });
  }, [searchQuery, selectedCategory, selectedDistrict]);

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

  // Reset all filters back to default values to view the entire countywide directory
  const resetFilters = () => {
    // Reset category dropdown / tabs back to all
    setSelectedCategory('all');
    // Clear the search input text
    setSearchQuery('');
    // Reset district selection back to all
    setSelectedDistrict('all');
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
    // Setter function to update the search query
    setSearchQuery,
    // Currently selected geographic district
    selectedDistrict,
    // Setter function to update the selected district
    setSelectedDistrict,
    // Boolean indicator for showing reset buttons and result counts
    isFiltered,
    // Action to clear all filters simultaneously
    resetFilters,
    // Dictionary of user verification status per resource
    userConfirmations,
    // Action to toggle a resource's verified checkmark
    toggleUserConfirmation
  };
}
