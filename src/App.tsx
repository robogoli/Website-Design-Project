// Import React core hooks, Suspense boundary, and lazy-loading utility
import React, { useState, useEffect, Suspense, lazy } from 'react';
// Import vector icons from Lucide icon library for scroll controls and notification banners
import { ArrowDown, ArrowUp, Bell, X } from 'lucide-react';

// Import domain interfaces for community listings and Forsyth County geographic districts
import { ResourceItem, DistrictType } from './types';
// Import pre-defined civic categories metadata
import { CATEGORIES } from './data/mockData';
// Import custom business logic hooks for directory resources and community feedback
import { useResources } from './hooks/useResources';
import { useFeedback } from './hooks/useFeedback';

// Import layout navigation header and footer components
import { Navbar, TabKey } from './components/Navbar';
import { Footer } from './components/Footer';
// Import resource cards and modal details components
import { ResourceCard } from './components/ResourceCard';
import { ResourceDetails } from './components/ResourceDetails';
// Import modular header search banner and community board showcase
import { HeroBanner } from './components/HeroBanner';
import { CommunityVoices } from './components/CommunityVoices';
// Import accessible dialogs for desktop call confirmation and neighbor greeting personalization
import { CallPromptModal } from './components/CallPromptModal';
import { WelcomeModal } from './components/WelcomeModal';
// Import interactive community chatbot guide
import { CivicChatbot } from './components/CivicChatbot';
// Import skeleton placeholder shown while lazy components are downloading
import { LoadingSkeleton } from './components/LoadingSkeleton';

// Code-split heavy tab views with React.lazy to minimize the initial JavaScript download bundle
const EventsSection = lazy(() => import('./components/EventsSection').then(m => ({ default: m.EventsSection })));
const FeedbackSection = lazy(() => import('./components/FeedbackSection').then(m => ({ default: m.FeedbackSection })));
const StandardsSection = lazy(() => import('./components/StandardsSection').then(m => ({ default: m.StandardsSection })));

// Primary application component orchestrating directory views, navigation tabs, and modal states
export function App() {
  // Navigation tab state tracking the active screen: 'resources', 'events', 'feedback', or 'about'
  const [currentTab, setCurrentTab] = useState<TabKey>('resources');

  // Deconstruct resource searching, category filtering, and community checkmark controls from custom hook
  const {
    resources: filteredResources,
    allResources,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedDistrict,
    setSelectedDistrict,
    isFiltered,
    resetFilters,
    userConfirmations,
    toggleUserConfirmation
  } = useResources();

  // Deconstruct real-time community notes, like counters, and toast notifications from custom hook
  const {
    feedbacks,
    allFeedbacksCount,
    recentNotification,
    dismissNotification,
    filterType,
    setFilterType,
    addFeedback,
    toggleLike,
    likedFeedbacks
  } = useFeedback();

  // Active resource item selected for viewing full contact, eligibility, and verification details in modal
  const [activeResource, setActiveResource] = useState<ResourceItem | null>(null);

  // Pre-filled resource name when transitioning from a listing directly to the feedback submission form
  const [feedbackPrefillResource, setFeedbackPrefillResource] = useState('');

  // Stored neighbor greeting name loaded from localStorage with fallback to an empty string
  const [userName, setUserName] = useState<string>(() => {
    try {
      // Read saved name from previous session
      return localStorage.getItem('civicbridge_neighbor_name') || '';
    } catch {
      // Return empty string if storage access is blocked
      return '';
    }
  });

  // Temporary name state buffer edited inside the WelcomeModal input
  const [tempName, setTempName] = useState(userName);
  
  // Boolean flag controlling visibility of the greeting name customization modal
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Calling modal dialog state providing device-specific phone call and clipboard workflows
  const [callPrompt, setCallPrompt] = useState<{
    isOpen: boolean;
    phone: string;
    cleanedPhone: string;
    resourceName: string;
    isMobile: boolean;
    copied: boolean;
  }>({
    isOpen: false,
    phone: '',
    cleanedPhone: '',
    resourceName: '',
    isMobile: false,
    copied: false
  });

  // Boolean state tracking whether user has scrolled down enough to display the scroll toggle button
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  
  // Boolean flag indicating whether user is currently near the bottom of the page
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Scroll listener effect updating button visibility and toggle direction based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Current vertical scroll distance in pixels
      const scrollY = window.scrollY;
      // Viewport window height
      const windowHeight = window.innerHeight;
      // Total scrollable document height
      const docHeight = document.documentElement.scrollHeight;

      // Show button once user has scrolled past 250px
      setShowScrollBottom(scrollY > 250);
      // Flip button arrow icon to 'Top' when within 120px of the footer
      setIsAtBottom(scrollY + windowHeight >= docHeight - 120);
    };

    // Attach passive scroll event listener for smooth 60fps performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Cleanup scroll listener on unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Action toggling viewport scroll between very top and very bottom of the directory
  const handleScrollToggle = () => {
    if (isAtBottom) {
      // Smooth scroll back to top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Smooth scroll directly to the bottom of the document
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  // Save customized neighbor name to local state and localStorage
  const handleSaveName = (e: React.FormEvent) => {
    // Prevent default browser form submission refresh
    e.preventDefault();
    // Trim excess whitespace and limit name to 20 characters
    const trimmed = tempName.trim().slice(0, 20);
    // Update active React state
    setUserName(trimmed);
    try {
      if (trimmed) {
        // Persist non-empty nickname to local storage
        localStorage.setItem('civicbridge_neighbor_name', trimmed);
      } else {
        // Remove storage key if user cleared their name
        localStorage.removeItem('civicbridge_neighbor_name');
      }
    } catch {
      // Storage access error fallback
    }
    // Dismiss the welcome modal dialog
    setShowWelcomeModal(false);
  };

  // Coordinate phone dial attempts with clipboard copy safety on desktop computers
  const handleInitiateCall = (phone: string, resourceName: string) => {
    // Strip non-digit characters for tel: URL protocol compliance
    const cleaned = phone.replace(/[^\d+]/g, '');
    // Detect if client is running on a smartphone or handheld mobile browser
    const isMobileDevice = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    let copyTriggered = false;
    // Automatically copy verified phone number to clipboard as a helpful fallback
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(phone).then(() => {
        // Update dialog state to show 'Copied to Clipboard' confirmation
        setCallPrompt(prev => ({ ...prev, copied: true }));
      }).catch(() => {});
      copyTriggered = true;
    }

    // Open call confirmation modal detailing dial instructions
    setCallPrompt({
      isOpen: true,
      phone,
      cleanedPhone: cleaned,
      resourceName,
      isMobile: isMobileDevice,
      copied: copyTriggered
    });

    // On mobile devices, automatically prompt the native cellular dialer
    if (isMobileDevice) {
      try {
        window.location.href = `tel:${cleaned}`;
      } catch {
        // Handle iframe security restriction
      }
    }
  };

  // Global keyboard listener allowing users to close any open modal by pressing the Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (callPrompt.isOpen) {
          // Close calling prompt dialog
          setCallPrompt(prev => ({ ...prev, isOpen: false }));
        } else if (showWelcomeModal) {
          // Close welcome name dialog
          setShowWelcomeModal(false);
        } else if (activeResource) {
          // Close resource detail sheet
          setActiveResource(null);
        }
      }
    };
    // Attach keydown listener to window
    window.addEventListener('keydown', handleKeyDown);
    // Remove listener on unmount
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callPrompt.isOpen, showWelcomeModal, activeResource]);

  // Complete list of geographic districts across Forsyth County
  const districts: Array<DistrictType | 'all'> = [
    'all',
    'Central Cumming',
    'North Forsyth',
    'South Forsyth',
    'East Forsyth',
    'West Forsyth'
  ];

  return (
    // Outer page wrapper with warm neutral styling
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      {/* Skip to main content landmark for keyboard screen reader accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-amber-800 text-white px-4 py-2 rounded-lg font-bold shadow-lg"
      >
        Skip to main content
      </a>

      {/* Global header navigation with crisis hotline quick-dial and personalized greeting */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userName={userName}
        onOpenNameModal={() => {
          setTempName(userName);
          setShowWelcomeModal(true);
        }}
        onCall={handleInitiateCall}
        eventsCount={0}
        feedbackCount={0}
      />

      {/* HTML5 datalist providing native instant search auto-completion */}
      <datalist id="civic-search-suggestions">
        {allResources.slice(0, 30).map(r => (
          <option key={r.id} value={r.name} />
        ))}
      </datalist>

      {/* Main semantic content area holding directory views */}
      <main id="main-content" className="flex-1 py-6 sm:py-8">
        {/* TAB 1: FIND RESOURCES */}
        {currentTab === 'resources' && (
          <div className="civic-container space-y-6">
            {/* Header search hero banner */}
            <HeroBanner
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearSearch={() => setSearchQuery('')}
            />

            {/* Filter controls section for categories and geographic zones */}
            <section className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4" aria-label="Directory Filters">
              {/* Category pill buttons */}
              <div>
                <span className="text-xs font-mono font-bold text-stone-700 uppercase tracking-wide block mb-2">
                  Browse by Category:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-amber-800 text-white font-semibold shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* District pills and reset filter controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-mono font-bold text-stone-700 uppercase tracking-wide mr-1">
                    District:
                  </span>
                  {districts.map((dist) => (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => setSelectedDistrict(dist)}
                      className={`px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                        selectedDistrict === dist
                          ? 'bg-stone-800 text-white font-semibold'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                      }`}
                    >
                      {dist === 'all' ? 'All Districts' : dist}
                    </button>
                  ))}
                </div>

                {/* Show reset button when any filter is active */}
                {isFiltered && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer self-start sm:self-auto"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            </section>

            {/* Display category discovery cards when unfiltered, or matching ResourceCards when filtered */}
            {!isFiltered ? (
              <section className="space-y-4" aria-label="Category Overview">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold font-serif text-stone-900">
                    Explore {allResources.length} Verified Resources across Forsyth County
                  </h2>
                  <span className="text-xs font-mono text-stone-500">
                    {CATEGORIES.filter(c => c.id !== 'all').length} Categories
                  </span>
                </div>

                {/* 19 category discovery tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
                    // Calculate count of verified organizations in this category
                    const count = allResources.filter(r => r.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className="p-4 bg-white border border-stone-200 hover:border-amber-700/50 rounded-2xl text-left shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-stone-900 font-serif text-sm group-hover:text-amber-800 transition-colors">
                              {cat.label}
                            </h3>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                              {count} {count === 1 ? 'Place' : 'Places'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 line-clamp-2">
                            Verified local services, operating hours, direct phone contacts, and physical locations in Cumming &amp; Forsyth.
                          </p>
                        </div>
                        <span className="text-xs font-bold text-amber-800 group-hover:underline pt-3 inline-flex items-center gap-1">
                          View Category &rarr;
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : (
              // Filtered listings grid view
              <section className="space-y-4" aria-label="Filtered Resource Listings">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                    Found {filteredResources.length} {filteredResources.length === 1 ? 'place' : 'places'}
                  </h2>
                  <span className="text-xs font-mono text-stone-500">
                    Showing results for current filters
                  </span>
                </div>

                {filteredResources.length > 0 ? (
                  // Grid of verified resource cards
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredResources.map((res) => (
                      <ResourceCard
                        key={res.id}
                        resource={res}
                        onSelect={setActiveResource}
                        onCall={handleInitiateCall}
                        isVerified={Boolean(res.isVerified)}
                      />
                    ))}
                  </div>
                ) : (
                  // Empty state when search keywords produce no results
                  <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-3">
                    <p className="text-base font-semibold text-stone-800">
                      No organizations matched your current filters.
                    </p>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Try searching with fewer keywords, selecting &ldquo;All Districts&rdquo;, or resetting your filters.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="btn btn-primary text-xs cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Public Community Voices showcase with recent verified resident notes */}
            <CommunityVoices
              feedbacks={feedbacks}
              allCount={allFeedbacksCount}
              likedFeedbacks={likedFeedbacks}
              onToggleLike={toggleLike}
              onViewAll={() => setCurrentTab('feedback')}
              onShareNote={() => {
                setFeedbackPrefillResource('');
                setCurrentTab('feedback');
              }}
            />
          </div>
        )}

        {/* TAB 2: LOCAL GATHERINGS (Lazy loaded with Suspense skeleton fallback) */}
        {currentTab === 'events' && (
          <Suspense fallback={<LoadingSkeleton />}>
            <EventsSection onCall={handleInitiateCall} />
          </Suspense>
        )}

        {/* TAB 3: NEIGHBOR NOTES (Lazy loaded with Suspense skeleton fallback) */}
        {currentTab === 'feedback' && (
          <Suspense fallback={<LoadingSkeleton />}>
            <FeedbackSection
              feedbacks={feedbacks}
              allCount={allFeedbacksCount}
              filterType={filterType}
              onFilterChange={setFilterType}
              onSubmitFeedback={addFeedback}
              onToggleLike={toggleLike}
              likedFeedbackIds={likedFeedbacks}
              initialResourceName={feedbackPrefillResource}
            />
          </Suspense>
        )}

        {/* TAB 4: COPYRIGHT & STANDARDS (Lazy loaded with Suspense skeleton fallback) */}
        {currentTab === 'about' && (
          <Suspense fallback={<LoadingSkeleton />}>
            <StandardsSection totalResourcesCount={allResources.length} />
          </Suspense>
        )}
      </main>

      {/* Global accessible footer */}
      <Footer />

      {/* Resource details sheet modal */}
      {activeResource && (
        <ResourceDetails
          resource={activeResource}
          onClose={() => setActiveResource(null)}
          onCall={handleInitiateCall}
          isQuickChecked={userConfirmations[activeResource.id]}
          onQuickCheck={(id) => toggleUserConfirmation(id)}
          feedbacks={feedbacks}
          onSuggestUpdate={(name) => {
            setActiveResource(null);
            setFeedbackPrefillResource(name);
            setCurrentTab('feedback');
          }}
        />
      )}

      {/* Neighbor name customization modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        tempName={tempName}
        onTempNameChange={(name) => setTempName(name.slice(0, 20))}
        onSave={handleSaveName}
        onClose={() => setShowWelcomeModal(false)}
      />

      {/* Desktop and mobile phone dial safety modal */}
      <CallPromptModal
        isOpen={callPrompt.isOpen}
        phone={callPrompt.phone}
        cleanedPhone={callPrompt.cleanedPhone}
        resourceName={callPrompt.resourceName}
        isMobile={callPrompt.isMobile}
        copied={callPrompt.copied}
        onClose={() => setCallPrompt(prev => ({ ...prev, isOpen: false }))}
        onCopy={() => {
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(callPrompt.phone);
            setCallPrompt(prev => ({ ...prev, copied: true }));
          }
        }}
      />

      {/* Live community note floating notification toast banner */}
      {recentNotification && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-full bg-white border-2 border-amber-500 rounded-2xl p-4 shadow-2xl flex items-start gap-3.5 animate-bounce-once transition-all"
        >
          <div className="p-2 rounded-xl bg-amber-100 text-amber-900 shrink-0 mt-0.5">
            <Bell className="w-5 h-5 text-amber-800 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                New Community Note
              </span>
              <span className="text-[10px] text-stone-400 font-mono">Just now</span>
            </div>
            <p className="text-xs font-semibold text-stone-900 leading-tight">
              {recentNotification.userName} shared a tip
              {recentNotification.resourceName ? ` on ${recentNotification.resourceName}` : ''}:
            </p>
            <p className="text-xs text-stone-600 line-clamp-2 italic leading-relaxed">
              &ldquo;{recentNotification.message}&rdquo;
            </p>
            <div className="pt-1.5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentTab('feedback');
                  dismissNotification();
                }}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
              >
                View Community Notes →
              </button>
              <button
                type="button"
                onClick={dismissNotification}
                className="text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismissNotification}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-md cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Interactive directory guide assistant */}
      <CivicChatbot
        onSelectResource={(res) => setActiveResource(res)}
        onInitiateCall={handleInitiateCall}
        userName={userName}
      />

      {/* Quick scroll toggle button (top/bottom) */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={handleScrollToggle}
          className="fixed bottom-6 left-6 z-40 bg-white hover:bg-stone-100 text-stone-800 border-2 border-stone-300 hover:border-amber-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center gap-2 text-xs font-bold font-mono print:hidden group"
          aria-label={isAtBottom ? 'Scroll to top of directory' : 'Scroll to bottom of directory'}
          title={isAtBottom ? 'Scroll to Top' : 'Scroll to Bottom'}
        >
          {isAtBottom ? (
            <>
              <ArrowUp className="w-4 h-4 text-amber-800 group-hover:-translate-y-0.5 transition-transform" />
              <span className="hidden sm:inline">Top</span>
            </>
          ) : (
            <>
              <ArrowDown className="w-4 h-4 text-amber-800 group-hover:translate-y-0.5 transition-transform" />
              <span className="hidden sm:inline">Bottom</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Export default App component for application entry point
export default App;
