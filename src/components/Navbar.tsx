// Import React for rendering the global header and navigation bar
import React from 'react';
// Import vector icons from Lucide for brand mark, hotline call, tab navigation, view counter, and like button
import {
  Compass,
  PhoneCall,
  Search,
  Calendar,
  MessageSquareHeart,
  FileCode2,
  HeartHandshake,
  Eye,
  Heart
} from 'lucide-react';

// Union type representing top-level navigation tabs across the application
export type TabKey = 'resources' | 'events' | 'feedback' | 'about';

// Props interface defining navigation callbacks, visitor greeting state, and cross-browser view/like counters
interface NavbarProps {
  // Currently active application view key
  currentTab: TabKey;
  // Handler triggered when user switches navigation tabs or clicks the logo
  onSelectTab: (tab: TabKey) => void;
  // Optional custom greeting name saved by the visitor
  userName: string;
  // Callback opening the WelcomeModal to set or edit the visitor's name
  onOpenNameModal: () => void;
  // Callback opening the safe call dialog for emergency hotline dialing
  onCall: (phone: string, resourceName: string) => void;
  // Count of unique browsers that have viewed the site
  uniqueViews: number;
  // Total site-wide likes across browsers
  likesCount: number;
  // Whether this visitor's browser has liked the site
  hasLiked: boolean;
  // True while a like toggle request is awaiting server confirmation
  isUpdatingLike: boolean;
  // Handler toggling the site-wide like vote
  onToggleSiteLike: () => void;
}

// Sticky application header containing the 988 crisis ribbon, tab bar, greeting badge, and top-right view/like stats
export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userName,
  onOpenNameModal,
  onCall,
  uniqueViews,
  likesCount,
  hasLiked,
  isUpdatingLike,
  onToggleSiteLike
}) => {
  return (
    // Sticky header hidden during print formatting so handouts remain clean
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 print:hidden">
      {/* 24/7 Crisis & Suicide Lifeline quick-access top ribbon */}
      <div className="bg-amber-900 text-amber-50 px-4 py-1.5 text-xs">
        <div className="civic-container flex flex-wrap items-center justify-between gap-2">
          {/* Animated status indicator and helpline prompt */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-[11.5px]">
              24/7 Crisis &amp; Suicide Lifeline: Call or text <strong className="text-white">988</strong>
            </span>
          </div>

          {/* 2-1-1 informational note and direct 988 call action */}
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span>Forsyth 2-1-1: Dial 211</span>
            <span className="hidden sm:inline">|</span>
            <a
              href="tel:988"
              onClick={(e) => {
                // Intercept anchor navigation to open the cross-device call safety dialog
                e.preventDefault();
                onCall('988', 'Suicide & Crisis Lifeline');
              }}
              className="text-amber-200 hover:text-white underline font-semibold flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Call 988 Free</span>
            </a>
          </div>
        </div>
      </div>

      {/* Primary navigation row with brand identity, section tabs, greeting badge, and top-right browser view/like stats */}
      <div className="civic-container py-2.5 sm:py-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
          {/* Interactive brand logo button returning the visitor to the Resources directory */}
          <button
            type="button"
            onClick={() => onSelectTab('resources')}
            className="order-1 flex items-center gap-2.5 text-left group cursor-pointer focus-visible:outline-none min-w-[180px] sm:min-w-[220px]"
            aria-label="CivicBridge Home"
          >
            <div className="p-2 rounded-xl bg-amber-800 text-white group-hover:bg-amber-900 transition-colors shadow-2xs shrink-0">
              <Compass className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold font-serif text-stone-900 tracking-tight block leading-tight">
                CivicBridge
              </span>
              <span className="text-[11px] text-stone-500 font-medium block leading-snug">
                Community Resource Directory · Forsyth County, GA
              </span>
            </div>
          </button>

          {/* Navigation tab strip */}
          <nav
            className="order-3 xl:order-2 w-full xl:w-auto flex items-center gap-0.5 sm:gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 shadow-2xs overflow-x-auto scrollbar-none"
            aria-label="Main Navigation"
          >
            {/* Resources directory tab button */}
            <button
              type="button"
              onClick={() => onSelectTab('resources')}
              className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'resources'
                  ? 'bg-white text-stone-950 font-bold shadow-xs border border-stone-300 ring-1 ring-black/5'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/90 font-medium'
              }`}
              aria-current={currentTab === 'resources' ? 'page' : undefined}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Resources</span>
            </button>

            {/* Local community gatherings tab button */}
            <button
              type="button"
              onClick={() => onSelectTab('events')}
              className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'events'
                  ? 'bg-white text-stone-950 font-bold shadow-xs border border-stone-300 ring-1 ring-black/5'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/90 font-medium'
              }`}
              aria-current={currentTab === 'events' ? 'page' : undefined}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Events</span>
            </button>

            {/* Community notes and feedback board tab button */}
            <button
              type="button"
              onClick={() => onSelectTab('feedback')}
              className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'feedback'
                  ? 'bg-white text-stone-950 font-bold shadow-xs border border-stone-300 ring-1 ring-black/5'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/90 font-medium'
              }`}
              aria-current={currentTab === 'feedback' ? 'page' : undefined}
            >
              <MessageSquareHeart className="w-3.5 h-3.5" />
              <span>Community Notes</span>
            </button>

            {/* Copyright, sources, and accessibility standards tab button */}
            <button
              type="button"
              onClick={() => onSelectTab('about')}
              className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'about'
                  ? 'bg-white text-stone-950 font-bold shadow-xs border border-stone-300 ring-1 ring-black/5'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/90 font-medium'
              }`}
              aria-current={currentTab === 'about' ? 'page' : undefined}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Standards</span>
            </button>
          </nav>

          {/* Top-right greeting button, unique browser view counter, and site like button */}
          <div className="order-2 xl:order-3 flex items-center gap-1.5 shrink-0 ml-auto xl:ml-0">
            {/* Personalized greeting button opening the WelcomeModal */}
            <button
              type="button"
              onClick={onOpenNameModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors cursor-pointer shrink-0"
              title="Click to change your greeting name"
              aria-label={userName ? `Greeting name: ${userName}` : 'Set your greeting name'}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-amber-800" aria-hidden="true" />
              <span className="hidden md:inline">{userName ? `Hi, ${userName}` : 'Hello, Neighbor'}</span>
            </button>

            {/* Unique browser visitors counter badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-stone-50 text-stone-700 border border-stone-200 shrink-0"
              title={`${uniqueViews.toLocaleString()} different ${uniqueViews === 1 ? 'browser has' : 'browsers have'} viewed CivicBridge`}
              aria-label={`${uniqueViews.toLocaleString()} unique browser ${uniqueViews === 1 ? 'view' : 'views'}`}
            >
              <Eye className="w-3.5 h-3.5 text-amber-800 shrink-0" aria-hidden="true" />
              <span className="font-mono font-bold text-stone-900">
                {uniqueViews.toLocaleString()}
              </span>
              <span className="text-stone-600 hidden sm:inline">
                {uniqueViews === 1 ? 'view' : 'views'}
              </span>
            </div>

            {/* Interactive site-wide like toggle button placed directly beside the view counter */}
            <button
              type="button"
              onClick={onToggleSiteLike}
              disabled={isUpdatingLike}
              aria-pressed={hasLiked}
              aria-label={
                hasLiked
                  ? `Unlike CivicBridge (${likesCount.toLocaleString()} likes)`
                  : `Like CivicBridge (${likesCount.toLocaleString()} likes)`
              }
              title={hasLiked ? 'Liked (click to unlike)' : 'Like CivicBridge'}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer shrink-0 ${
                hasLiked
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 shadow-2xs'
                  : 'bg-stone-50 hover:bg-rose-50 text-stone-700 hover:text-rose-700 border-stone-200 hover:border-rose-300'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                  hasLiked ? 'fill-rose-500 text-rose-600 scale-110' : 'text-stone-500'
                }`}
                aria-hidden="true"
              />
              <span className="font-mono font-bold">{likesCount.toLocaleString()}</span>
              <span className="hidden sm:inline">{hasLiked ? 'Liked' : 'Like'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

