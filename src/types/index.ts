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
  | 'legal-crisis';

export type DistrictType =
  | 'all'
  | 'Downtown & Central'
  | 'Midtown & North'
  | 'Westside & Bankhead'
  | 'Eastside & Decatur'
  | 'Southside & Lakewood';

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
  email: string;
  website: string;
  hours: string;
  eligibility: string;
  cost: 'Free' | 'Sliding Scale' | 'Medicaid/Insurance' | 'Subsidized' | 'Subsidized / Sliding Scale' | 'Affordable / Paid';
  languages: string[];
  wheelchairAccessible: boolean;
  transitAccessible: boolean;
  imageUrl?: string;
  keyServices: string[];
  intakeRequirements: string[];
  verificationDate: string;
  isEmergency: boolean;
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
  attendeeCount: number;
  maxCapacity: number;
  freeRefreshments: boolean;
  childcareAvailable: boolean;
  languages: string[];
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
