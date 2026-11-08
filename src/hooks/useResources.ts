import { useState, useMemo } from 'react';
import { ResourceItem, CategoryType, DistrictType } from '../types';
import { COMMUNITY_RESOURCES } from '../data/mockData';

export function useResources() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictType>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  // Visitor community confirmations stored in local state (distinct from official municipal verification)
  const [userConfirmations, setUserConfirmations] = useState<Record<string, boolean>>({});

  const isFiltered = useMemo(() => {
    return searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedDistrict !== 'all' || onlyVerified;
  }, [searchQuery, selectedCategory, selectedDistrict, onlyVerified]);

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

      // Official verification check
      if (onlyVerified && !item.isVerified) {
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
  }, [searchQuery, selectedCategory, selectedDistrict, onlyVerified]);

  const toggleUserConfirmation = (id: string) => {
    setUserConfirmations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedDistrict('all');
    setOnlyVerified(false);
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
    onlyVerified,
    setOnlyVerified,
    isFiltered,
    resetFilters,
    userConfirmations,
    toggleUserConfirmation
  };
}
