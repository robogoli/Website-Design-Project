import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, ArrowUpRight, Phone, Info, ShieldCheck } from 'lucide-react';
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
}

const QUICK_PROMPTS = [
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

/**
 * Word-boundary match helper for short keywords to prevent false positives
 * (e.g. "beach" won't match "ac", "care" won't match "car", "weather" won't match "eat").
 */
function matchesWordBoundary(text: string, keyword: string): boolean {
  if (keyword.length <= 4) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(text);
  }
  return text.toLowerCase().includes(keyword.toLowerCase());
}

/**
 * Ranks all resources by relevance to the query based on keyword hits in name,
 * key services, tagline, and description.
 */
function rankResources(query: string, categoryFilter?: string): ResourceItem[] {
  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(t => t.length > 1);

  const scored = COMMUNITY_RESOURCES.map(res => {
    let score = 0;

    if (categoryFilter && res.category === categoryFilter) {
      score += 20;
    }

    const nameLower = res.name.toLowerCase();
    const tagLower = res.tagline.toLowerCase();
    const descLower = res.description.toLowerCase();
    const eligLower = res.eligibility.toLowerCase();
    const phoneLower = res.phone.toLowerCase();

    // Check full query
    if (nameLower.includes(q)) score += 30;
    if (tagLower.includes(q)) score += 15;
    if (descLower.includes(q)) score += 10;
    if (eligLower.includes(q)) score += 12;
    if (phoneLower.includes(q)) score += 20;

    // Check individual services
    for (const svc of res.keyServices) {
      const sLower = svc.toLowerCase();
      if (sLower.includes(q)) score += 15;
      for (const token of tokens) {
        if (matchesWordBoundary(sLower, token)) {
          score += 6;
        }
      }
    }

    // Check tokens across name, tagline, description, eligibility
    for (const token of tokens) {
      if (matchesWordBoundary(nameLower, token)) score += 12;
      if (matchesWordBoundary(tagLower, token)) score += 5;
      if (matchesWordBoundary(descLower, token)) score += 3;
      if (matchesWordBoundary(eligLower, token)) score += 5;
    }

    return { res, score };
  });

  // Only return results with genuine relevance score threshold
  return scored
    .filter(item => item.score >= 10)
    .sort((a, b) => b.score - a.score)
    .map(item => item.res);
}

export const CivicChatbot: React.FC<CivicChatbotProps> = ({ onSelectResource, onInitiateCall }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<number | null>(null);
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());
  const [explainedResources, setExplainedResources] = useState<Set<string>>(new Set());
  const [showAllResults, setShowAllResults] = useState<Set<string>>(new Set());

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'guide',
      text: "Hey there! Need directions or a phone number? I help folks find what they need around Cumming and Forsyth County. That covers hot meals, clinics, local mechanics, schools, or emergency housing.\n\nTo get started, tell me what you need, or try one of these examples:",
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

  // Safely cleanup pending response timeouts on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsgId = `user-${Date.now()}`;
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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

    // Clear previous pending response safely
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    // Consistent response delay handled safely with cleanup
    timerRef.current = window.setTimeout(() => {
      const { responseText, matched, examplePrompts } = matchDirectoryQuery(query);
      const guideMsgId = `guide-${Date.now()}`;
      const guideTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
   * Keyword matching engine using word boundaries for short keywords and
   * ranking results by keyword relevance score.
   */
  const matchDirectoryQuery = (query: string): { 
    responseText: string; 
    matched?: ResourceItem[];
    examplePrompts?: string[];
  } => {
    // 1. Crisis & Emergency hotlines (Highest Priority)
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
      const matches = (ranked.length > 0 ? ranked : fallback).slice(0, 3);

      return {
        responseText: "If you or someone you know is in immediate crisis, confidential help is available right now:\n\n• Suicide & Crisis Lifeline: Dial or text 988 (24/7 Free & Confidential)\n• Immediate Danger / Medical Emergency: Dial 911\n• Georgia Crisis & Access Line (GCAL): (800) 715-4225\n• Forsyth County Family Haven (Domestic Safety): (770) 887-1121\n• United Way Helpline: Dial 211\n\nSuggested resources matching your search:",
        matched: matches,
        examplePrompts: [
          'How do I get emergency rent or utility help?',
          'Where is the nearest safe youth shelter in Cumming?',
          'Free crisis counseling and 24/7 support'
        ]
      };
    }

    // 2. Housing, Rent, Eviction & Utility Bill Assistance
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
        responseText: "Facing housing instability or overdue utility bills? Help is available through Forsyth community programs and LIHEAP grants. Suggested resources matching your search:\n\nWhat kind of assistance do you need most?",
        matched: ranked,
        examplePrompts: [
          'Emergency grant to stop an eviction notice in Forsyth',
          'Past-due Sawnee EMC or Georgia Power bill relief',
          'Transitional family shelter and rapid re-housing'
        ]
      };
    }

    // 3. Food pantries, groceries & SNAP/EBT
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
      const ranked = rankResources(query, 'food');
      return {
        responseText: "Need groceries this week? Multiple pantries in Cumming distribute fresh food and baby supplies. Suggested resources matching your search:\n\nWhat kind of food assistance do you need?",
        matched: ranked,
        examplePrompts: [
          'Which food pantries are open on weekday evenings?',
          'Can I get food boxes delivered to my door for my kids?',
          'Where can I find free baby formula and diapers in Forsyth?'
        ]
      };
    }

    // 4. Healthcare, Dental & Medicaid
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
        responseText: "Medical and dental care are available regardless of insurance status. Suggested resources matching your search:\n\nWhat kind of care are you looking for?",
        matched: ranked,
        examplePrompts: [
          'Where can I get free tooth extractions without insurance?',
          'Free doctor visits and generic prescription refills',
          'Affordable sliding-scale family doctors near Cumming'
        ]
      };
    }

    // 5. Senior Services & Meals on Wheels
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
        responseText: "Forsyth County Senior Services provides nutrition, wellness, and daytime enrichment for adults 60+. Suggested resources matching your search:",
        matched: ranked,
        examplePrompts: [
          'How do I sign up for Meals on Wheels delivery in Forsyth?',
          'Senior center daytime activities and exercise classes',
          'Home weatherization assistance for elderly homeowners'
        ]
      };
    }

    // 6. Childcare & Daycare (including CAPS subsidies)
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
        responseText: "Finding dependable childcare takes care and research. Suggested resources matching your search:\n\nWhat age is your child, and what schedule do you need?",
        matched: ranked,
        examplePrompts: [
          'Which daycares in Cumming accept Georgia CAPS subsidies?',
          'Are there part-time morning preschools available?',
          'After-school programs with financial scholarships'
        ]
      };
    }

    // 7. Education, schools & colleges
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
        responseText: "Forsyth County offers strong public education and tuition-free technical credentials. Suggested resources matching your search:\n\nWhat program or grade level are you looking into?",
        matched: ranked,
        examplePrompts: [
          'Which elementary schools have dual language immersion?',
          'What degrees at Lanier Tech are 100% tuition-free?',
          'Where can I enroll my child in Head Start preschool?'
        ]
      };
    }

    // 8. Automotive and residential repair trades
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
        responseText: "Car trouble or something broken at home? Suggested resources matching your search:\n\nWhat needs fixing?",
        matched: ranked,
        examplePrompts: [
          'Who does emergency 24/7 plumbing leaks in Cumming?',
          'Where can I get honest brake or engine repairs?',
          'Handyman for wheelchair ramp or home fixes'
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
        responseText: "Looking to get outside this weekend? Suggested resources matching your search:\n\nWhat kind of outing are you planning?",
        matched: ranked,
        examplePrompts: [
          'Are the hiking trails at Sawnee Mountain good for beginners?',
          'Where can we swim at Lake Lanier with picnic tables?',
          'Indoor pool and splash park day passes in Cumming'
        ]
      };
    }

    // 10. Workforce & Library
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
        responseText: "Looking for employment assistance or library study tools? Suggested resources matching your search:\n\nWhat kind of career or learning support do you need?",
        matched: ranked,
        examplePrompts: [
          'How do I apply for the $8,000 career training grant?',
          'Free computer access and resume review in Cumming',
          'Free adult GED prep and English conversation classes'
        ]
      };
    }

    // 11. Emergency Preparedness & Disaster Recovery
    if (
      matchesWordBoundary(query, 'disaster') ||
      matchesWordBoundary(query, 'storm') ||
      matchesWordBoundary(query, 'tornado') ||
      matchesWordBoundary(query, 'fire') ||
      matchesWordBoundary(query, 'smoke') ||
      matchesWordBoundary(query, 'alarm') ||
      matchesWordBoundary(query, 'red cross') ||
      matchesWordBoundary(query, 'ema') ||
      matchesWordBoundary(query, 'gema') ||
      matchesWordBoundary(query, 'shelter')
    ) {
      const ranked = rankResources(query, 'emergency');
      return {
        responseText: "Looking for severe storm shelters, fire prevention, or disaster recovery? Local emergency management and Red Cross teams serve Forsyth County. Suggested resources matching your search:",
        matched: ranked,
        examplePrompts: [
          'Where are the severe storm shelters in Forsyth County?',
          'How do I get free smoke alarm installation in Cumming?',
          'How does the Red Cross help after a house fire?'
        ]
      };
    }

    // 12. Recovery & Peer Support
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
        responseText: "Seeking compassionate substance use recovery, peer coaching, or family support? Free, non-judgmental community programs in Cumming are ready to help. Suggested resources matching your search:",
        matched: ranked,
        examplePrompts: [
          'Where can I get free peer recovery coaching in Cumming?',
          'Immediate detox placement and JumpStart navigation',
          'Where can I get free Naloxone (Narcan) kits in Forsyth?'
        ]
      };
    }

    // 13. Tax & Financial Assistance
    if (
      matchesWordBoundary(query, 'tax') ||
      matchesWordBoundary(query, 'taxes') ||
      matchesWordBoundary(query, 'aarp') ||
      matchesWordBoundary(query, 'vita') ||
      matchesWordBoundary(query, 'credit') ||
      matchesWordBoundary(query, 'debt') ||
      matchesWordBoundary(query, 'medicare') ||
      matchesWordBoundary(query, 'ship') ||
      matchesWordBoundary(query, 'financial')
    ) {
      const ranked = rankResources(query, 'tax-finance');
      return {
        responseText: "Need free tax preparation, Medicare plan review, or non-profit debt counseling? Certified community navigators assist Forsyth residents. Suggested resources matching your search:",
        matched: ranked,
        examplePrompts: [
          'How do I make an appointment for free AARP tax filing?',
          'Free Medicare Part D comparison for seniors in Forsyth',
          'Nonprofit credit counseling and debt management help'
        ]
      };
    }

    // 14. Generic ranked query
    const rankedGeneral = rankResources(query);
    if (rankedGeneral.length > 0) {
      const topName = rankedGeneral[0].name;
      return {
        responseText: `Suggested resources matching your search in Forsyth County:\n\nCould you tell me a little more about your actual need? For example, you could ask:`,
        matched: rankedGeneral,
        examplePrompts: [
          `What are the opening hours and phone for ${topName}?`,
          `Are there free or sliding-scale options for this?`,
          `Show me more places located in central Cumming`
        ]
      };
    }

    // 12. Meaningful fallback when no matching results are found (does NOT return random irrelevant resources)
    return {
      responseText: "I couldn't find a direct directory listing matching those exact keywords. For personalized help or specialized community referrals:\n\n• Dial 211 (United Way 24/7 Free Helpline for housing, utilities, food & care)\n• Call (770) 781-2101 (Forsyth County Government Information Line)\n• In acute crisis, call or text 988 (Suicide & Crisis Lifeline)\n\nOr try exploring one of these common topics:",
      matched: [],
      examplePrompts: [
        'Where can I get emergency groceries today?',
        'Find a free clinic or dentist for uninsured adults',
        'Emergency rent, utility, or power bill assistance'
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
          <span className="text-xs font-bold tracking-wide whitespace-nowrap">Ask a Neighbor</span>
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
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, ''))}
                className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200 rounded-full transition-colors cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-stone-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-amber-800 text-white rounded-tr-none'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none space-y-2.5'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {msg.matchedResources && msg.matchedResources.length > 0 && (
                    <div className="space-y-2 pt-1.5 border-t border-stone-100">
                      <span className="text-[10px] font-mono uppercase text-stone-500 block font-bold">
                        Top Ranked Matches:
                      </span>
                      {msg.matchedResources
                        .slice(0, showAllResults.has(msg.id) ? undefined : 3)
                        .map((res) => (
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
                                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> Verified
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

                          {/* Provider-specific eligibility details */}
                          <div className="p-1.5 bg-amber-50/70 rounded-lg border border-amber-200/60 text-[10.5px] text-stone-700 flex items-start gap-1">
                            <Info className="w-3 h-3 text-amber-800 shrink-0 mt-0.5" />
                            <span className="leading-snug">
                              <strong>Eligibility:</strong> {res.eligibility}
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
                                <strong>Description:</strong> {res.description}
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
                                {res.intakeRequirements?.join(', ') || 'Contact provider for details'}
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
                                {res.description || 'A detailed description is not currently available in the directory.'}
                              </p>

                              {res.keyServices?.length > 0 && (
                                <p>
                                  <strong>Available services:</strong>{' '}
                                  {res.keyServices.join(', ')}.
                                </p>
                              )}

                              <p>
                                <strong>Cost:</strong>{' '}
                                {res.cost || 'Contact the provider for pricing.'}
                              </p>

                              <p>
                                <strong>Eligibility:</strong>{' '}
                                {res.eligibility || 'Contact the provider to confirm eligibility.'}
                              </p>

                              <p className="text-stone-500 italic">
                                Contact the organization directly to confirm current services and requirements.
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-200/60">
                            <a
                              href={`tel:${res.phone.replace(/[^\d+]/g, '')}`}
                              onClick={(e) => {
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
                              onClick={() => {
                                onSelectResource(res);
                              }}
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
                   
                  {msg.examplePrompts && msg.examplePrompts.length > 0 && (
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything (e.g. food pantries, clinic, honest mechanic, preschool)..."
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
