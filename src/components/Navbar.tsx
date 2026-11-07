import React from 'react';
import {
  Compass,
  PhoneCall,
  Search,
  Calendar,
  MessageSquareHeart,
  FileCode2,
  HeartHandshake
} from 'lucide-react';

export type TabKey = 'resources' | 'events' | 'feedback' | 'about';

interface NavbarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  userName: string;
  onOpenNameModal: () => void;
  onCall: (phone: string, resourceName: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userName,
  onOpenNameModal,
  onCall
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 print:hidden">
      {/* 988 Emergency lifeline banner */}
      <div className="bg-amber-900 text-amber-50 px-4 py-1.5 text-xs">
        <div className="civic-container flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-[11.5px]">
              24/7 Crisis &amp; Suicide Lifeline: Call or text <strong className="text-white">988</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span>Forsyth 2-1-1: Dial 211</span>
            <span className="hidden sm:inline">|</span>
            <a
              href="tel:988"
              onClick={(e) => {
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

      {/* Main navigation header - always open navigation without collapse/X button */}
      <div className="civic-container py-2.5 sm:py-3">
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          {/* Logo container */}
          <button
            type="button"
            onClick={() => onSelectTab('resources')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus-visible:outline-none min-w-[210px] sm:min-w-[220px] max-w-[240px]"
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

          {/* Navigation tabs & greeting badge - always visible and open */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
            <nav className="flex items-center gap-0.5 sm:gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200" aria-label="Main Navigation">
              <button
                type="button"
                onClick={() => onSelectTab('resources')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  currentTab === 'resources'
                    ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/60'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
                aria-current={currentTab === 'resources' ? 'page' : undefined}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Resources</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('events')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  currentTab === 'events'
                    ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/60'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
                aria-current={currentTab === 'events' ? 'page' : undefined}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Events</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('feedback')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  currentTab === 'feedback'
                    ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/60'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
                aria-current={currentTab === 'feedback' ? 'page' : undefined}
              >
                <MessageSquareHeart className="w-3.5 h-3.5" />
                <span>Neighbor Notes</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('about')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  currentTab === 'about'
                    ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/60'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
                aria-current={currentTab === 'about' ? 'page' : undefined}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Standards</span>
              </button>
            </nav>

            {/* Greeting badge */}
            <button
              type="button"
              onClick={onOpenNameModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors cursor-pointer shrink-0"
              title="Click to change your greeting name"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-amber-800" />
              <span>{userName ? `Hi, ${userName}` : 'Hello, Neighbor'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
