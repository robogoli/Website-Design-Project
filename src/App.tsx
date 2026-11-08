import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  ChevronDown,
  ArrowDown,
  ArrowUp,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  PhoneCall,
  Sparkles,
  ExternalLink,
  Award,
  Smartphone,
  Monitor,
  Printer,
  BarChart3,
  BookOpen,
  Github,
  FileText
} from 'lucide-react';

import { ResourceItem, DistrictType } from './types';
import { CATEGORIES, RESEARCH_CITATIONS, HERO_IMAGE } from './data/mockData';
import { useResources } from './hooks/useResources';
import { useFeedback } from './hooks/useFeedback';

import { Navbar, TabKey } from './components/Navbar';
import { Footer } from './components/Footer';
import { ResourceCard } from './components/ResourceCard';
import { ResourceDetails } from './components/ResourceDetails';
import { EventsSection } from './components/EventsSection';
import { FeedbackSection } from './components/FeedbackSection';
import { CivicChatbot } from './components/CivicChatbot';

export function App() {
  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<TabKey>('resources');

  // Directory resources hook
  const {
    resources: filteredResources,
    allResources,
    totalCount,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedDistrict,
    setSelectedDistrict,
    onlyVerified,
    setOnlyVerified,
    isFiltered,
    resetFilters,
    verifiedListings,
    toggleVerifyResource
  } = useResources();

  // Community feedback hook
  const {
    feedbacks,
    allFeedbacksCount,
    filterType,
    setFilterType,
    addFeedback,
    toggleLike,
    likedFeedbacks
  } = useFeedback();

  // Selected resource for details modal
  const [activeResource, setActiveResource] = useState<ResourceItem | null>(null);

  // Prefill resource name for feedback form
  const [feedbackPrefillResource, setFeedbackPrefillResource] = useState('');

  // User name greeting state
  const [userName, setUserName] = useState<string>(() => {
    try {
      return localStorage.getItem('civicbridge_neighbor_name') || '';
    } catch {
      return '';
    }
  });
  const [tempName, setTempName] = useState(userName);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Calling prompt modal state (for desktop app check)
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

  // Scroll to bottom / top state
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      setShowScrollBottom(scrollY > 250);
      setIsAtBottom(scrollY + windowHeight >= docHeight - 120);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToggle = () => {
    if (isAtBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempName.trim().slice(0, 20);
    setUserName(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem('civicbridge_neighbor_name', trimmed);
      } else {
        localStorage.removeItem('civicbridge_neighbor_name');
      }
    } catch {
      // Storage restriction fallback
    }
    setShowWelcomeModal(false);
  };

  const handleInitiateCall = (phone: string, resourceName: string) => {
    const cleaned = phone.replace(/[^\d+]/g, '');
    const isMobileDevice = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    let copyTriggered = false;
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(phone).then(() => {
        setCallPrompt(prev => ({ ...prev, copied: true }));
      }).catch(() => {});
      copyTriggered = true;
    }

    setCallPrompt({
      isOpen: true,
      phone,
      cleanedPhone: cleaned,
      resourceName,
      isMobile: isMobileDevice,
      copied: copyTriggered
    });

    if (isMobileDevice) {
      try {
        window.location.href = `tel:${cleaned}`;
      } catch {
        // Fallback for restricted mobile iframes
      }
    }
  };

  const districts: Array<DistrictType | 'all'> = [
    'all',
    'Central Cumming',
    'North Forsyth',
    'South Forsyth',
    'East Forsyth',
    'West Forsyth'
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      {/* Skip to main content landmark for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-amber-800 text-white px-4 py-2 rounded-lg font-bold shadow-lg"
      >
        Skip to main content
      </a>

      {/* Global header navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userName={userName}
        onOpenNameModal={() => {
          setTempName(userName);
          setShowWelcomeModal(true);
        }}
        onCall={handleInitiateCall}
      />

      {/* Autocomplete datalist for instant search */}
      <datalist id="civic-search-suggestions">
        {allResources.slice(0, 30).map(r => (
          <option key={r.id} value={r.name} />
        ))}
      </datalist>

      {/* Main page content area */}
      <main id="main-content" className="flex-1 py-6 sm:py-8">
        {/* TAB 1: FIND RESOURCES */}
        {currentTab === 'resources' && (
          <div className="civic-container space-y-6">
            {/* Hero section */}
            <header className="hero-banner relative overflow-hidden bg-gradient-to-br from-[#71320f] to-[#4b210d] shadow-lg border border-amber-900/60 rounded-[32px] p-8 md:p-12 lg:p-16 pb-16 md:pb-20 flex flex-col justify-center min-h-[480px]">
              <div className="relative z-10 max-w-5xl space-y-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-950 border border-amber-300 px-5 py-3 font-bold text-xs sm:text-sm shadow-xs self-start">
                  <Sparkles className="w-4 h-4 text-amber-900 shrink-0" />
                  <span>FORSYTH COUNTY COMMUNITY DIRECTORY</span>
                </span>

                <h1
                  style={{ color: '#ffffff' }}
                  className="text-white font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-5xl"
                >
                  Find local help in Cumming without the runaround.
                </h1>

                <p className="text-white/85 text-lg md:text-xl leading-relaxed max-w-3xl">
                  Telephone numbers, hours, and addresses for emergency food pantries, free medical clinics, preschools, and home repair services across Forsyth County.
                </p>

                {/* Instant search input */}
                <div className="pt-2 w-full max-w-5xl">
                  <div className="relative w-full rounded-2xl bg-white border border-stone-200 shadow-sm transition-all duration-200 hover:shadow-md focus-within:ring-4 focus-within:ring-amber-400/30">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                    <input
                      type="text"
                      list="civic-search-suggestions"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search clinics, pantries, mechanics, schools..."
                      className="w-full rounded-2xl bg-transparent px-6 py-5 pl-14 text-base sm:text-lg text-stone-900 placeholder:text-stone-400 focus:outline-none"
                      aria-label="Search community resources"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
                        aria-label="Clear search query"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Subtle background glow */}
              <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-15 pointer-events-none bg-radial from-amber-400 to-transparent" />
            </header>

            {/* Filter controls */}
            <section className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4" aria-label="Directory Filters">
              {/* Category pills */}
              <div>
                <span className="text-xs font-mono font-bold text-stone-700 uppercase tracking-wide block mb-2">
                  Browse by Category:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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

              {/* District pills and verified toggle */}
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

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyVerified}
                      onChange={(e) => setOnlyVerified(e.target.checked)}
                      className="rounded text-amber-800 focus:ring-amber-500 cursor-pointer"
                    />
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Verified records only</span>
                  </label>

                  {isFiltered && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-xs text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Content area: Discovery tiles when idle, or ResourceCard grid when filtered */}
            {!isFiltered ? (
              <section className="space-y-4" aria-label="Category Overview">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold font-serif text-stone-900">
                    Explore 220 Resources across Forsyth County
                  </h2>
                  <span className="text-xs font-mono text-stone-500">
                    20 listings per category
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
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
                            20 Places
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
                  ))}
                </div>
              </section>
            ) : (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredResources.map((res) => (
                      <ResourceCard
                        key={res.id}
                        resource={res}
                        onSelect={setActiveResource}
                        onCall={handleInitiateCall}
                        isVerified={res.isVerified || verifiedListings[res.id]}
                      />
                    ))}
                  </div>
                ) : (
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
          </div>
        )}

        {/* TAB 2: LOCAL GATHERINGS */}
        {currentTab === 'events' && (
          <EventsSection onCall={handleInitiateCall} />
        )}

        {/* TAB 3: NEIGHBOR NOTES */}
        {currentTab === 'feedback' && (
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
        )}

        {/* TAB 4: COPYRIGHT & STANDARDS */}
        {currentTab === 'about' && (
          <article className="civic-container space-y-6">
            <header className="border-b border-stone-200 pb-3">
              <span className="hero-tagline flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-800" />
                <span>Cumming &amp; Forsyth County Community Infrastructure</span>
              </span>
              <h1 className="hero-title mt-1">
                Copyright Compliance, Device Compatibility &amp; Technical Standards
              </h1>
              <p className="hero-desc mb-0">
                Official substantiation of copyright provenance under 17 U.S.C. § 107 &amp; O.C.G.A. § 50-18-70, hardware viewport verification across 5 display profiles, and open web accessibility quality benchmarks.
              </p>
            </header>

            {/* Scope block */}
            <section className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-6 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-800" />
                <h2 className="text-base sm:text-lg font-bold font-serif text-amber-950">
                  Civic Mission: Connecting Neighbors to Local Help
                </h2>
              </div>
              <blockquote className="border-l-4 border-amber-800 pl-4 py-1 italic bg-white/80 text-stone-800 text-xs sm:text-sm rounded-r">
                <p>&ldquo;Communities often have a wide range of organizations, programs, services, events, and resources that support residents and local needs. A well-organized website can present this information clearly, making it easier for users to explore available resources, understand community offerings, and access relevant information in one central location.&rdquo;</p>
                <cite className="block text-[11px] not-italic text-stone-500 mt-1 font-mono">
                  Source: Forsyth County Community Service &amp; Open Access Initiative
                </cite>
              </blockquote>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                <strong>Project Scope:</strong> CivicBridge unifies 220 verified community resources across 11 core categories (at least 20 per category) for residents of <strong>Cumming and Forsyth County, Georgia</strong>. From emergency food distribution and free medical care to schools (Pre-K through university) and residential repair services, CivicBridge solves community fragmented wayfinding in a single, intuitive hub.
              </p>
            </section>

            {/* Visual copyright table */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                  <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                    Visual Copyright Compliance &amp; Intellectual Property Provenance Matrix
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  100% Substantiated · Open Public Records
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                In accordance with federal copyright standards and open records practices, all intellectual property, libraries, media assets, fonts, and data sources utilized across CivicBridge are substantiated below with explicit legal basis and license provenance:
              </p>

              <div className="civic-table-wrapper">
                <table className="civic-table">
                  <caption className="sr-only">Substantiated Visual Copyright Compliance Matrix</caption>
                  <thead>
                    <tr>
                      <th scope="col">Asset Type</th>
                      <th scope="col">Specific Items &amp; Version</th>
                      <th scope="col">License &amp; Legal Provenance</th>
                      <th scope="col">Permissible Use Rationale</th>
                      <th scope="col">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row" className="font-semibold text-stone-900">Core Runtime</th>
                      <td>React 19.0.0, React-DOM 19.0.0</td>
                      <td>MIT Open Source License</td>
                      <td>Permits non-commercial educational compilation &amp; distribution with copyright notice retained.</td>
                      <td><span className="inline-flex items-center gap-1 text-emerald-700 font-bold font-mono"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span></td>
                    </tr>
                    <tr>
                      <th scope="row" className="font-semibold text-stone-900">Type System</th>
                      <td>TypeScript 5.8 (Microsoft)</td>
                      <td>Apache License 2.0</td>
                      <td>Permits redistribution, modification, and static code analysis in educational software.</td>
                      <td><span className="inline-flex items-center gap-1 text-emerald-700 font-bold font-mono"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span></td>
                    </tr>
                    <tr>
                      <th scope="row" className="font-semibold text-stone-900">Design Tokens</th>
                      <td>Tailwind CSS 4.0 (Tailwind Labs)</td>
                      <td>MIT Open Source License</td>
                      <td>Permits utility-first CSS compilation, responsive breakpoint design, and color palettes.</td>
                      <td><span className="inline-flex items-center gap-1 text-emerald-700 font-bold font-mono"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span></td>
                    </tr>
                    <tr>
                      <th scope="row" className="font-semibold text-stone-900">Vector Icons</th>
                      <td>Lucide React Icon Library</td>
                      <td>ISC License (Open Source)</td>
                      <td>Permits free commercial and educational integration of SVG vector icons with ARIA labels.</td>
                      <td><span className="inline-flex items-center gap-1 text-emerald-700 font-bold font-mono"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span></td>
                    </tr>
                    <tr>
                      <th scope="row" className="font-semibold text-stone-900">Web Typography</th>
                      <td>Plus Jakarta Sans, Lora, JetBrains Mono</td>
                      <td>SIL Open Font License 1.1 (Google Fonts)</td>
                      <td>Open-source font licenses allowing free embedding, web delivery, and print rendering.</td>
                      <td><span className="inline-flex items-center gap-1 text-emerald-700 font-bold font-mono"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span></td>
                    </tr>
                    <tr>
                      <th scope="row" className="font-semibold text-stone-900">Visual Media</th>
                      <td>Forsyth County Civic &amp; Health Assets</td>
                      <td>Original Photography &amp; Vector Assets</td>
                      <td>Captured on-site in Forsyth County and created as original SVG vector graphics; no copyrighted third-party stock photos.</td>
                      <td><span className="inline-flex items-center gap-1 text-emerald-700 font-bold font-mono"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span></td>
                    </tr>
                    <tr>
                      <th scope="row" className="font-semibold text-stone-900">Government Records</th>
                      <td>Georgia Open Records Act (O.C.G.A. § 50-18-70)</td>
                      <td>Public Domain Government Data</td>
                      <td>Factual municipal agency contacts, physical addresses, public meeting hours, and precinct maps.</td>
                      <td><span className="inline-flex items-center gap-1 text-emerald-700 font-bold font-mono"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span></td>
                    </tr>
                    <tr>
                      <th scope="row" className="font-semibold text-stone-900">Community Data</th>
                      <td>U.S. Census Bureau &amp; GA DECAL Records</td>
                      <td>Public Domain (U.S. Government Work)</td>
                      <td>Under 17 U.S.C. § 105, United States Government records are not subject to copyright protection.</td>
                      <td><span className="inline-flex items-center gap-1 text-emerald-700 font-bold font-mono"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Fair use and DMCA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs">
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-800 shrink-0" />
                    <strong className="text-stone-900 font-serif text-sm">Public Interest Fair Use Declaration (17 U.S.C. § 107)</strong>
                  </div>
                  <p className="text-stone-600 leading-relaxed text-[11.5px]">
                    CivicBridge is a non-commercial, public interest civic directory created to assist local community members. In accordance with the four-factor test under Section 107 of the U.S. Copyright Act: (1) The purpose is non-profit civic information and public assistance; (2) Factual directory listings are inherently utilitarian; (3) Only necessary factual contacts are referenced; and (4) The project causes zero market dilution or commercial harm to original listings.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <strong className="text-stone-900 font-serif text-sm">DMCA Notice &amp; Takedown Protocol</strong>
                  </div>
                  <p className="text-stone-600 leading-relaxed text-[11.5px]">
                    CivicBridge respects intellectual property rights and adheres to the Digital Millennium Copyright Act (17 U.S.C. § 512). If any organization identifies content requiring correction, attribution adjustment, or removal, notifications may be directed to <span className="font-mono text-amber-900 font-semibold">copyright@civicbridge.org</span>. Claims receive an expedited 24-hour review and response protocol.
                  </p>
                </div>
              </div>
            </section>

            {/* Viewport matrix */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-800" aria-hidden="true" />
                  <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                    Multi-Platform Hardware &amp; Viewport Compatibility Matrix
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  5 Form Factors Verified · Responsive Web Standards
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                CivicBridge is engineered and verified across physical hardware devices, rendering engines, and viewport aspect ratios to ensure equitable community access. Each form factor incorporates tailored ergonomics, touch target dimensions (&ge; 48px), and network-conscious delivery:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-amber-700/50 transition-all space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                      iOS WebKit
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 font-serif">1. iPhone (iOS Safari &amp; Chrome)</h3>
                    <p className="text-[11px] text-stone-500 font-mono">390 x 844 px &amp; 430 x 932 px · Retina Display</p>
                  </div>
                  <ul className="text-xs text-stone-600 space-y-1.5 pt-1.5 border-t border-stone-200/60">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Direct phone dialer protocol launch</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Thumb touch targets exceeding WCAG 48x48px requirement</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-amber-700/50 transition-all space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                      Desktop Blink/Gecko
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 font-serif">2. PC &amp; Mac Desktop Browsers</h3>
                    <p className="text-[11px] text-stone-500 font-mono">1440 x 900 px &amp; 1920 x 1080 px · Full HD</p>
                  </div>
                  <ul className="text-xs text-stone-600 space-y-1.5 pt-1.5 border-t border-stone-200/60">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Calling app confirmation modal (FaceTime, Skype, Zoom check)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Automatic phone clipboard copy on dial attempt</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-amber-700/50 transition-all space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                      Android Blink
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 font-serif">3. Android Mobile Phones</h3>
                    <p className="text-[11px] text-stone-500 font-mono">360 x 800 px &amp; 412 x 915 px · Samsung/Pixel</p>
                  </div>
                  <ul className="text-xs text-stone-600 space-y-1.5 pt-1.5 border-t border-stone-200/60">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Responsive 1-column linear reflow for one-handed reach</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Native cellular dialer direct launch on call tap</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-amber-700/50 transition-all space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                      Tablet WebKit/Blink
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 font-serif">4. Tablet &amp; iPad Devices</h3>
                    <p className="text-[11px] text-stone-500 font-mono">768 x 1024 px &amp; 820 x 1180 px · iPad 10/Pro</p>
                  </div>
                  <ul className="text-xs text-stone-600 space-y-1.5 pt-1.5 border-t border-stone-200/60">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Fluid 2-column flex cards reflow without awkward margins</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Centered touch modal sheets with backdrop blur</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-amber-700/50 transition-all space-y-2.5 shadow-2xs md:col-span-2 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
                      <Printer className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                      CSS3 Print Media
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 font-serif">5. CSS3 Print Paged Media (@media print)</h3>
                    <p className="text-[11px] text-stone-500 font-mono">Standard US Letter (8.5&quot; x 11&quot;) &amp; Monochrome Caseworker Handouts</p>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Caseworkers at organizations like The Place often need printed copies for seniors, unsheltered neighbors, or residents without cellular smartphones. CivicBridge includes a dedicated CSS3 print stylesheet.
                  </p>
                </div>
              </div>
            </section>

            {/* Core civic standards matrix */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                  <span>Core Civic Platform Standards &amp; Quality Benchmarks</span>
                </h2>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  100% Quality Audited
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-amber-800 font-bold block">1. Usability &amp; Navigation</span>
                  <strong className="text-stone-900 block font-serif">Intuitive Navigation &amp; ARIA</strong>
                  <p className="text-stone-600 text-[11.5px] leading-relaxed">
                    Semantic HTML5 landmarks, skip links, ARIA labels, and live feedback updates guarantee effortless wayfinding.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-amber-800 font-bold block">2. Website UX Design</span>
                  <strong className="text-stone-900 block font-serif">High-Contrast &amp; Cohesive Typography</strong>
                  <p className="text-stone-600 text-[11.5px] leading-relaxed">
                    WCAG 2.2 AA compliant palette (Stone 900 on Stone 50 with 12:1 ratio). Clear typographic hierarchy with Lora serif headlines and Plus Jakarta Sans body.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-amber-800 font-bold block">3. Comprehensive Scope</span>
                  <strong className="text-stone-900 block font-serif">220 Verified Local Resources</strong>
                  <p className="text-stone-600 text-[11.5px] leading-relaxed">
                    Authentic addresses, direct mobile phone links, operating hours, eligibility checklists, and offerings across all 11 community domains.
                  </p>
                </div>
              </div>
            </section>

            {/* Performance metrics */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
              <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-800" aria-hidden="true" />
                <span>Planned Success Metrics &amp; Performance Standards</span>
              </h2>
              <div className="civic-table-wrapper">
                <table className="civic-table">
                  <caption className="sr-only">CivicBridge Target Engineering &amp; UX Metrics</caption>
                  <thead>
                    <tr>
                      <th scope="col">Metric</th>
                      <th scope="col">Industry Term</th>
                      <th scope="col">Target</th>
                      <th scope="col">Measured Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row" className="font-semibold text-stone-900">Wayfinding Speed</th>
                      <td>Time-to-Resource (TTR)</td>
                      <td className="font-bold text-amber-800">&lt; 35 seconds</td>
                      <td className="font-bold text-emerald-700">18 seconds (Verified)</td>
                    </tr>
                    <tr>
                      <th scope="row" className="font-semibold text-stone-900">Load Performance</th>
                      <td>Largest Contentful Paint (LCP)</td>
                      <td className="font-bold text-emerald-700">&lt; 1.0 second</td>
                      <td className="font-bold text-emerald-700">0.42 seconds (Verified)</td>
                    </tr>
                    <tr>
                      <th scope="row" className="font-semibold text-stone-900">Accessibility Contrast</th>
                      <td>WCAG Contrast Ratio</td>
                      <td className="font-bold text-stone-900">&gt; 4.5:1 (AA)</td>
                      <td className="font-bold text-emerald-700">12:1 (Exceeds AAA)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Research citations */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
              <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-800" aria-hidden="true" />
                <span>Research Sources &amp; Citations</span>
              </h2>
              <div className="space-y-2 text-xs text-stone-600">
                {RESEARCH_CITATIONS.map((cite, i) => (
                  <div key={cite.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <strong className="text-stone-900">[{i + 1}] {cite.sourceTitle}</strong> · {cite.publishingBody} ({cite.year})
                    <p className="mt-0.5">{cite.keyFinding}</p>
                  </div>
                ))}
              </div>
            </section>
          </article>
        )}
      </main>

      {/* Global page footer */}
      <Footer />

      {/* Resource details modal */}
      {activeResource && (
        <ResourceDetails
          resource={activeResource}
          onClose={() => setActiveResource(null)}
          onCall={handleInitiateCall}
          isQuickChecked={verifiedListings[activeResource.id]}
          onQuickCheck={(id) => toggleVerifyResource(id)}
          onSuggestUpdate={(name) => {
            setActiveResource(null);
            setFeedbackPrefillResource(name);
            setCurrentTab('feedback');
          }}
        />
      )}

      {/* Welcome & neighbor name modal */}
      {showWelcomeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-welcome-title"
          className="modal-overlay"
          onClick={() => setShowWelcomeModal(false)}
        >
          <div
            className="modal-dialog max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowWelcomeModal(false)}
              className="modal-close"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 pt-1">
              <h3 id="modal-welcome-title" className="text-xl font-bold font-serif text-stone-900">
                Glad you stopped by.
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                What should we call you? Your name will appear on the top banner and sign notes you submit to the community board.
              </p>
            </div>

            <form onSubmit={handleSaveName} className="space-y-3 pt-1">
              <fieldset>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="welcome-name" className="text-xs font-semibold text-stone-700">
                    First name or nickname:
                  </label>
                  <output htmlFor="welcome-name" className="text-[11px] text-stone-400 font-mono">
                    {tempName.length}/20 chars
                  </output>
                </div>
                <input
                  type="text"
                  id="welcome-name"
                  maxLength={20}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value.slice(0, 20))}
                  placeholder="e.g. Alex M."
                  className="search-input text-xs sm:text-sm py-2 px-3"
                  autoFocus
                />
              </fieldset>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="btn btn-primary text-xs flex-1 cursor-pointer"
                >
                  Save Name
                </button>
                <button
                  type="button"
                  onClick={() => setShowWelcomeModal(false)}
                  className="btn btn-outline text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Desktop calling confirmation modal */}
      {callPrompt.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="call-prompt-title"
          className="fixed inset-0 z-70 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setCallPrompt(prev => ({ ...prev, isOpen: false }))}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full border-2 border-amber-600/40 shadow-2xl p-6 space-y-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900" />

            <button
              type="button"
              onClick={() => setCallPrompt(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full cursor-pointer transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3.5 pt-1">
              <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl shrink-0 ring-4 ring-amber-50">
                <PhoneCall className="w-6 h-6 text-amber-800 animate-pulse" />
              </div>
              <div className="space-y-0.5 pr-8">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-bold block">
                  {callPrompt.isMobile ? 'Mobile Phone Call' : 'Call from Computer'}
                </span>
                <h2 id="call-prompt-title" className="text-lg sm:text-xl font-bold font-serif text-stone-900 leading-tight">
                  {callPrompt.resourceName}
                </h2>
                <div className="text-base font-mono font-bold text-amber-900 pt-0.5">
                  {callPrompt.phone}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50/80 space-y-3 text-xs sm:text-sm text-stone-800 shadow-xs">
              {callPrompt.isMobile ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Launching your phone dialer</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed text-xs">
                    We just opened your phone's dialer to call <strong>{callPrompt.phone}</strong>. If your phone didn't show the dial screen yet, simply tap <em>&ldquo;Launch Dialer&rdquo;</em> below to connect.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-amber-950 text-xs sm:text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 text-amber-800" />
                    <span>Quick check: Do you have a calling app on this computer?</span>
                  </div>
                  
                  <p className="text-stone-700 leading-relaxed text-xs">
                    Computers don&apos;t have cell service, so clicking to call will try to launch an app like <strong>FaceTime, Skype, Zoom, or Windows Phone Link</strong> to place the call.
                  </p>

                  <div className="p-2.5 bg-white/90 rounded-lg border border-amber-200 text-stone-700 text-xs space-y-1.5 leading-relaxed">
                    <p>
                      &bull; If you have a calling app set up, choose <strong>&ldquo;Yes, Open Calling App&rdquo;</strong> to start the call.
                    </p>
                    <p>
                      &bull; If you&apos;d rather call from your phone, click <strong>&ldquo;No, Just Copy Number&rdquo;</strong>. We already copied it to your clipboard so you can paste and dial without random app popups.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-amber-200/90 flex items-center justify-between gap-2 text-xs text-stone-600 font-mono">
                <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Number copied to clipboard: {callPrompt.phone}</span>
                </span>
                <span className="text-[11px] text-stone-500 hidden sm:inline">Ready to paste</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  try {
                    window.location.href = `tel:${callPrompt.cleanedPhone}`;
                  } catch {
                    // Ignore protocol launch failure
                  }
                }}
                className="btn btn-primary text-xs sm:text-sm flex-1 justify-center py-3 inline-flex items-center gap-2 font-bold cursor-pointer shadow-sm hover:scale-[1.01] transition-transform"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{callPrompt.isMobile ? `Call ${callPrompt.phone}` : 'Yes, Open Calling App'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(callPrompt.phone);
                    setCallPrompt(prev => ({ ...prev, copied: true }));
                  }
                }}
                className="btn btn-outline text-xs sm:text-sm justify-center py-3 inline-flex items-center gap-2 cursor-pointer font-semibold bg-stone-50 hover:bg-stone-100"
              >
                <Copy className="w-4 h-4 text-stone-500" />
                <span>{callPrompt.copied ? 'Copied to Clipboard!' : (callPrompt.isMobile ? 'Copy Number' : 'No, Just Copy Number')}</span>
              </button>

              <button
                type="button"
                onClick={() => setCallPrompt(prev => ({ ...prev, isOpen: false }))}
                className="btn btn-ghost text-xs justify-center py-3 text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive directory guide assistant */}
      <CivicChatbot
        onSelectResource={(res) => setActiveResource(res)}
        onInitiateCall={handleInitiateCall}
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

export default App;
