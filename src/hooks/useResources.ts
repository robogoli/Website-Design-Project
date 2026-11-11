import { useState, useMemo } from 'react';
import { ResourceItem, CategoryType, DistrictType } from '../types';
import { COMMUNITY_RESOURCES } from '../data/mockData';

export function useResources() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictType>('all');
  // Visitor community confirmations stored in local storage for persistence across reloads
  const [userConfirmations, setUserConfirmations] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('civicbridge_user_confirmations');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const isFiltered = useMemo(() => {
    return searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedDistrict !== 'all';
  }, [searchQuery, selectedCategory, selectedDistrict]);

  const filteredResources = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return COMMUNITY_RESOURCES.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // District filter
      if (selectedDistrict !== 'all' && item.district !== selectedDistrict) {
        return false;
      }

      // Text search query with extended contact, eligibility, and language matching
      if (q) {
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTagline = item.tagline.toLowerCase().includes(q);
        const matchesServices = item.keyServices.some(s => s.toLowerCase().includes(q));
        const matchesAddress = item.address.toLowerCase().includes(q);
        const matchesEligibility = item.eligibility.toLowerCase().includes(q);
        const matchesPhone = item.phone.toLowerCase().includes(q);
        const matchesLanguages = item.languages.some(language =>
          language.toLowerCase().includes(q)
        );

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

      return true;
    });
  }, [searchQuery, selectedCategory, selectedDistrict]);

  const toggleUserConfirmation = (id: string) => {
    setUserConfirmations(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('civicbridge_user_confirmations', JSON.stringify(updated));
      } catch {
        // LocalStorage access fallback
      }
      return updated;
    });
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedDistrict('all');
  };

  return {
    resources: filteredResources,
    allResources: COMMUNITY_RESOURCES,
    totalCount: COMMUNITY_RESOURCES.length,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedDistrict,
    setSelectedDistrict,
    isFiltered,
    resetFilters,
    userConfirmations,
    toggleUserConfirmation
  };
}
