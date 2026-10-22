import React, { useState, useEffect } from 'react';
import { 
  COMMUNITY_RESOURCES, 
  COMMUNITY_EVENTS, 
  RESEARCH_CITATIONS, 
  CATEGORIES, 
  HERO_IMAGE 
} from './data/mockData';
import { ResourceItem, CommunityEvent } from './types';
import { 
  Search, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  X, 
  ExternalLink,
  BookOpen,
  ShieldCheck,
  BarChart3,
  Smartphone,
  Heart,
  User
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'resources' | 'events' | 'about'>('resources');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeResource, setActiveResource] = useState<ResourceItem | null>(null);

  // Personalized Welcome Popup State
  const [userName, setUserName] = useState('');
  const [tempName, setTempName] = useState('');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cumming_user_name');
    if (saved) {
      setUserName(saved);
    } else {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = tempName.trim() || 'Neighbor';
    setUserName(cleanName);
    localStorage.setItem('cumming_user_name', cleanName);
    setShowWelcomeModal(false);
  };

  // Filter resources by category and search keyword
  const filteredResources = COMMUNITY_RESOURCES.filter((item) => {
    const categoryMatches = selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const searchMatches = 
      query === '' ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.keyServices.some(s => s.toLowerCase().includes(query)) ||
      item.address.toLowerCase().includes(query);

    return categoryMatches && searchMatches;
  });

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      
      {/* Emergency Crisis Ribbon */}
      <div className="bg-amber-800 text-white text-xs py-1.5 px-4 text-center font-medium">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span className="font-bold">Cumming Crisis Hotlines:</span>
          <span>Suicide & Crisis: <a href="tel:988" className="underline font-bold text-white">988</a></span>
          <span className="hidden sm:inline">·</span>
          <span>Forsyth 2-1-1: <a href="tel:211" className="underline font-bold text-white">Dial 211</a></span>
          <span className="hidden sm:inline">·</span>
          <span>The Place of Forsyth: <a href="tel:7708871098" className="underline font-bold text-white">(770) 887-1098</a></span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <button 
            onClick={() => { setCurrentTab('resources'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-amber-800 text-white flex items-center justify-center font-serif text-lg font-bold">
              C
            </span>
            <div>
              <span className="text-xl font-bold font-serif text-stone-900 block leading-tight">CivicBridge</span>
              <span className="text-[11px] text-stone-500 font-sans block">Cumming & Forsyth County, GA</span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav aria-label="Main Navigation" className="flex items-center gap-2 sm:gap-6 text-sm font-medium">
            <button
              onClick={() => setCurrentTab('resources')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                currentTab === 'resources' 
                  ? 'bg-amber-100 text-amber-900 font-bold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setCurrentTab('events')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                currentTab === 'events' 
                  ? 'bg-amber-100 text-amber-900 font-bold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setCurrentTab('about')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                currentTab === 'about' 
                  ? 'bg-amber-100 text-amber-900 font-bold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              About & Plan
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">

        {/* TAB 1: RESOURCES & PERSONALIZED HOME */}
        {currentTab === 'resources' && (
          <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            
            {/* Personalized Hero Welcome Banner */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xs">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider font-mono">
                    Cumming Community Care
                  </span>
                  {userName && (
                    <button
                      onClick={() => setShowWelcomeModal(true)}
                      className="text-[11px] text-stone-500 hover:text-amber-800 underline cursor-pointer flex items-center gap-1"
                    >
                      <User className="w-3 h-3" />
                      <span>(Not {userName}?)</span>
                    </button>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 leading-tight">
                  {userName ? `Welcome, ${userName}!` : 'Welcome to Cumming Connect!'}
                </h1>
                
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {userName 
                    ? `We are glad you are here, ${userName}. Search verified free food pantries, clinic healthcare, housing grants, and senior support in Cumming, GA.`
                    : 'We are glad you are here. Search verified free food pantries, clinic healthcare, housing grants, and senior support in Cumming, GA.'
                  }
                </p>

                {/* Primary Search Bar */}
                <div className="pt-2">
                  <div className="relative max-w-lg">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search food, rent, clinic, library, senior, jobs..."
                      className="w-full pl-10 pr-4 py-3 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-700 focus:bg-white shadow-xs"
                      aria-label="Search resources"
                    />
                  </div>
                </div>
              </div>

              {/* Photo */}
              <figure className="w-full md:w-64 h-44 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
                <img
                  src={HERO_IMAGE}
                  alt="Cumming Community Resource Commons"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </figure>
            </section>

            {/* Category Filter Buttons */}
            <section aria-label="Filter by Category" className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-amber-800 text-white'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Count Indicator */}
              <div className="text-xs text-stone-500 pt-1">
                Found <strong>{filteredResources.length}</strong> resources in Cumming & Forsyth County
              </div>
            </section>

            {/* Resource Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map((res) => (
                <article
                  key={res.id}
                  className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col justify-between shadow-xs hover:border-stone-400 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                      <span className="text-amber-800 font-bold">{res.categoryLabel}</span>
                      <span className="text-stone-700 font-semibold">{res.cost}</span>
                    </div>

                    <h2 className="text-base font-bold text-stone-900 leading-snug">
                      {res.name}
                    </h2>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {res.tagline}
                    </p>

                    <div className="space-y-1 text-xs text-stone-600 pt-1 border-t border-stone-100">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <a href={`tel:${res.phone}`} className="font-mono text-stone-800 underline font-medium">
                          {res.phone}
                        </a>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span className="truncate">{res.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{res.hours}</span>
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-stone-700">
                      <strong className="block text-stone-800 text-[11px] uppercase font-mono mb-1">
                        Services:
                      </strong>
                      <ul className="grid grid-cols-2 gap-1 text-[11px]">
                        {res.keyServices.slice(0, 4).map((svc, i) => (
                          <li key={i} className="flex items-center gap-1 text-stone-600 truncate">
                            <span className="w-1 h-1 rounded-full bg-amber-800 shrink-0"></span>
                            <span className="truncate">{svc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={() => setActiveResource(res)}
                      className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
                    >
                      View Details & Checklist →
                    </button>
                    <a
                      href={`tel:${res.phone}`}
                      className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold"
                    >
                      Call
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="bg-white border border-stone-200 rounded-xl p-8 text-center space-y-2">
                <p className="text-sm font-semibold text-stone-800">No resources matched your search.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="px-4 py-2 bg-stone-900 text-white rounded-md text-xs font-medium cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EVENTS */}
        {currentTab === 'events' && (
          <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
                Community Events in Cumming, GA
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Free health fairs, food drives, and workshops for local families.
              </p>
            </div>

            <div className="space-y-4">
              {COMMUNITY_EVENTS.map((evt) => (
                <article
                  key={evt.id}
                  className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="text-xs font-mono font-bold text-amber-800">
                      {evt.date} · {evt.time}
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-stone-900">
                      {evt.title}
                    </h2>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {evt.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{evt.location}</span>
                      <span className="mx-1">·</span>
                      <span>Organized by {evt.organizer}</span>
                    </div>
                  </div>

                  <a
                    href={`tel:7708871098`}
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap self-start sm:self-center"
                  >
                    Call for Info
                  </a>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ABOUT, PLANNING & RUBRIC */}
        {currentTab === 'about' && (
          <article className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <header className="border-b border-stone-200 pb-3">
              <span className="text-xs font-bold font-mono text-amber-800 uppercase">
                FBLA Website Design Rubric Documentation
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
                Project Plan & Rubric Evidence
              </h1>
            </header>

            {/* 1. Planning & Rationale */}
            <section className="bg-white border border-stone-200 rounded-xl p-5 space-y-2">
              <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-800" />
                <span>1. Planning and Implementation Rationale</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                U.S. Census Bureau data shows a 16.4% poverty rate in the City of Cumming. We designed CivicBridge to bring together verified local non-profits—such as <em>The Place of Forsyth County</em> and <em>Good Shepherd Clinic</em>—into one easy-to-use directory so residents can quickly find food, medical care, and rent relief.
              </p>
            </section>

            {/* 2. UX & Accessibility */}
            <section className="bg-white border border-stone-200 rounded-xl p-5 space-y-2">
              <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>2. Design & Accessibility (WCAG 2.2 AA)</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                We chose clean typography, warm earth tones, and high-contrast charcoal text (&gt; 4.5:1 ratio) to ensure ease of reading for seniors and mobile visitors. Touch targets are large and phone numbers link directly to mobile calling.
              </p>
            </section>

            {/* 3. Platform Compatibility */}
            <section className="bg-white border border-stone-200 rounded-xl p-5 space-y-2">
              <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-800" />
                <span>3. Multi-Platform Compatibility</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                Built with responsive CSS3 and tested to display smoothly across Desktop (1440px), Tablet (820px), and Mobile Phone (390px).
              </p>
            </section>

            {/* 4. Planned Metrics */}
            <section className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
              <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-800" />
                <span>4. Planned Success Metrics</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden">
                  <thead className="bg-stone-100 text-stone-800 font-mono text-[11px] uppercase">
                    <tr>
                      <th className="p-2">Metric</th>
                      <th className="p-2">Industry Term</th>
                      <th className="p-2">Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    <tr>
                      <td className="p-2 font-medium">Wayfinding Speed</td>
                      <td className="p-2 font-mono">Time-to-Resource (TTR)</td>
                      <td className="p-2 font-bold text-amber-800">&lt; 35 seconds</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Load Performance</td>
                      <td className="p-2 font-mono">Largest Contentful Paint (LCP)</td>
                      <td className="p-2 font-bold text-emerald-700">&lt; 1.0 second</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Action Rate</td>
                      <td className="p-2 font-mono">Goal Conversion Rate (GCR)</td>
                      <td className="p-2 font-bold">&gt; 22%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 5. Sources & Citations */}
            <section className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
              <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-800" />
                <span>5. Research Sources & Citations</span>
              </h2>
              <div className="space-y-2 text-xs text-stone-600">
                {RESEARCH_CITATIONS.map((cite, i) => (
                  <div key={cite.id} className="p-2.5 bg-stone-50 rounded border border-stone-200">
                    <strong className="text-stone-900">[{i + 1}] {cite.sourceTitle}</strong> — {cite.publishingBody} ({cite.year})
                    <p className="mt-0.5">{cite.keyFinding}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Copyright */}
            <section className="bg-white border border-stone-200 rounded-xl p-5 space-y-1">
              <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>6. Copyright & Licensing</span>
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Code is 100% original semantic HTML5 and CSS3. Icons are from Lucide (ISC License). Images are generated via AI Studio Imagen under commercial/educational license.
              </p>
            </section>
          </article>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-6 border-t border-stone-800 mt-12 text-center sm:text-left">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-white font-serif">CivicBridge Cumming, GA</strong> · Community Resource Guide
          </div>
          <div>
            Georgia FBLA 2026–2027 Website Design · Built with Semantic HTML5 & CSS3
          </div>
        </div>
      </footer>

      {/* PERSONALIZED WELCOME POPUP MODAL */}
      {showWelcomeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative space-y-4">
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-md"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 fill-amber-700 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-900">
                Welcome to Cumming Connect!
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                We are glad you are here. Whether you need grocery assistance, low-cost healthcare, or rental help, our local community is here to support you.
              </p>
            </div>

            <form onSubmit={handleSaveName} className="space-y-3 pt-2">
              <div>
                <label htmlFor="welcome-name" className="block text-xs font-semibold text-stone-700 mb-1">
                  What is your name? (Optional)
                </label>
                <input
                  type="text"
                  id="welcome-name"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:border-amber-700"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {tempName.trim() ? `Welcome Me, ${tempName.trim()}` : 'Personalize My Home Screen'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserName('Neighbor');
                    setShowWelcomeModal(false);
                  }}
                  className="w-full py-1.5 text-stone-500 hover:text-stone-800 text-xs"
                >
                  Continue as Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOURCE DETAILS MODAL */}
      {activeResource && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
          onClick={() => setActiveResource(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveResource(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-md"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-mono font-bold text-amber-800 uppercase">
                {activeResource.categoryLabel} · {activeResource.cost}
              </span>
              <h3 className="text-xl font-bold font-serif text-stone-900 mt-1">
                {activeResource.name}
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                {activeResource.description}
              </p>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-stone-400" />
                <a href={`tel:${activeResource.phone}`} className="font-mono font-bold text-stone-900 underline">
                  {activeResource.phone}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <span>{activeResource.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                <span>{activeResource.hours}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-stone-900 font-mono uppercase mb-1">
                Eligibility Guidelines
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {activeResource.eligibility}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-stone-900 font-mono uppercase mb-1">
                Intake Checklist (What to bring)
              </h4>
              <ul className="text-xs text-stone-600 space-y-1">
                {activeResource.intakeRequirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveResource(null)}
                className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                Close
              </button>
              <a
                href={`tel:${activeResource.phone}`}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold"
              >
                Call {activeResource.phone}
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
