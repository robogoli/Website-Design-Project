
import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  ArrowUpRight,
  Phone,
  Info,
  ShieldCheck
} from 'lucide-react';
import { ResourceItem } from '../types';
import { COMMUNITY_RESOURCES } from '../data/mockData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'guide';
  text: string;
  timestamp: string;
  matchedResources?: ResourceItem[];
  examplePrompts?: string[];
}

interface CivicChatbotProps {
  onSelectResource: (resource: ResourceItem) => void;
  onInitiateCall?: (phone: string, resourceName: string) => void;
  userName?: string;
}

const SUGGESTED_TOPICS = [
  '🥫 Free food pantries',
  '🩺 Free clinic & dental',
  '🤝 Addiction & peer recovery',
  '🌪️ Severe storm & disaster prep',
  '💰 Free AARP tax filing',
  '🎓 Schools & colleges',
  '🔧 Car & home repairs',
  '👶 Childcare & daycare',
  '🌳 Parks & swimming',
  '🆘 Crisis & urgent help'
];

// Word-boundary matching helper preventing short query terms from falsely matching larger words (e.g. 'care' vs 'car')
function matchesWordBoundary(text: string, keyword: string): boolean {
  // Apply word-boundary regular expression for short search terms 4 characters or fewer
  if (keyword.length <= 4) {
    // Escape special regex characters in the search term safely
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Construct case-insensitive boundary regex
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    // Test if target text contains the keyword as a standalone word
    return regex.test(text);
  }

  // For longer words, use standard case-insensitive substring matching
  return text.toLowerCase().includes(keyword.toLowerCase());
}

// General resource relevance scoring algorithm ranking listings based on keyword occurrences
function rankResources(
  query: string,
  categoryFilter?: string
): ResourceItem[] {
  // Normalize search query into lowercase and trim whitespace
  const q = query.toLowerCase().trim();
  // Split query into individual word tokens with length greater than 1
  const tokens = q.split(/\s+/).filter(t => t.length > 1);

  // Score each organization in the directory against the search query
  const scored = COMMUNITY_RESOURCES.map(res => {
    // Initialize initial relevance score at 0
    let score = 0;

    // Grant 20 bonus points if resource matches the explicit category filter
    if (categoryFilter && res.category === categoryFilter) {
      score += 20;
    }

    // Lowercase resource attributes for fast comparison
    const nameLower = res.name.toLowerCase();
    const tagLower = res.tagline.toLowerCase();
    const descLower = res.description.toLowerCase();
    const eligLower = res.eligibility.toLowerCase();
    const phoneLower = res.phone.toLowerCase();

    // Prioritize exact full-phrase matches in title and contact details
    if (nameLower.includes(q)) score += 30;
    if (tagLower.includes(q)) score += 15;
    if (descLower.includes(q)) score += 10;
    if (eligLower.includes(q)) score += 12;
    if (phoneLower.includes(q)) score += 20;

    // Match query against specific service items offered by the organization
    for (const svc of res.keyServices || []) {
      const sLower = svc.toLowerCase();
      // Bonus if service contains the full query string
      if (sLower.includes(q)) score += 15;

      // Check each token against service tags using word boundaries
      for (const token of tokens) {
        if (matchesWordBoundary(sLower, token)) {
          score += 6;
        }
      }
    }

    // Award incremental points for individual token matches across primary fields
    for (const token of tokens) {
      if (matchesWordBoundary(nameLower, token)) score += 12;
      if (matchesWordBoundary(tagLower, token)) score += 5;
      if (matchesWordBoundary(descLower, token)) score += 3;
      if (matchesWordBoundary(eligLower, token)) score += 5;
    }

    // Return resource item paired with computed relevance score
    return { res, score };
  });

  // Filter out low-relevance results and sort descending by score
  const rankedResources = scored
    .filter(item => item.score >= 10)
    .sort((a, b) => b.score - a.score)
    .map(item => item.res);

  // De-duplicate resources while preserving calculated relevance ranking order
  return rankedResources.filter(
    (resource, index, resources) =>
      resources.findIndex(item => item.id === resource.id) === index
  );
}

// Specialized ranking algorithm prioritizing human food assistance and filtering out pet pantries
function rankFoodResources(query: string): ResourceItem[] {
  // Array of animal, shelter, and pet-related keywords used to identify pet services
  const petTerms = [
    'pet food',
    'animal services',
    'animal shelter',
    'dog food',
    'cat food',
    'companion pets',
    'pet pantry',
    'pets',
    'humane society'
  ];

  // Array of grocery, pantry, and food-assistance terms used for relevance scoring
  const groceryTerms = [
    'food',
    'grocery',
    'groceries',
    'pantry',
    'pantries',
    'hunger',
    'meal',
    'meals',
    'food bank',
    'food assistance',
    'emergency food',
    'fresh produce',
    'food boxes',
    'snap',
    'ebt',
    'nutrition'
  ];

  // Convert incoming user question to lowercase for case-insensitive matching
  const queryLower = query.toLowerCase();

  // Filter master directory ensuring only human food resources are included
  return COMMUNITY_RESOURCES
    .filter(res => {
      // Extract category string
      const category = (res.category || '').toLowerCase();

      // Aggregate all searchable text fields for this organization
      const searchableText = [
        res.name,
        res.categoryLabel,
        res.tagline,
        res.description,
        ...(res.keyServices || [])
      ].join(' ').toLowerCase();

      // Check if resource belongs to the food domain
      const isFoodCategory =
        category === 'food' ||
        (res.categoryLabel || '').toLowerCase().includes('food');

      // Check if resource contains pet or animal shelter terms
      const isPetResource = petTerms.some(term =>
        searchableText.includes(term)
      );

      // Return true only if it is a food resource and NOT an animal service
      return isFoodCategory && !isPetResource;
    })
    .map(res => {
      // Combine text properties for keyword scoring
      const searchableText = [
        res.name,
        res.tagline,
        res.description,
        ...(res.keyServices || [])
      ].join(' ').toLowerCase();

      // Initialize base food score
      let score = 0;

      // Add 5 points for each grocery term present in the listing
      for (const term of groceryTerms) {
        if (searchableText.includes(term)) {
          score += 5;
        }
      }

      // Add 20 points if title explicitly mentions food pantry or emergency food
      if (/food pantry|food bank|emergency food/i.test(res.name)) {
        score += 20;
      }

      // Add 15 points if key services include fresh groceries or food boxes
      if (/groceries|food boxes|fresh produce/i.test(
        (res.keyServices || []).join(' ')
      )) {
        score += 15;
      }

      // Add 10 points if user requested emergency aid and resource handles urgent needs
      if (
        queryLower.includes('emergency') &&
        /emergency|immediate/i.test(searchableText)
      ) {
        score += 10;
      }

      // Add 15 points if user searched for government food benefits (SNAP/EBT) and provider offers help
      if (
        queryLower.includes('snap') ||
        queryLower.includes('ebt') ||
        queryLower.includes('food stamps')
      ) {
        if (/snap|ebt|food stamps/i.test(searchableText)) {
          score += 15;
        }
      }

      // Return resource paired with computed relevance score
      return { res, score };
    })
    // Exclude resources with zero keyword hits
    .filter(item => item.score > 0)
    // Sort descending by highest relevance score
    .sort((a, b) => b.score - a.score)
    // Return sorted array of ResourceItem objects
    .map(item => item.res);
}

export const CivicChatbot: React.FC<CivicChatbotProps> = ({
  onSelectResource,
  onInitiateCall,
  userName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const timerRef = useRef<number | null>(null);

  const [expandedResources, setExpandedResources] =
    useState<Set<string>>(new Set());

  const [explainedResources, setExplainedResources] =
    useState<Set<string>>(new Set());

  const [showAllResults, setShowAllResults] =
    useState<Set<string>>(new Set());

  const [lastTopic, setLastTopic] = useState('');
  const [lastMatchedResources, setLastMatchedResources] =
    useState<ResourceItem[]>([]);

  const [nextResourceIndex, setNextResourceIndex] = useState(3);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'guide',
      text:
        "Hey there! Need directions or a phone number? I help folks find what they need around Cumming and Forsyth County. That covers hot meals, clinics, local mechanics, schools, or emergency housing.\n\nTo get started, tell me what you need, or try one of these examples:",
      timestamp: 'Just now',
      examplePrompts: [
        'Where can I get emergency groceries today?',
        'Free dental clinic for a toothache',
        'Emergency 24/7 plumbing repair in Cumming'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    const normalizedQuery = query.toLowerCase().trim();

    const isMoreRequest = [
      'show me more',
      'show more',
      'more resources',
      'more results',
      'next resources',
      'next results'
    ].some(term => normalizedQuery.includes(term));

    const followUpTerms = [
      'which ones',
      'what about',
      'are any',
      'do they',
      'how about',
      'those',
      'them',
      'they',
      'their'
    ];

    const isFollowUp =
      isMoreRequest ||
      followUpTerms.some(term => normalizedQuery.includes(term));

    if (!query) return;

    const userMsgId = `user-${Date.now()}`;

    const userTimestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: query,
        timestamp: userTimestamp
      }
    ]);

    setInputMessage('');
    setIsTyping(true);

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      let responseText = '';
      let matched: ResourceItem[] | undefined;
      let examplePrompts: string[] = [];

      if (isMoreRequest) {
        const nextResources = lastMatchedResources.slice(
          nextResourceIndex,
          nextResourceIndex + 3
        );

        if (nextResources.length > 0) {
          matched = nextResources;

          responseText =
            `Here are the next ${nextResources.length} resources matching your search:`;

          setNextResourceIndex(
            nextResourceIndex + nextResources.length
          );
        } else {
          matched = [];

          responseText =
            'You have viewed all the matching resources. Try searching for another type of assistance.';
        }
      } else {
        const searchQuery =
          isFollowUp && lastTopic
            ? `${lastTopic} ${query}`
            : query;

        const result = matchDirectoryQuery(searchQuery);

        responseText = result.responseText;
        examplePrompts = result.examplePrompts || [];
        matched = result.matched || [];

        if (!isFollowUp) {
          setLastTopic(query);
          setLastMatchedResources(result.matched || []);
          setNextResourceIndex(3);
        } else if (result.matched && result.matched.length > 0) {
          setLastMatchedResources(result.matched);
          setNextResourceIndex(3);
        }
      }

      const guideMsgId = `guide-${Date.now()}`;

      const guideTimestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

      setMessages(prev => [
        ...prev,
        {
          id: guideMsgId,
          sender: 'guide',
          text: responseText,
          timestamp: guideTimestamp,
          matchedResources: matched,
          examplePrompts
        }
      ]);

      setIsTyping(false);
      timerRef.current = null;
    }, 450);
  };

  /**
   * Main directory matching engine.
   */
  const matchDirectoryQuery = (
    query: string
  ): {
    responseText: string;
    matched?: ResourceItem[];
    examplePrompts?: string[];
  } => {

    // 1. Crisis and emergency support
    if (
      matchesWordBoundary(query, 'crisis') ||
      matchesWordBoundary(query, 'hotline') ||
      matchesWordBoundary(query, 'suicide') ||
      matchesWordBoundary(query, 'emergency') ||
      matchesWordBoundary(query, '988') ||
      matchesWordBoundary(query, '211') ||
      matchesWordBoundary(query, 'abuse') ||
      matchesWordBoundary(query, 'violence') ||
      matchesWordBoundary(query, 'haven') ||
      matchesWordBoundary(query, 'overdose')
    ) {
      const ranked = rankResources(query, 'legal-crisis');
      const fallback = COMMUNITY_RESOURCES.filter(r => r.isEmergency);
      const matches = ranked.length > 0 ? ranked : fallback;

      return {
        responseText:
          "If you or someone you know needs urgent help, these services may be useful:\n\n• Suicide & Crisis Lifeline: Dial or text 988 (24/7)\n• Immediate Danger / Medical Emergency: Dial 911\n• Georgia Crisis & Access Line (GCAL): (800) 715-4225\n• Forsyth County Family Haven: (770) 887-1121\n• United Way Helpline: Dial 211\n\nSuggested resources matching your search:",
        matched: matches,
        examplePrompts: [
          'How do I get emergency rent or utility help?',
          'Where can I find a safe youth support service?',
          'Free crisis counseling and 24/7 support'
        ]
      };
    }

    // 2. Housing, rent, eviction and utility assistance
    if (
      matchesWordBoundary(query, 'housing') ||
      matchesWordBoundary(query, 'shelter') ||
      matchesWordBoundary(query, 'rent') ||
      matchesWordBoundary(query, 'eviction') ||
      matchesWordBoundary(query, 'utility') ||
      matchesWordBoundary(query, 'utilities') ||
      matchesWordBoundary(query, 'electric') ||
      matchesWordBoundary(query, 'power bill') ||
      matchesWordBoundary(query, 'sawnee') ||
      matchesWordBoundary(query, 'gas') ||
      matchesWordBoundary(query, 'water bill') ||
      matchesWordBoundary(query, 'homeless') ||
      matchesWordBoundary(query, 'liheap')
    ) {
      const ranked = rankResources(query, 'housing');

      return {
        responseText:
          "Looking for housing or help with utility bills? Here are community resources that may be able to help. Contact each organization to confirm current funding, availability, and eligibility.\n\nWhat kind of assistance do you need most?",
        matched: ranked,
        examplePrompts: [
          'Emergency help with an eviction notice in Forsyth',
          'Past-due Sawnee EMC or Georgia Power bill assistance',
          'Transitional family shelter and housing support'
        ]
      };
    }

    // 3. Food pantries, groceries and SNAP/EBT
    if (
      matchesWordBoundary(query, 'food') ||
      matchesWordBoundary(query, 'pantry') ||
      matchesWordBoundary(query, 'pantries') ||
      matchesWordBoundary(query, 'groceries') ||
      matchesWordBoundary(query, 'grocery') ||
      matchesWordBoundary(query, 'hunger') ||
      matchesWordBoundary(query, 'meal') ||
      matchesWordBoundary(query, 'meals') ||
      matchesWordBoundary(query, 'eat') ||
      matchesWordBoundary(query, 'snap') ||
      matchesWordBoundary(query, 'ebt') ||
      matchesWordBoundary(query, 'food stamps')
    ) {
      const ranked = rankFoodResources(query);

      return {
        responseText:
          "Looking for groceries or food assistance in Forsyth County? Here are local food-assistance organizations listed in the directory. Availability, hours, inventory, and eligibility can change, so contact the organization before visiting.\n\nWhat kind of food assistance do you need?",
        matched: ranked,
        examplePrompts: [
          'Which food pantries have evening hours?',
          'Can I get food boxes delivered to my family?',
          'Where can I find free baby formula and diapers in Forsyth?'
        ]
      };
    }

    // 4. Healthcare, dental and Medicaid
    if (
      matchesWordBoundary(query, 'health') ||
      matchesWordBoundary(query, 'clinic') ||
      matchesWordBoundary(query, 'doctor') ||
      matchesWordBoundary(query, 'dental') ||
      matchesWordBoundary(query, 'teeth') ||
      matchesWordBoundary(query, 'dentist') ||
      matchesWordBoundary(query, 'prescription') ||
      matchesWordBoundary(query, 'mental') ||
      matchesWordBoundary(query, 'therapy') ||
      matchesWordBoundary(query, 'counseling') ||
      matchesWordBoundary(query, 'medicaid') ||
      matchesWordBoundary(query, 'peachcare') ||
      matchesWordBoundary(query, 'uninsured')
    ) {
      const ranked = rankResources(query, 'healthcare');

      return {
        responseText:
          "Looking for medical, dental, or mental health support? Here are community resources that may help. Contact providers to confirm services, costs, and availability.\n\nWhat kind of care are you looking for?",
        matched: ranked,
        examplePrompts: [
          'Where can I find affordable dental care?',
          'Free doctor visits and prescription assistance',
          'Affordable sliding-scale family doctors near Cumming'
        ]
      };
    }

    // 5. Senior services and Meals on Wheels
    if (
      matchesWordBoundary(query, 'senior') ||
      matchesWordBoundary(query, 'seniors') ||
      matchesWordBoundary(query, 'elderly') ||
      matchesWordBoundary(query, 'meals on wheels') ||
      matchesWordBoundary(query, 'aging') ||
      matchesWordBoundary(query, 'medicare') ||
      matchesWordBoundary(query, 'caregiver')
    ) {
      const ranked = rankResources(query, 'seniors');

      return {
        responseText:
          "Looking for senior services, meal delivery, or caregiver support? Here are resources serving the community. Contact providers to confirm eligibility and availability.",
        matched: ranked,
        examplePrompts: [
          'How do I ask about Meals on Wheels in Forsyth?',
          'Senior center activities and exercise classes',
          'Support services for family caregivers'
        ]
      };
    }

    // 6. Childcare and daycare
    if (
      matchesWordBoundary(query, 'childcare') ||
      matchesWordBoundary(query, 'daycare') ||
      matchesWordBoundary(query, 'baby') ||
      matchesWordBoundary(query, 'infant') ||
      matchesWordBoundary(query, 'toddler') ||
      matchesWordBoundary(query, 'afterschool') ||
      matchesWordBoundary(query, 'ymca') ||
      matchesWordBoundary(query, 'caps')
    ) {
      const ranked = rankResources(query, 'childcare');

      return {
        responseText:
          "Looking for childcare or daycare? Here are local resources to explore. Contact providers to confirm openings, costs, and eligibility.\n\nWhat age is your child, and what schedule do you need?",
        matched: ranked,
        examplePrompts: [
          'Which daycares accept Georgia CAPS subsidies?',
          'Are there part-time morning preschools available?',
          'After-school programs with financial assistance'
        ]
      };
    }

    // 7. Education, schools and colleges
    if (
      matchesWordBoundary(query, 'school') ||
      matchesWordBoundary(query, 'schools') ||
      matchesWordBoundary(query, 'college') ||
      matchesWordBoundary(query, 'university') ||
      matchesWordBoundary(query, 'ung') ||
      matchesWordBoundary(query, 'lanier tech') ||
      matchesWordBoundary(query, 'elementary') ||
      matchesWordBoundary(query, 'middle') ||
      matchesWordBoundary(query, 'high school') ||
      matchesWordBoundary(query, 'preschool') ||
      matchesWordBoundary(query, 'pre-k') ||
      matchesWordBoundary(query, 'education') ||
      matchesWordBoundary(query, 'degree') ||
      matchesWordBoundary(query, 'hope grant')
    ) {
      const ranked = rankResources(query, 'schools');

      return {
        responseText:
          "Looking for schools, college programs, or education support? Here are local resources to explore.\n\nWhat program or grade level are you looking into?",
        matched: ranked,
        examplePrompts: [
          'Which elementary schools have dual language immersion?',
          'What programs are available at Lanier Tech?',
          'Where can I find Head Start preschool information?'
        ]
      };
    }

    // 8. Automotive and home repairs
    if (
      matchesWordBoundary(query, 'repair') ||
      matchesWordBoundary(query, 'repairs') ||
      matchesWordBoundary(query, 'auto') ||
      matchesWordBoundary(query, 'car') ||
      matchesWordBoundary(query, 'brake') ||
      matchesWordBoundary(query, 'brakes') ||
      matchesWordBoundary(query, 'plumb') ||
      matchesWordBoundary(query, 'plumbing') ||
      matchesWordBoundary(query, 'pipe') ||
      matchesWordBoundary(query, 'hvac') ||
      matchesWordBoundary(query, 'ac') ||
      matchesWordBoundary(query, 'heat') ||
      matchesWordBoundary(query, 'handyman') ||
      matchesWordBoundary(query, 'roof') ||
      matchesWordBoundary(query, 'appliance')
    ) {
      const ranked = rankResources(query, 'repairs');

      return {
        responseText:
          "Looking for help with a vehicle or home repair? Here are local businesses and services listed in the directory. Contact providers to confirm pricing and availability.\n\nWhat needs fixing?",
        matched: ranked,
        examplePrompts: [
          'Who offers emergency plumbing services in Cumming?',
          'Where can I find affordable brake or engine repairs?',
          'Handyman services for home repairs'
        ]
      };
    }

    // 9. Outdoor recreation and parks
    if (
      matchesWordBoundary(query, 'park') ||
      matchesWordBoundary(query, 'parks') ||
      matchesWordBoundary(query, 'sport') ||
      matchesWordBoundary(query, 'sports') ||
      matchesWordBoundary(query, 'swim') ||
      matchesWordBoundary(query, 'pool') ||
      matchesWordBoundary(query, 'lake') ||
      matchesWordBoundary(query, 'hike') ||
      matchesWordBoundary(query, 'trail') ||
      matchesWordBoundary(query, 'nature') ||
      matchesWordBoundary(query, 'recreation')
    ) {
      const ranked = rankResources(query, 'sports');

      return {
        responseText:
          "Looking for parks, swimming, trails, or recreation? Here are local places to explore. Check official websites for current hours, fees, and closures.\n\nWhat kind of outing are you planning?",
        matched: ranked,
        examplePrompts: [
          'Are there beginner-friendly hiking trails?',
          'Where can we swim at Lake Lanier?',
          'Indoor pools and splash parks near Cumming'
        ]
      };
    }

    // 10. Workforce and library
    if (
      matchesWordBoundary(query, 'job') ||
      matchesWordBoundary(query, 'jobs') ||
      matchesWordBoundary(query, 'career') ||
      matchesWordBoundary(query, 'work') ||
      matchesWordBoundary(query, 'resume') ||
      matchesWordBoundary(query, 'library') ||
      matchesWordBoundary(query, 'ged') ||
      matchesWordBoundary(query, 'esl')
    ) {
      const ranked = rankResources(query, 'workforce');

      return {
        responseText:
          "Looking for job-search help, career training, or library services? Here are local resources to explore.\n\nWhat kind of career or learning support do you need?",
        matched: ranked,
        examplePrompts: [
          'How can I find career training assistance?',
          'Free computer access and resume help in Cumming',
          'Adult GED preparation and English classes'
        ]
      };
    }

    // 11. Emergency preparedness and disaster recovery
    if (
      matchesWordBoundary(query, 'disaster') ||
      matchesWordBoundary(query, 'storm') ||
      matchesWordBoundary(query, 'tornado') ||
      matchesWordBoundary(query, 'fire') ||
      matchesWordBoundary(query, 'smoke') ||
      matchesWordBoundary(query, 'alarm') ||
      matchesWordBoundary(query, 'red cross') ||
      matchesWordBoundary(query, 'ema') ||
      matchesWordBoundary(query, 'gema')
    ) {
      const ranked = rankResources(query, 'emergency');

      return {
        responseText:
          "Looking for storm preparation, fire prevention, or disaster recovery information? Here are local emergency and preparedness resources. For immediate danger, call 911.",
        matched: ranked,
        examplePrompts: [
          'Where can I find official storm safety information?',
          'How can I request smoke alarm installation?',
          'How does the Red Cross help after a house fire?'
        ]
      };
    }

    // 12. Recovery and peer support
    if (
      matchesWordBoundary(query, 'recovery') ||
      matchesWordBoundary(query, 'addiction') ||
      matchesWordBoundary(query, 'sober') ||
      matchesWordBoundary(query, 'rehab') ||
      matchesWordBoundary(query, 'detox') ||
      matchesWordBoundary(query, 'peer') ||
      matchesWordBoundary(query, 'narcan') ||
      matchesWordBoundary(query, 'naloxone') ||
      matchesWordBoundary(query, 'substance') ||
      matchesWordBoundary(query, 'alcohol')
    ) {
      const ranked = rankResources(query, 'recovery');

      return {
        responseText:
          "Looking for substance-use recovery information, peer support, or family resources? Here are local organizations to explore. Contact providers to confirm current services.",
        matched: ranked,
        examplePrompts: [
          'Where can I find peer recovery support in Cumming?',
          'What recovery support services are available?',
          'Where can I find information about Naloxone?'
        ]
      };
    }

    // 13. Tax and financial assistance
    if (
      matchesWordBoundary(query, 'tax') ||
      matchesWordBoundary(query, 'taxes') ||
      matchesWordBoundary(query, 'aarp') ||
      matchesWordBoundary(query, 'vita') ||
      matchesWordBoundary(query, 'credit') ||
      matchesWordBoundary(query, 'debt') ||
      matchesWordBoundary(query, 'ship') ||
      matchesWordBoundary(query, 'financial')
    ) {
      const ranked = rankResources(query, 'tax-finance');

      return {
        responseText:
          "Looking for free tax preparation, financial counseling, or Medicare assistance? Here are community resources to explore. Contact providers to confirm appointments and eligibility.",
        matched: ranked,
        examplePrompts: [
          'How do I find free tax preparation?',
          'Medicare counseling resources in Forsyth County',
          'Nonprofit credit counseling and debt support'
        ]
      };
    }

    // 14. General search
    const rankedGeneral = rankResources(query);

    if (rankedGeneral.length > 0) {
      const topName = rankedGeneral[0].name;

      return {
        responseText:
          "Here are some community resources that may match your search in Forsyth County. Check each listing for details and contact the organization to confirm current services.\n\nCould you tell me a little more about what you need?",
        matched: rankedGeneral,
        examplePrompts: [
          `What are the hours and phone number for ${topName}?`,
          'Are there free or reduced-cost options?',
          'Show me more resources in Cumming'
        ]
      };
    }

    // 15. No matching results
    return {
      responseText:
        "I couldn't find a direct directory listing matching those keywords. You can try a different search or contact these referral services for additional help:\n\n• United Way: Dial 211 for community referrals\n• Forsyth County Government Information: (770) 781-2101\n\nYou can also try one of these topics:",
      matched: [],
      examplePrompts: [
        'Where can I get emergency groceries?',
        'Find a clinic or dentist',
        'Emergency rent or utility assistance'
      ]
    };
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-3 right-3 sm:bottom-4 sm:right-5 z-40 rounded-full bg-amber-700 hover:bg-amber-800 hover:scale-105 px-3.5 py-2 sm:px-4 sm:py-2.5 text-white shadow-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 sm:gap-2 max-w-[calc(100vw-2rem)] focus:outline-none focus:ring-4 focus:ring-amber-500/40 print:hidden group shrink-0"
          aria-label="Open CivicBridge Interactive Guide"
        >
          <div className="relative shrink-0">
            <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <span className="text-xs font-bold tracking-wide whitespace-nowrap">
            Ask a Neighbor
          </span>
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-label="CivicBridge Interactive Guide"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[560px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 print:hidden"
        >
          <header className="bg-amber-800 text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-700/80 rounded-lg">
                <MessageCircle className="w-5 h-5 text-amber-100" />
              </div>

              <div>
                <h2 className="text-sm font-bold font-serif leading-tight">
                  CivicBridge Guide
                </h2>

                <span className="text-[11px] text-amber-200/90 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active · {COMMUNITY_RESOURCES.length} Local Places in Forsyth County
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-amber-200 hover:text-white hover:bg-amber-700/60 rounded-lg transition-colors cursor-pointer"
              aria-label="Close guide"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="bg-stone-50 border-b border-stone-200 p-2 overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
            {SUGGESTED_TOPICS.map((topic, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  handleSendMessage(topic.replace(/^[^\s]+\s/, ''))
                }
                className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200 rounded-full transition-colors cursor-pointer shrink-0"
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-stone-50/50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[92%] p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-amber-800 text-white rounded-tr-none'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none space-y-2.5'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {msg.matchedResources &&
                    msg.matchedResources.length > 0 && (
                      <div className="space-y-2 pt-1.5 border-t border-stone-100">
                        <span className="text-[10px] font-mono uppercase text-stone-500 block font-bold">
                          Matching Community Resources:
                        </span>

                        {msg.matchedResources
                          .slice(
                            0,
                            showAllResults.has(msg.id) ? undefined : 3
                          )
                          .map(res => (
                            <div
                              key={res.id}
                              className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl hover:border-amber-700/50 transition-colors space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-semibold text-amber-800 uppercase block">
                                      {res.categoryLabel}
                                    </span>

                                    <span className="inline-flex items-center gap-0.5 text-[9.5px] text-emerald-800 font-mono font-medium">
                                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                                      Verified
                                    </span>
                                  </div>

                                  <strong className="text-xs text-stone-900 block font-serif leading-tight mt-0.5">
                                    {res.name}
                                  </strong>
                                </div>

                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-200/70 text-stone-700 shrink-0">
                                  {res.cost}
                                </span>
                              </div>

                              <div className="p-1.5 bg-amber-50/70 rounded-lg border border-amber-200/60 text-[10.5px] text-stone-700 flex items-start gap-1">
                                <Info className="w-3 h-3 text-amber-800 shrink-0 mt-0.5" />

                                <span className="leading-snug">
                                  <strong>Eligibility:</strong>{' '}
                                  {res.eligibility}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedResources(prev => {
                                    const next = new Set(prev);

                                    if (next.has(res.id)) {
                                      next.delete(res.id);
                                    } else {
                                      next.add(res.id);
                                    }

                                    return next;
                                  });
                                }}
                                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline py-1"
                              >
                                {expandedResources.has(res.id)
                                  ? 'Show Less'
                                  : 'Learn More'}
                              </button>

                              {expandedResources.has(res.id) && (
                                <div className="mt-2 space-y-2 text-[11px] text-stone-700 border-t border-stone-200 pt-2">
                                  <p>
                                    <strong>Description:</strong>{' '}
                                    {res.description}
                                  </p>

                                  <p>
                                    <strong>Address:</strong> {res.address}
                                  </p>

                                  <p>
                                    <strong>Hours:</strong> {res.hours}
                                  </p>

                                  <p>
                                    <strong>Languages:</strong>{' '}
                                    {res.languages?.join(', ') || 'Not listed'}
                                  </p>

                                  <p>
                                    <strong>Services:</strong>{' '}
                                    {res.keyServices?.join(', ') || 'Not listed'}
                                  </p>

                                  <p>
                                    <strong>Requirements:</strong>{' '}
                                    {res.intakeRequirements?.join(', ') ||
                                      'Contact provider for details'}
                                  </p>

                                  {res.website && (
                                    <a
                                      href={res.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-block text-amber-800 font-bold underline"
                                    >
                                      Visit Official Website
                                    </a>
                                  )}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setExplainedResources(prev => {
                                    const next = new Set(prev);

                                    if (next.has(res.id)) {
                                      next.delete(res.id);
                                    } else {
                                      next.add(res.id);
                                    }

                                    return next;
                                  });
                                }}
                                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline py-1"
                              >
                                {explainedResources.has(res.id)
                                  ? 'Hide Explanation'
                                  : 'Explain Further'}
                              </button>

                              {explainedResources.has(res.id) && (
                                <div className="mt-1 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-stone-700 space-y-1.5">
                                  <strong className="text-amber-900">
                                    How this resource may help:
                                  </strong>

                                  <p>
                                    {res.description ||
                                      'A detailed description is not currently available in the directory.'}
                                  </p>

                                  {res.keyServices?.length > 0 && (
                                    <p>
                                      <strong>Available services:</strong>{' '}
                                      {res.keyServices.join(', ')}.
                                    </p>
                                  )}

                                  <p>
                                    <strong>Cost:</strong>{' '}
                                    {res.cost ||
                                      'Contact the provider for pricing.'}
                                  </p>

                                  <p>
                                    <strong>Eligibility:</strong>{' '}
                                    {res.eligibility ||
                                      'Contact the provider to confirm eligibility.'}
                                  </p>

                                  <p className="text-stone-500 italic">
                                    Contact the organization directly to
                                    confirm current services and requirements.
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-200/60">
                                <a
                                  href={`tel:${res.phone.replace(/[^\d+]/g, '')}`}
                                  onClick={e => {
                                    if (onInitiateCall) {
                                      e.preventDefault();
                                      onInitiateCall(res.phone, res.name);
                                    }
                                  }}
                                  className="text-[11px] text-stone-600 hover:text-amber-800 flex items-center gap-1 font-mono font-medium hover:underline"
                                  title={`Call ${res.name} at ${res.phone}`}
                                >
                                  <Phone className="w-3 h-3 text-stone-400" />
                                  <span>{res.phone}</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={() => onSelectResource(res)}
                                  className="text-[11px] text-amber-800 hover:text-amber-950 font-bold flex items-center gap-0.5 underline cursor-pointer"
                                >
                                  <span>View Details</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}

                        {msg.matchedResources.length > 3 && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowAllResults(prev => {
                                const next = new Set(prev);

                                if (next.has(msg.id)) {
                                  next.delete(msg.id);
                                } else {
                                  next.add(msg.id);
                                }

                                return next;
                              });
                            }}
                            className="w-full text-center text-xs font-bold text-amber-800 hover:text-amber-950 py-2 underline"
                          >
                            {showAllResults.has(msg.id)
                              ? 'Show Fewer Resources'
                              : `Show ${msg.matchedResources.length - 3} More Resources`}
                          </button>
                        )}
                      </div>
                    )}

                  {msg.examplePrompts &&
                    msg.examplePrompts.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-stone-100">
                        <span className="text-[10.5px] font-bold text-amber-900 block flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                          <span>Tap an example or type below to specify:</span>
                        </span>

                        <div className="flex flex-col gap-1.5">
                          {msg.examplePrompts.map((promptText, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => handleSendMessage(promptText)}
                              className="text-left text-[11px] p-2 rounded-lg bg-amber-50/80 hover:bg-amber-100 border border-amber-200 text-stone-800 hover:text-amber-950 transition-colors cursor-pointer flex items-center justify-between gap-1.5 group shadow-2xs"
                            >
                              <span>&ldquo;{promptText}&rdquo;</span>

                              <ArrowUpRight className="w-3 h-3 text-amber-700 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                <span className="text-[9.5px] text-stone-400 font-mono mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 max-w-[80px] bg-white border border-stone-200 rounded-2xl rounded-tl-none">
                <span className="w-1.5 h-1.5 bg-amber-800 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-amber-800 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-amber-800 rounded-full animate-bounce [animation-delay:0.3s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="mx-3 mb-2 rounded-xl border-2 border-amber-300 bg-amber-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-amber-800 shrink-0" />

              <h3 className="text-sm font-bold text-amber-950">
                How to Search CivicBridge
              </h3>
            </div>

            <p className="text-xs text-amber-950 mb-2">
              Describe the service you need. CivicBridge searches its
              community resource directory and displays matching listings.
            </p>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-amber-950">
              <p><strong>Food:</strong> groceries, pantry</p>
              <p><strong>Housing:</strong> rent, shelter</p>
              <p><strong>Healthcare:</strong> medical, clinic</p>
              <p><strong>Jobs:</strong> employment, resume</p>
            </div>
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="What kind of help do you need?"
              className="flex-1 text-xs py-2 px-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:bg-white transition-colors"
              aria-label="Type your message to the CivicBridge guide"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2 bg-amber-800 hover:bg-amber-900 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
