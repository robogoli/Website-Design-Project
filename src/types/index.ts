// Union of supported civic category identifiers used for directory filtering
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
  | 'legal-crisis'
  | 'disability'
  | 'animals'
  | 'veterans'
  | 'transportation'
  | 'legal'
  | 'emergency'
  | 'recovery'
  | 'tax-finance';

// Union of Forsyth County geographic districts used for regional filtering
export type DistrictType =
  | 'all'
  | 'Central Cumming'
  | 'North Forsyth'
  | 'South Forsyth'
  | 'East Forsyth'
  | 'West Forsyth';

// Complete structured data model for a single community resource listing
export interface ResourceItem {
  // Unique resource identifier string
  id: string;
  // Official name of the organization or service
  name: string;
  // Primary category key for taxonomy filtering
  category: CategoryType;
  // Human-readable label matching the category key
  categoryLabel: string;
  // Short single-line summary shown on resource cards
  tagline: string;
  // Detailed overview of services and mission
  description: string;
  // Physical street address or PO Box in Forsyth County
  address: string;
  // Assigned county region derived from the street address
  district: DistrictType;
  // Primary contact phone number
  phone: string;
  // Optional email address for the organization
  email?: string;
  // Optional official website URL
  website?: string;
  // Operating days and service hours
  hours: string;
  // Description of who qualifies for assistance
  eligibility: string;
  // Optional primary public verification source URL
  sourceUrl?: string;
  // Optional formatted date string showing when the listing was audited
  verificationDate?: string;
  // Optional name of the authoritative directory or audit source
  verificationSource?: string;
  // Standardized fee structure classification
  cost: 'Free' | 'Sliding Scale' | 'Medicaid/Insurance' | 'Subsidized' | 'Subsidized / Sliding Scale' | 'Affordable / Paid';
  // Languages supported by staff or translation services
  languages: string[];
  // Indicates whether the facility accommodates wheelchair access
  wheelchairAccessible: boolean;
  // Indicates access via public or county dial-a-ride transit
  transitAccessible: boolean;
  // Optional photo or illustration URL
  imageUrl?: string;
  // Bulleted list of core programs and assistance offered
  keyServices: string[];
  // Checklist of documents or steps required at intake
  intakeRequirements: string[];
  // Flags urgent 24/7 crisis or acute emergency services
  isEmergency: boolean;
  // Indicates whether the entry passed directory verification checks
  isVerified?: boolean;
}

// Data model representing a scheduled local Forsyth County community event
export interface CommunityEvent {
  // Unique event identifier
  id: string;
  // Event headline title
  title: string;
  // Display date string for the gathering
  date: string;
  // Start and end time window
  time: string;
  // Venue name and street address
  location: string;
  // Forsyth County region where the event takes place
  district: DistrictType;
  // Matching civic category identifier
  category: CategoryType;
  // Detailed description of event activities and purpose
  description: string;
  // Hosting organization or agency name
  organizer: string;
  // Phone number for RSVP or organizer inquiries
  contactPhone: string;
  // Current registered participant count
  attendeeCount: number;
  // Maximum venue participant capacity
  maxCapacity: number;
  // Indicates whether complimentary food or beverages are provided
  freeRefreshments: boolean;
  // Indicates whether on-site childcare is offered during the event
  childcareAvailable: boolean;
  // Spoken languages supported at the gathering
  languages: string[];
  // Optional verification flag for the event listing
  isVerified?: boolean;
  // Optional formatted verification date string
  verificationDate?: string;
  // Optional authoritative source verifying event details
  verificationSource?: string;
}

// Academic, municipal, or public policy source cited in the Standards view
export interface ResearchCitation {
  // Unique citation identifier
  id: string;
  // Title of the report or guideline
  sourceTitle: string;
  // Agency or institution that published the document
  publishingBody: string;
  // Publication year
  year: number;
  // External link to the original report
  url: string;
  // Summary of the core research takeaway
  keyFinding: string;
  // Explanation of how the finding informed CivicBridge's design
  implementationInSite: string;
}

// Data model for resident-submitted tips, updates, and notes on the Community Board
export interface UserFeedback {
  // Unique feedback entry identifier
  id: string;
  // Display author name or anonymous alias
  userName: string;
  // Optional flag hiding personal attribution when posted anonymously
  isAnonymous?: boolean;
  // Topic category selected by the submitting neighbor
  category: 'Accuracy & Updates' | 'Suggest New Resource' | 'Website Accessibility' | 'General Suggestion';
  // Optional name of the organization referenced by the note
  resourceName?: string;
  // Experience rating submitted with the note
  rating: 'Very Helpful' | 'Helpful' | 'Needs Improvement';
  // Text body of the neighbor's tip or update
  message: string;
  // Formatted submission date string
  submittedAt: string;
  // Moderation or review status badge displayed on the card
  status: 'Received & Logged' | 'Under Review' | 'Verified & Applied';
  // Optional total count of neighbor helpful upvotes
  likesCount?: number;
}
