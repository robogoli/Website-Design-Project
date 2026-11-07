import { useState, useMemo } from 'react';
import { ResourceItem, CategoryType, DistrictType } from '../types';
import { COMMUNITY_RESOURCES } from '../data/mockData';

export function useResources() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictType>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [verifiedListings, setVerifiedListings] = useState<Record<string, boolean>>({});

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

      // Verified check
      if (onlyVerified && !item.isVerified && !verifiedListings[item.id]) {
        return false;
      }

      // Text search query
      if (q) {
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTagline = item.tagline.toLowerCase().includes(q);
        const matchesServices = item.keyServices.some(s => s.toLowerCase().includes(q));
        const matchesAddress = item.address.toLowerCase().includes(q);

        return matchesName || matchesDesc || matchesTagline || matchesServices || matchesAddress;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedDistrict, onlyVerified, verifiedListings]);

  const toggleVerifyResource = (id: string) => {
    setVerifiedListings(prev => ({
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
    verifiedListings,
    toggleVerifyResource
  };
}
