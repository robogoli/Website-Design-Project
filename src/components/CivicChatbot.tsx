import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageCircle, ArrowUpRight, Phone, ExternalLink } from 'lucide-react';
import { ResourceItem } from '../types';
import { COMMUNITY_RESOURCES } from '../data/mockData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  matchedResources?: ResourceItem[];
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
      sender: 'bot',
      text: "Hi neighbor! I'm your local guide here to help you find whatever you or your family need around Cumming and Forsyth County—from free groceries and healthcare to reliable mechanics, schools, childcare, or emergency support. What can I help you find today?",
      timestamp: 'Just now'
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

    // Simulate smart interactive reasoning with a natural pause
    setTimeout(() => {
      const { responseText, matched } = generateBotResponse(query);
      const botMsgId = `bot-${Date.now()}`;
      const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages(prev => [
        ...prev,
        {
          id: botMsgId,
          sender: 'bot',
          text: responseText,
          timestamp: botTimestamp,
          matchedResources: matched
        }
      ]);
      setIsTyping(false);
    }, 450);
  };

  const generateBotResponse = (query: string): { responseText: string; matched?: ResourceItem[] } => {
    const q = query.toLowerCase();

    // 1. Emergency / Crisis check
    if (q.includes('crisis') || q.includes('hotline') || q.includes('suicide') || q.includes('emergency') || q.includes('988') || q.includes('211') || q.includes('eviction')) {
      return {
        responseText: "If you or someone you love is going through a tough time, please know that you are not alone and caring support is ready right now:\n• Suicide & Crisis Lifeline: Call or text 988 (Available 24/7, confidential)\n• Forsyth County 2-1-1: Dial 211 for emergency rent, shelter, or utility bills\n• The Place of Forsyth Crisis Line: (770) 887-1098\n• Bald Ridge Lodge (Youth Shelter): (770) 887-1232\n\nHere are verified local places ready to support you with open arms:",
        matched: COMMUNITY_RESOURCES.filter(r => r.isEmergency || r.id === 'food-1')
      };
    }

    // 2. Schools & Colleges check
    if (q.includes('school') || q.includes('college') || q.includes('university') || q.includes('ung') || q.includes('lanier tech') || q.includes('elementary') || q.includes('middle') || q.includes('high school') || q.includes('preschool') || q.includes('pre-k') || q.includes('education') || q.includes('degree')) {
      const schools = COMMUNITY_RESOURCES.filter(r => r.category === 'schools');
      return {
        responseText: "Forsyth County has wonderful schools and educational paths for all ages:\n• Preschool: Forsyth County Head Start & Georgia Pre-K\n• Elementary: Cumming Elementary (with dual-language immersion)\n• Middle & High: Otwell Middle & Forsyth Central High STEM Academy\n• Trade & Technical: Lanier Technical College (tuition-free HOPE Career Grants)\n• 4-Year University: University of North Georgia (UNG Cumming Campus)\n\nTake a look at a few options below:",
        matched: schools
      };
    }

    // 3. Repairs check
    if (q.includes('repair') || q.includes('auto') || q.includes('car') || q.includes('brake') || q.includes('plumb') || q.includes('pipe') || q.includes('hvac') || q.includes('ac') || q.includes('heat') || q.includes('handyman') || q.includes('roof') || q.includes('drywall') || q.includes('appliance') || q.includes('washer') || q.includes('dryer') || q.includes('refrigerator')) {
      const repairs = COMMUNITY_RESOURCES.filter(r => r.category === 'repairs');
      return {
        responseText: "When something in the house or car breaks down, here are honest, verified local pros in Cumming:\n• Auto Mechanics: Cumming Community Auto & Brake Repair\n• Plumbing & HVAC: North Georgia HVAC & 24/7 Plumbing\n• Home Handyman: Forsyth Handyman & Accessibility Ramps\n• Appliance Fixes: Sawnee Appliance & Electronics Repair\n\nClick on any service below to view hours, estimates, or call directly:",
        matched: repairs
      };
    }

    // 4. Food & Pantries check
    if (q.includes('food') || q.includes('pantry') || q.includes('grocer') || q.includes('hunger') || q.includes('meal') || q.includes('eat') || q.includes('pantries')) {
      const food = COMMUNITY_RESOURCES.filter(r => r.category === 'food');
      return {
        responseText: "Here are welcoming food pantries and meal programs where local families can receive groceries with dignity and care:\n• The Place of Forsyth: Free weekly groceries, fresh produce, and baby formula\n• Meals by Grace: Door-to-door food delivery for families with children\n• Forsyth Senior Meals on Wheels: Warm, nutritious weekday lunches delivered to homebound seniors\n\nNo legal status check or proof is needed at these pantries.",
        matched: food
      };
    }

    // 5. Healthcare & Clinic check
    if (q.includes('health') || q.includes('clinic') || q.includes('doctor') || q.includes('dental') || q.includes('teeth') || q.includes('dentist') || q.includes('prescription') || q.includes('mental') || q.includes('therapy') || q.includes('counseling')) {
      const health = COMMUNITY_RESOURCES.filter(r => r.category === 'healthcare');
      return {
        responseText: "Everyone deserves compassionate medical and dental care. Here are free and sliding-scale providers in Forsyth County:\n• Good Shepherd Clinic: 100% free doctor visits, prescriptions, and dental extractions for uninsured residents\n• Georgia Mountains Health: Affordable family medicine and dental on a sliding fee scale\n• Avita Community Partners: Gentle mental health counseling and 24/7 crisis support.",
        matched: health
      };
    }

    // 6. Childcare & Daycare check
    if (q.includes('childcare') || q.includes('daycare') || q.includes('baby') || q.includes('infant') || q.includes('toddler') || q.includes('afterschool') || q.includes('ymca') || q.includes('caps')) {
      const childcare = COMMUNITY_RESOURCES.filter(r => r.category === 'childcare');
      return {
        responseText: "Here are trusted local childcare programs that offer financial scholarships and accept Georgia CAPS subsidies:\n• Forsyth County YMCA Child Development Academy: Infant to after-school care with sliding-scale help\n• Little Sunshine Early Learning: Full-day care with CAPS subsidies accepted\n• Cumming First Baptist WEE: Nurturing part-time preschool and mother's morning out.",
        matched: childcare
      };
    }

    // 7. Sports & Parks check
    if (q.includes('park') || q.includes('sport') || q.includes('swim') || q.includes('pool') || q.includes('lake') || q.includes('hike') || q.includes('trail') || q.includes('nature') || q.includes('recreation')) {
      const sports = COMMUNITY_RESOURCES.filter(r => r.category === 'sports');
      return {
        responseText: "Looking to spend some quality time outside? Forsyth County has wonderful scenic parks and family recreation spots:\n• Sawnee Mountain Preserve: 11+ miles of peaceful hiking trails and the stunning Indian Seats overlook\n• Mary Alice Park: Sandy beach swimming, boat ramps, and lakeside picnic tables on Lake Lanier\n• Cumming Aquatic Center & Central Park: 50m indoor Olympic pool, outdoor splash park, and sports fields.",
        matched: sports
      };
    }

    // 8. Dining check
    if (q.includes('dine') || q.includes('dining') || q.includes('restaurant') || q.includes('pizza') || q.includes('deli') || q.includes('breakfast') || q.includes('steak')) {
      const dining = COMMUNITY_RESOURCES.filter(r => r.category === 'dining');
      return {
        responseText: "Here are cozy, family-owned restaurants where Cumming locals love to eat:\n• Tam’s BackStage: Historic dining with comfort classics right by the School Street Playhouse\n• Marie’s Italian Deli: Homestyle lasagna, freshly sliced deli subs, and authentic cannoli\n• Giorgio’s Family Restaurant: All-day breakfast, Greek gyros, and oven-fresh pizza.",
        matched: dining
      };
    }

    // 9. Workforce & Library check
    if (q.includes('job') || q.includes('career') || q.includes('work') || q.includes('resume') || q.includes('library') || q.includes('ged') || q.includes('esl')) {
      const workforce = COMMUNITY_RESOURCES.filter(r => r.category === 'workforce');
      return {
        responseText: "Free community resources for job searches, study spaces, and learning new skills:\n• Cumming Library: Free Wi-Fi, public computers, quiet study rooms, and resume coaching\n• WorkSource Georgia: Career training grants up to $8,000 and direct local hiring events\n• Forsyth Literacy Council: Free GED preparation and friendly ESL conversation classes.",
        matched: workforce
      };
    }

    // 10. General search against directory
    const keywordMatches = COMMUNITY_RESOURCES.filter(r => 
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tagline.toLowerCase().includes(q) ||
      r.keyServices.some(s => s.toLowerCase().includes(q))
    ).slice(0, 3);

    if (keywordMatches.length > 0) {
      return {
        responseText: `I found ${keywordMatches.length} friendly local places matching "${query}" in our Cumming & Forsyth County directory:`,
        matched: keywordMatches
      };
    }

    return {
      responseText: "I'm always glad to help you find local resources in Cumming and Forsyth County! You can ask me things like:\n• 'Where can I find free food or groceries?'\n• 'Are there free clinics or dentists in Cumming?'\n• 'What schools or college options are available?'\n• 'Who does reliable auto or home repairs?'\n• 'Where can I find affordable childcare?'",
      matched: COMMUNITY_RESOURCES.slice(0, 2)
    };
  };

  return (
    <>
      {/* Floating Chatbot Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 bg-amber-800 hover:bg-amber-900 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-3 focus:ring-amber-500 focus:ring-offset-2"
            aria-label="Open CivicBridge Interactive Chatbot"
          >
            <div className="relative">
              <Bot className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-xs font-bold tracking-wide pr-0.5">Ask a Neighbor</span>
          </button>
        )}
      </div>

      {/* Interactive Chatbot Window */}
      {isOpen && (
        <div 
          role="dialog"
          aria-label="CivicBridge Interactive Assistant"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 print:hidden"
        >
          {/* Header */}
          <header className="bg-amber-800 text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-700/80 rounded-lg">
                <Bot className="w-5 h-5 text-amber-100" />
              </div>
              <div>
                <h2 className="text-sm font-bold font-serif leading-tight">
                  CivicBridge Assistant
                </h2>
                <span className="text-[11px] text-amber-200/90 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Online · 220 Local Places in Forsyth County
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-amber-200 hover:text-white hover:bg-amber-700/60 rounded-lg transition-colors cursor-pointer"
              aria-label="Close assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Quick Prompts Bar */}
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

          {/* Messages Body */}
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

                  {/* Matched Interactive Resource Cards */}
                  {msg.matchedResources && msg.matchedResources.length > 0 && (
                    <div className="space-y-1.5 pt-1.5 border-t border-stone-100">
                      <span className="text-[10px] font-mono uppercase text-stone-400 block font-bold">
                        Recommended Resources:
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
                </div>

                <span className="text-[9.5px] text-stone-400 font-mono mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 max-w-[80px] bg-white border border-stone-200 rounded-2xl rounded-tl-none">
                <span className="w-1.5 h-1.5 bg-amber-800 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-amber-800 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-amber-800 rounded-full animate-bounce [animation-delay:0.3s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
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
              aria-label="Type your message to the CivicBridge assistant"
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
