/**
 * CivicBridge — Interactive Directory Guide
 * Cumming & Forsyth County Community Infrastructure
 *
 * Client-side directory assistant that parses resident questions against
 * verified Forsyth County organizations, returning the top 3 matches with follow-up prompts.
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, ArrowUpRight, Phone } from 'lucide-react';
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
  '🎓 Schools & colleges',
  '🔧 Car & home repairs',
  '👶 Childcare & daycare',
  '🌳 Parks & swimming',
  '🆘 Crisis & urgent help'
];

export const CivicChatbot: React.FC<CivicChatbotProps> = ({ onSelectResource, onInitiateCall }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'guide',
      text: "Hey there! Need directions or a phone number? I help folks find what they need around Cumming and Forsyth County. That covers hot meals, clinics, honest mechanics, schools, or emergency housing.\n\nTo get started, tell me what you need, or try one of these examples:",
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

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsgId = `user-${Date.now()}`;
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: query,
        timestamp: userTimestamp
      }
    ];

    setMessages(newMessages);
    setInputMessage('');
    setIsTyping(true);

    // Natural pacing delay so response is readable
    setTimeout(() => {
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
          matchedResources: matched?.slice(0, 3), // Caps suggestions to the 3 most relevant listings
          examplePrompts
        }
      ]);
      setIsTyping(false);
    }, 450);
  };

  // Offline keyword matching engine: categorizes query and pulls top 3 verified Forsyth County listings
  const matchDirectoryQuery = (query: string): { 
    responseText: string; 
    matched?: ResourceItem[];
    examplePrompts?: string[];
  } => {
    const q = query.toLowerCase();

    // Crisis and urgent hotline matches
    if (q.includes('crisis') || q.includes('hotline') || q.includes('suicide') || q.includes('emergency') || q.includes('988') || q.includes('211') || q.includes('eviction')) {
      const emergencyMatches = COMMUNITY_RESOURCES.filter(r => r.isEmergency || r.id === 'food-1').slice(0, 3);
      return {
        responseText: "If things are tough right now, don't wait. Reach out immediately. The Suicide & Crisis Lifeline is free, confidential, and open 24/7 at 988. You can also dial 211 for emergency rent or shelter. Here are the top 3 emergency contacts ready to help you right now:\n\nWhat kind of urgent assistance do you need most?",
        matched: emergencyMatches,
        examplePrompts: [
          'How do I get emergency rent or utility help?',
          'Where is the nearest safe youth shelter in Cumming?',
          'Free crisis counseling and 24/7 support'
        ]
      };
    }

    // Education, school, and university matches
    if (q.includes('school') || q.includes('college') || q.includes('university') || q.includes('ung') || q.includes('lanier tech') || q.includes('elementary') || q.includes('middle') || q.includes('high school') || q.includes('preschool') || q.includes('pre-k') || q.includes('education') || q.includes('degree')) {
      const schools = COMMUNITY_RESOURCES.filter(r => r.category === 'schools').slice(0, 3);
      return {
        responseText: "Forsyth County has great education options for all ages. Here are the top 3 schools and colleges in the county:\n\nWhat age or program are you looking into? Tell me your specific need, or try asking one of these:",
        matched: schools,
        examplePrompts: [
          'Which elementary schools have dual language immersion?',
          'What degrees at Lanier Tech are 100% tuition-free?',
          'Where can I enroll my child in Head Start preschool?'
        ]
      };
    }

    // Automotive and residential repair trades
    if (q.includes('repair') || q.includes('auto') || q.includes('car') || q.includes('brake') || q.includes('plumb') || q.includes('pipe') || q.includes('hvac') || q.includes('ac') || q.includes('heat') || q.includes('handyman') || q.includes('roof') || q.includes('drywall') || q.includes('appliance') || q.includes('washer') || q.includes('dryer') || q.includes('refrigerator')) {
      const repairs = COMMUNITY_RESOURCES.filter(r => r.category === 'repairs').slice(0, 3);
      return {
        responseText: "Car trouble or something broken at home? It helps having honest folks you can call. Here are our top 3 verified local repair teams:\n\nWhat needs fixing? Let me know what you're dealing with, or ask:",
        matched: repairs,
        examplePrompts: [
          'Who does emergency 24/7 plumbing leaks in Cumming?',
          'Where can I get honest brake or engine repairs?',
          'Handyman for wheelchair ramp or home fixes'
        ]
      };
    }

    // Emergency food pantries and hot meals
    if (q.includes('food') || q.includes('pantry') || q.includes('grocer') || q.includes('hunger') || q.includes('meal') || q.includes('eat') || q.includes('pantries')) {
      const food = COMMUNITY_RESOURCES.filter(r => r.category === 'food').slice(0, 3);
      return {
        responseText: "Need groceries this week? Nobody should go hungry. You don't need to show proof of legal status. Here are the top 3 food assistance programs in Cumming:\n\nWhat kind of grocery help do you need? Tell me your situation, or try asking:",
        matched: food,
        examplePrompts: [
          'Which food pantries are open on weekday evenings?',
          'Can I get food boxes delivered to my door for my kids?',
          'Where can I find free baby formula and diapers in Forsyth?'
        ]
      };
    }

    // Healthcare, free clinics, and sliding-scale doctors
    if (q.includes('health') || q.includes('clinic') || q.includes('doctor') || q.includes('dental') || q.includes('teeth') || q.includes('dentist') || q.includes('prescription') || q.includes('mental') || q.includes('therapy') || q.includes('counseling')) {
      const health = COMMUNITY_RESOURCES.filter(r => r.category === 'healthcare').slice(0, 3);
      return {
        responseText: "Doctor bills can be scary, especially without insurance. Here are the top 3 free and sliding-scale clinics in Forsyth County:\n\nWhat kind of healthcare do you need right now? You can specify your need, or try asking:",
        matched: health,
        examplePrompts: [
          'Where can I get free tooth extractions without insurance?',
          'Free doctor visits and generic prescription refills',
          'Affordable sliding-scale family doctors near Cumming'
        ]
      };
    }

    // Childcare and preschool providers
    if (q.includes('childcare') || q.includes('daycare') || q.includes('baby') || q.includes('infant') || q.includes('toddler') || q.includes('afterschool') || q.includes('ymca') || q.includes('caps')) {
      const childcare = COMMUNITY_RESOURCES.filter(r => r.category === 'childcare').slice(0, 3);
      return {
        responseText: "Finding dependable care for little ones takes effort. Here are the top 3 childcare and early education centers in Forsyth County:\n\nWhat age is your child, and what schedule do you need? You can type your question, or ask:",
        matched: childcare,
        examplePrompts: [
          'Which daycares in Cumming accept Georgia CAPS subsidies?',
          'Are there part-time morning preschools available?',
          'After-school programs with financial scholarships'
        ]
      };
    }

    // Outdoor recreation and parks
    if (q.includes('park') || q.includes('sport') || q.includes('swim') || q.includes('pool') || q.includes('lake') || q.includes('hike') || q.includes('trail') || q.includes('nature') || q.includes('recreation')) {
      const sports = COMMUNITY_RESOURCES.filter(r => r.category === 'sports').slice(0, 3);
      return {
        responseText: "Looking to get outside this weekend? Here are the top 3 outdoor recreation spots in Forsyth County:\n\nWhat kind of outing are you planning? Tell me what you have in mind, or ask:",
        matched: sports,
        examplePrompts: [
          'Are the hiking trails at Sawnee Mountain good for beginners?',
          'Where can we swim at Lake Lanier with picnic tables?',
          'Indoor pool and splash park day passes in Cumming'
        ]
      };
    }

    // Family-owned restaurants and local diners
    if (q.includes('dine') || q.includes('dining') || q.includes('restaurant') || q.includes('pizza') || q.includes('deli') || q.includes('breakfast') || q.includes('steak')) {
      const dining = COMMUNITY_RESOURCES.filter(r => r.category === 'dining').slice(0, 3);
      return {
        responseText: "Hungry for good local food? Skip the chains. Here are our top 3 family-owned restaurants in Cumming:\n\nWhat kind of food are you craving tonight? Specify what you like, or ask:",
        matched: dining,
        examplePrompts: [
          'Family dinner near downtown Cumming playhouse',
          'Where can I find authentic Italian subs and cannoli?',
          'Best place for all-day breakfast and Greek gyros'
        ]
      };
    }

    // Library and workforce development resources
    if (q.includes('job') || q.includes('career') || q.includes('work') || q.includes('resume') || q.includes('library') || q.includes('ged') || q.includes('esl')) {
      const workforce = COMMUNITY_RESOURCES.filter(r => r.category === 'workforce').slice(0, 3);
      return {
        responseText: "Looking for work or a quiet place to learn? Here are the top 3 community career and library resources in Forsyth County:\n\nWhat career or study help are you looking for? Let me know, or try asking:",
        matched: workforce,
        examplePrompts: [
          'How do I apply for the $8,000 career training grant?',
          'Free computer access and resume review in Cumming',
          'Free adult GED prep and English conversation classes'
        ]
      };
    }

    // Generic fallback: broad text search across name, tagline, description, and keyServices
    const keywordMatches = COMMUNITY_RESOURCES.filter(r => 
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tagline.toLowerCase().includes(q) ||
      r.keyServices.some(s => s.toLowerCase().includes(q))
    ).slice(0, 3);

    if (keywordMatches.length > 0) {
      const topName = keywordMatches[0].name;
      return {
        responseText: `Found matching places in Forsyth County. Here are the top ${keywordMatches.length}:\n\nCould you tell me a little more about your actual need? For example, you could ask:`,
        matched: keywordMatches,
        examplePrompts: [
          `What are the opening hours and phone for ${topName}?`,
          `Are there free or sliding-scale options for this?`,
          `Show me more places located in central Cumming`
        ]
      };
    }

    return {
      responseText: "I want to make sure I connect you with the right place. Could you specify your actual need? Here are 3 example questions you can tap or ask:",
      matched: COMMUNITY_RESOURCES.slice(0, 3),
      examplePrompts: [
        'Where can I get emergency groceries today?',
        'Find a free clinic or dentist for uninsured adults',
        'Emergency plumbing or car brake repair in Cumming'
      ]
    };
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 bg-amber-800 hover:bg-amber-900 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-3 focus:ring-amber-500 focus:ring-offset-2"
            aria-label="Open CivicBridge Interactive Guide"
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-xs font-bold tracking-wide pr-0.5">Ask a Neighbor</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div 
          role="dialog"
          aria-label="CivicBridge Interactive Guide"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 print:hidden"
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
                  Active · 220 Local Places in Forsyth County
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
                  className={`max-w-[88%] p-3 rounded-2xl text-xs sm:text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-amber-800 text-white rounded-tr-none'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none space-y-2.5'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {msg.matchedResources && msg.matchedResources.length > 0 && (
                    <div className="space-y-1.5 pt-1.5 border-t border-stone-100">
                      <span className="text-[10px] font-mono uppercase text-stone-500 block font-bold">
                        Top 3 Recommended Places:
                      </span>
                      {msg.matchedResources.map((res) => (
                        <div
                          key={res.id}
                          className="p-2 bg-stone-50 border border-stone-200 rounded-xl hover:border-amber-700/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <span className="text-[10px] font-semibold text-amber-800 uppercase block">
                                {res.categoryLabel}
                              </span>
                              <strong className="text-xs text-stone-900 block font-serif leading-tight">
                                {res.name}
                              </strong>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-200/70 text-stone-700 shrink-0">
                              {res.cost}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-stone-200/60">
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
