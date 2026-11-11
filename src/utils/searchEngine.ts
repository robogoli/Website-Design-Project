import { ResourceItem, CategoryType } from '../types';
import { COMMUNITY_RESOURCES, CATEGORY_LABELS } from '../data/mockData';

export interface TopicRule {
  id: string;
  category: CategoryType | 'crisis' | 'emergency';
  keywords: string[];
  responseTitle: string;
  examplePrompts: string[];
  emergencyHotlines?: Array<{ label: string; phone: string; note: string }>;
}

export const TOPIC_RULES: TopicRule[] = [
  {
    id: 'crisis',
    category: 'crisis',
    keywords: [
      'crisis', 'hotline', 'suicide', 'emergency', '988', '211', 'abuse', 
      'violence', 'haven', 'overdose', 'danger', 'immediate', 'trauma', 'distress'
    ],
    responseTitle: "If you or someone you know is in immediate crisis, confidential help is available right now:\n\n• Suicide & Crisis Lifeline: Dial or text 988 (24/7 Free & Confidential)\n• Immediate Danger / Medical Emergency: Dial 911\n• Georgia Crisis & Access Line (GCAL): (800) 715-4225\n• Forsyth County Family Haven (Domestic Safety): (770) 887-1121\n• United Way Helpline: Dial 211\n\nSuggested verified resources matching your search:",
    examplePrompts: [
      'How do I get emergency rent or utility help?',
      'Where is the nearest safe shelter in Cumming?',
      'Free crisis counseling and 24/7 support'
    ]
  },
  {
    id: 'food',
    category: 'food',
    keywords: [
      'food', 'pantry', 'pantries', 'groceries', 'grocery', 'hunger', 'hungry',
      'meal', 'meals', 'snap', 'ebt', 'nutrition', 'dinner', 'lunch', 'breakfast'
    ],
    responseTitle: "Need groceries this week? Multiple pantries across Cumming and Forsyth County distribute fresh food, baby supplies, and emergency groceries. Suggested verified listings matching your search:",
    examplePrompts: [
      'Which food pantries are open on weekday evenings?',
      'Can I get food boxes delivered to my door for my kids?',
      'Where can I find free baby formula and diapers in Forsyth?'
    ]
  },
  {
    id: 'housing',
    category: 'housing',
    keywords: [
      'housing', 'shelter', 'rent', 'eviction', 'utility', 'utilities', 'electric',
      'power bill', 'sawnee', 'gas', 'water bill', 'homeless', 'liheap', 'heating'
    ],
    responseTitle: "Facing housing instability or overdue utility bills? Help is available through Forsyth community programs and LIHEAP grants. Suggested verified listings matching your search:",
    examplePrompts: [
      'Emergency grant to stop an eviction notice in Forsyth',
      'Past-due Sawnee EMC or Georgia Power bill relief',
      'Family shelter or transitional housing in Cumming'
    ]
  },
  {
    id: 'healthcare',
    category: 'healthcare',
    keywords: [
      'clinic', 'doctor', 'dental', 'teeth', 'dentist', 'health', 'medical',
      'uninsured', 'medicaid', 'prescription', 'medicine', 'hospital', 'nurse', 'exam'
    ],
    responseTitle: "Need medical care or dental treatment without insurance? Forsyth County community clinics provide sliding-scale and free healthcare services. Suggested verified listings matching your search:",
    examplePrompts: [
      'Where can an uninsured adult get free dental work in Forsyth?',
      'Free childhood immunizations and school health screenings',
      'Affordable prescription medication assistance in Cumming'
    ]
  },
  {
    id: 'recovery',
    category: 'recovery',
    keywords: [
      'recovery', 'addiction', 'sober', 'rehab', 'detox', 'peer', 'narcan',
      'naloxone', 'substance', 'alcohol', 'drugs', 'opioid', 'coaching', 'meeting'
    ],
    responseTitle: "Seeking substance recovery, peer coaching, or family support in Cumming? Local recovery centers offer judgment-free guidance. Suggested verified listings matching your search:",
    examplePrompts: [
      'Free peer recovery coaching in Cumming',
      'Where to get free Narcan / Naloxone kits in Forsyth',
      'Family support group for addiction recovery'
    ]
  },
  {
    id: 'emergency',
    category: 'emergency',
    keywords: [
      'disaster', 'storm', 'tornado', 'fire', 'smoke', 'alarm', 'red cross',
      'ema', 'gema', 'preparedness', 'weather radio', 'evacuation'
    ],
    responseTitle: "Looking for severe storm shelters, fire prevention, or disaster recovery? Local emergency management and Red Cross teams serve Forsyth County. Suggested verified listings matching your search:",
    examplePrompts: [
      'Where are the severe storm shelters in Forsyth County?',
      'How do I get free smoke alarm installation in Cumming?',
      'How does the Red Cross help after a house fire?'
    ]
  },
  {
    id: 'tax-finance',
    category: 'tax-finance',
    keywords: [
      'tax', 'taxes', 'aarp', 'vita', 'irs', 'refund', 'eitc', 'financial',
      'budget', 'credit', 'debt', 'counseling', 'prep'
    ],
    responseTitle: "Looking for free tax preparation or confidential debt counseling? IRS-certified volunteers assist low-to-moderate income residents and seniors in Forsyth. Suggested verified listings matching your search:",
    examplePrompts: [
      'When does AARP Foundation Tax-Aide open for appointments?',
      'Free IRS certified tax filing for seniors in Forsyth',
      'Confidential non-profit debt counseling in Cumming'
    ]
  },
  {
    id: 'veterans',
    category: 'veterans',
    keywords: [
      'veteran', 'veterans', 'military', 'vfw', 'legion', 'va', 'dd214',
      'benefits', 'service member', 'combat', 'ptsd'
    ],
    responseTitle: "Are you a U.S. military veteran or family member seeking benefits, claims help, or camaraderie in Forsyth County? Suggested verified listings matching your search:",
    examplePrompts: [
      'How do I file a VA disability claim in Forsyth County?',
      'Veterans mental health and peer retreats in Cumming',
      'Emergency hardship relief for military veterans'
    ]
  },
  {
    id: 'disability',
    category: 'disability',
    keywords: [
      'disability', 'handicap', 'accessible', 'special olympics', 'sensory',
      'autism', 'wheelchair', 'speech therapy', 'occupational therapy', 'connectability'
    ],
    responseTitle: "Looking for disability resources, adaptive recreation, or developmental therapies in Forsyth County? Suggested verified listings matching your search:",
    examplePrompts: [
      'Where can I register for Forsyth County Special Olympics?',
      'Babies Can’t Wait early intervention referral in Cumming',
      'Adult day programs for developmental disabilities in Forsyth'
    ]
  },
  {
    id: 'animals',
    category: 'animals',
    keywords: [
      'pet', 'pets', 'dog', 'dogs', 'cat', 'cats', 'animal', 'shelter',
      'adoption', 'spay', 'neuter', 'vaccine', 'rabies', 'parc', 'humane'
    ],
    responseTitle: "Need pet adoption, low-cost vaccines, or animal services in Forsyth County? Local shelters and non-profits provide compassionate care. Suggested verified listings matching your search:",
    examplePrompts: [
      'Where is the Forsyth County PARC adoption center?',
      'Low cost pet vaccinations and rabies clinics in Cumming',
      'Pet food assistance pantry in Forsyth County'
    ]
  },
  {
    id: 'transportation',
    category: 'transportation',
    keywords: [
      'ride', 'transit', 'bus', 'van', 'transportation', 'access forsyth',
      'mobility', 'driver', 'rides', 'dial-a-ride', 'commute'
    ],
    responseTitle: "Need a ride to work, the doctor, or the grocery store in Forsyth County? Access Forsyth provides $3 curb-to-curb van rides throughout the county. Suggested verified listings matching your search:",
    examplePrompts: [
      'How do I schedule a $3 Access Forsyth transit trip?',
      'Medical transportation for seniors in Cumming',
      'Wheelchair accessible public transit in Forsyth'
    ]
  },
  {
    id: 'legal',
    category: 'legal',
    keywords: [
      'legal', 'lawyer', 'attorney', 'court', 'eviction legal', 'custody',
      'divorce', 'rights', 'law library', 'legal aid'
    ],
    responseTitle: "Need civil legal assistance, eviction defense, or self-help court forms in Forsyth County? Suggested verified listings matching your search:",
    examplePrompts: [
      'Georgia Legal Services Program income qualifications',
      'How to ask a lawyer a free legal question online',
      'Where is the Forsyth County Law Library located?'
    ]
  },
  {
    id: 'schools',
    category: 'schools',
    keywords: [
      'school', 'schools', 'high school', 'elementary', 'middle school', 'college',
      'lanier tech', 'ung', 'ged', 'literacy', 'kindergarten', 'enrollment'
    ],
    responseTitle: "Looking for schools, colleges, or adult education in Forsyth County? Suggested verified listings matching your search:",
    examplePrompts: [
      'South Forsyth High School address and phone number',
      'Free adult GED preparation classes at Lanier Tech',
      'Forsyth County Schools student enrollment requirements'
    ]
  },
  {
    id: 'repairs',
    category: 'repairs',
    keywords: [
      'repair', 'mechanic', 'auto', 'car repair', 'brakes', 'tires', 'oil change',
      'plumbing', 'hvac', 'ac repair', 'air conditioning', 'heater', 'electrician'
    ],
    responseTitle: "Need an honest local mechanic or home repair technician in Cumming? Suggested verified listings matching your search:",
    examplePrompts: [
      'Trustworthy auto mechanics for brakes and inspections in Cumming',
      '24/7 emergency plumbing repair in Forsyth County',
      'HVAC heating and air conditioning repair'
    ]
  },
  {
    id: 'childcare',
    category: 'childcare',
    keywords: [
      'childcare', 'daycare', 'preschool', 'infant', 'toddler', 'after school',
      'caps', 'early learning', 'pre-k'
    ],
    responseTitle: "Looking for licensed childcare, Georgia Pre-K, or infant daycare in Forsyth County? Suggested verified listings matching your search:",
    examplePrompts: [
      'Childcare centers accepting CAPS subsidy vouchers in Cumming',
      'Quality Rated infant and toddler daycares in South Forsyth',
      'Georgia lottery funded Pre-K programs in Forsyth'
    ]
  },
  {
    id: 'sports',
    category: 'sports',
    keywords: [
      'park', 'parks', 'swimming', 'pool', 'tennis', 'pickleball', 'playground',
      'trail', 'hiking', 'sawnee mountain', 'recreation', 'basketball', 'gym'
    ],
    responseTitle: "Looking for recreation, walking trails, splash pads, or community gyms in Forsyth County? Suggested verified listings matching your search:",
    examplePrompts: [
      'Which Forsyth County parks have splash pads or pools?',
      'Sawnee Mountain hiking trails and visitor center hours',
      'Public pickleball and tennis courts in Cumming'
    ]
  },
  {
    id: 'seniors',
    category: 'seniors',
    keywords: [
      'senior', 'seniors', 'elderly', 'meals on wheels', 'charles place', 'sexton hall',
      'alzheimer', 'dementia', 'medicare', 'aging'
    ],
    responseTitle: "Looking for senior programs, community meals, or caregiver support in Forsyth County? County Senior Services operates dedicated activity centers. Suggested verified listings matching your search:",
    examplePrompts: [
      'How to apply for Forsyth Meals on Wheels for a parent',
      'Sexton Hall enrichment and fitness classes for adults 50+',
      'Day respite care programs for seniors with memory loss'
    ]
  },
  {
    id: 'youth-family',
    category: 'youth-family',
    keywords: [
      'youth', 'family', 'teen', 'children', 'counseling for kids', 'foster',
      'mentoring', 'casa', 'clothing', 'the place'
    ],
    responseTitle: "Looking for youth development, family counseling, or crisis support in Forsyth County? Suggested verified listings matching your search:",
    examplePrompts: [
      'Where is The Place of Forsyth County community center?',
      'Free family counseling and teen crisis support',
      'Free clothing boutique and children’s essentials'
    ]
  },
  {
    id: 'workforce',
    category: 'workforce',
    keywords: [
      'job', 'jobs', 'workforce', 'career', 'resume', 'hiring', 'library',
      'books', 'computers', 'wifi', 'training', 'wioa', 'esl'
    ],
    responseTitle: "Looking for employment assistance, resume help, or library study tools in Forsyth County? Suggested verified listings matching your search:",
    examplePrompts: [
      'How do I apply for the $8,000 WIOA career training grant?',
      'Free computer access and resume review at Forsyth Library',
      'Free adult GED prep and English conversation classes'
    ]
  }
];

/**
 * Word-boundary matching helper to prevent false positive substring collisions.
 */
export function matchesWordBoundary(text: string, keyword: string): boolean {
  if (keyword.length <= 4) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(text);
  }
  return text.toLowerCase().includes(keyword.toLowerCase());
}

/**
 * Ranks all resources by relevance to the query based on keyword hits across name,
 * services, tagline, description, eligibility, and phone number.
 */
export function rankResources(query: string, categoryFilter?: string): ResourceItem[] {
  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(t => t.length > 1);

  const scored = COMMUNITY_RESOURCES.map(res => {
    let score = 0;

    if (categoryFilter && (res.category === categoryFilter || (categoryFilter === 'crisis' && res.isEmergency))) {
      score += 25;
    }

    const nameLower = res.name.toLowerCase();
    const tagLower = res.tagline.toLowerCase();
    const descLower = res.description.toLowerCase();
    const eligLower = res.eligibility.toLowerCase();
    const phoneLower = res.phone.toLowerCase();

    // Check full query
    if (nameLower.includes(q)) score += 35;
    if (tagLower.includes(q)) score += 15;
    if (descLower.includes(q)) score += 10;
    if (eligLower.includes(q)) score += 12;
    if (phoneLower.includes(q)) score += 20;

    // Check individual services
    for (const svc of res.keyServices) {
      const sLower = svc.toLowerCase();
      if (sLower.includes(q)) score += 18;
      for (const token of tokens) {
        if (matchesWordBoundary(sLower, token)) {
          score += 7;
        }
      }
    }

    // Check tokens across fields
    for (const token of tokens) {
      if (matchesWordBoundary(nameLower, token)) score += 14;
      if (matchesWordBoundary(tagLower, token)) score += 6;
      if (matchesWordBoundary(descLower, token)) score += 4;
      if (matchesWordBoundary(eligLower, token)) score += 6;
    }

    return { res, score };
  });

  return scored
    .filter(item => item.score >= 10)
    .sort((a, b) => b.score - a.score)
    .map(item => item.res);
}

export interface SearchEngineResult {
  responseText: string;
  matched: ResourceItem[];
  examplePrompts: string[];
  matchedRuleId?: string;
}

/**
 * Standardized category intent matcher based on TOPIC_RULES.
 * Supports personalized greetings with user neighbor name.
 */
export function matchDirectoryQuery(query: string, userName?: string): SearchEngineResult {
  const qTrim = query.trim();
  const greeting = userName ? `Hello, ${userName}! ` : '';

  // 1. Check standardized topic rules
  for (const rule of TOPIC_RULES) {
    const isMatch = rule.keywords.some(kw => matchesWordBoundary(qTrim, kw));
    if (isMatch) {
      const targetCategory = rule.category === 'crisis' ? undefined : (rule.category === 'emergency' ? 'emergency' : rule.category);
      const ranked = rankResources(qTrim, targetCategory);
      
      let matches: ResourceItem[];
      if (rule.category === 'crisis') {
        const emergencies = COMMUNITY_RESOURCES.filter(r => r.isEmergency);
        matches = (ranked.length > 0 ? ranked : emergencies).slice(0, 3);
      } else {
        matches = ranked.length > 0
          ? ranked.slice(0, 3)
          : COMMUNITY_RESOURCES.filter(r => r.category === rule.category).slice(0, 3);
      }

      return {
        responseText: greeting ? `${greeting}${rule.responseTitle}` : rule.responseTitle,
        matched: matches,
        examplePrompts: rule.examplePrompts,
        matchedRuleId: rule.id
      };
    }
  }

  // 2. Generic ranking fallback across entire directory
  const generalRanked = rankResources(qTrim);
  if (generalRanked.length > 0) {
    return {
      responseText: `${greeting}Here are the local Forsyth County resources that best match "${qTrim}":`,
      matched: generalRanked.slice(0, 3),
      examplePrompts: [
        'How do I contact this organization?',
        'Where can I get emergency groceries today?',
        'Find a free clinic or dentist for uninsured adults'
      ]
    };
  }

  // 3. Fallback when no matches are found
  return {
    responseText: `${greeting}I couldn't find a direct directory listing matching those exact keywords. For specialized community referrals in Forsyth County:\n\n• Dial 211 (United Way 24/7 Free Helpline for housing, utilities, food & care)\n• Call (770) 781-2101 (Forsyth County Government Information Line)\n• In acute crisis, call or text 988 (Suicide & Crisis Lifeline)\n\nOr try exploring one of these common topics:`,
    matched: [],
    examplePrompts: [
      'Where can I get emergency groceries today?',
      'Find a free clinic or dentist for uninsured adults',
      'Emergency rent, utility, or power bill assistance'
    ]
  };
}
