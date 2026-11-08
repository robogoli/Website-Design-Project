export type CategoryType = 
  | 'all'
  | 'food'
  | 'housing'
  | 'healthcare'
  | 'childcare'
  | 'youth-family'
  | 'seniors'
  | 'workforce'
  | 'sports'
  | 'dining'
  | 'schools'
  | 'repairs'
  | 'legal-crisis';

export type DistrictType =
  | 'all'
  | 'Central Cumming'
  | 'North Forsyth'
  | 'South Forsyth'
  | 'East Forsyth'
  | 'West Forsyth';

export interface ResourceItem {
  id: string;
  name: string;
  category: CategoryType;
  categoryLabel: string;
  tagline: string;
  description: string;
  address: string;
  district: DistrictType;
  phone: string;
  email?: string;
  website?: string;
  hours: string;
  eligibility: string;
  sourceUrl?: string;
  verificationDate?: string;
  verificationSource?: string;
  cost: 'Free' | 'Sliding Scale' | 'Medicaid/Insurance' | 'Subsidized' | 'Subsidized / Sliding Scale' | 'Affordable / Paid';
  languages: string[];
  wheelchairAccessible: boolean;
  transitAccessible: boolean;
  imageUrl?: string;
  keyServices: string[];
  intakeRequirements: string[];
  isEmergency: boolean;
  isVerified?: boolean;
}

export interface CommunityProgram {
  id: string;
  title: string;
  organizer: string;
  category: CategoryType;
  categoryLabel: string;
  schedule: string;
  location: string;
  capacity: string;
  summary: string;
  requirements: string[];
  applicationSteps: string[];
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  badgeText: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  district: DistrictType;
  category: CategoryType;
  description: string;
  organizer: string;
  contactPhone: string;
  attendeeCount: number;
  maxCapacity: number;
  freeRefreshments: boolean;
  childcareAvailable: boolean;
  languages: string[];
  isSample?: boolean;
}

export interface MetricItem {
  id: string;
  name: string;
  category: 'Performance & Speed' | 'Community Impact' | 'Accessibility & Inclusivity' | 'Engagement';
  currentValue: string;
  targetValue: string;
  status: 'Exceeding' | 'On Track' | 'Monitored';
  description: string;
  industryTerm: string;
}

export interface ResearchCitation {
  id: string;
  sourceTitle: string;
  publishingBody: string;
  year: number;
  url: string;
  keyFinding: string;
  implementationInSite: string;
}

export interface UserFeedback {
  id: string;
  userName: string;
  isAnonymous?: boolean;
  isSample?: boolean;
  category: 'Accuracy & Updates' | 'Suggest New Resource' | 'Website Accessibility' | 'General Suggestion';
  resourceName?: string;
  rating: 'Very Helpful' | 'Helpful' | 'Needs Improvement';
  message: string;
  submittedAt: string;
  status: 'Received & Logged' | 'Under Review' | 'Verified & Applied';
  adminResponseNote?: string;
  likesCount?: number;
}
