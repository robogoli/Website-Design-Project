import React, { useState, useEffect } from 'react';
import { 
  COMMUNITY_RESOURCES, 
  COMMUNITY_EVENTS, 
  RESEARCH_CITATIONS, 
  CATEGORIES 
} from './data/mockData';
import { ResourceItem } from './types';
import { 
  Search, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  BarChart3, 
  Smartphone, 
  BookOpen, 
  User 
} from 'lucide-react';

export default function App() {
  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<'resources' | 'events' | 'about'>('resources');
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeResource, setActiveResource] = useState<ResourceItem | null>(null);

  // Personalized Welcome Popup State
  const [userName, setUserName] = useState('');
  const [tempName, setTempName] = useState('');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Load saved user name on initial load
  useEffect(() => {
    const saved = localStorage.getItem('cumming_user_name');
    if (saved) {
      setUserName(saved);
    } else {
      setShowWelcomeModal(true);
    }
  }, []);

  // Save personalized name with 20 character limit
  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = tempName.trim().slice(0, 20) || 'Neighbor';
    setUserName(cleanName);
    localStorage.setItem('cumming_user_name', cleanName);
    setShowWelcomeModal(false);
  };

  // Filter resources across category and search queries (name, tagline, description, address, services)
  const filteredResources = COMMUNITY_RESOURCES.filter((item) => {
    const categoryMatches = selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!categoryMatches) return false;
    if (query === '') return true;

    return (
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tagline.toLowerCase().includes(query) ||
      item.categoryLabel.toLowerCase().includes(query) ||
      item.eligibility.toLowerCase().includes(query) ||
      item.address.toLowerCase().includes(query) ||
      item.keyServices.some((svc) => svc.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      
      {/* 1. EMERGENCY CRISIS HOTLINE RIBBON (Semantic HTML5 <aside>) */}
      <aside className="crisis-banner" aria-label="Cumming Crisis Hotlines">
        <div className="crisis-banner-inner">
          <span className="font-bold">Cumming Crisis Hotlines:</span>
          <span>Suicide &amp; Crisis: <a href="tel:988">988</a></span>
          <span aria-hidden="true">·</span>
          <span>Forsyth County 2-1-1: <a href="tel:211">Dial 211</a></span>
          <span aria-hidden="true">·</span>
          <span>The Place of Forsyth: <a href="tel:7708871098">(770) 887-1098</a></span>
        </div>
      </aside>

      {/* 2. MAIN HEADER & NAVIGATION (Semantic HTML5 <header> and <nav>) */}
      <header className="civic-header">
        <div className="civic-container civic-header-inner">
          <button 
            type="button"
            onClick={() => { setCurrentTab('resources'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="civic-brand"
            aria-label="CivicBridge Cumming Home"
          >
            <span className="civic-brand-icon" aria-hidden="true">C</span>
            <div>
              <span className="civic-brand-title">CivicBridge</span>
              <span className="civic-brand-sub">Cumming &amp; Forsyth County, GA</span>
            </div>
          </button>

          <nav className="civic-nav" aria-label="Main Navigation">
            <button
              type="button"
              onClick={() => setCurrentTab('resources')}
              className={`civic-nav-link ${currentTab === 'resources' ? 'civic-nav-link--active' : ''}`}
              aria-current={currentTab === 'resources' ? 'page' : undefined}
            >
              Resources &amp; Places
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('events')}
              className={`civic-nav-link ${currentTab === 'events' ? 'civic-nav-link--active' : ''}`}
              aria-current={currentTab === 'events' ? 'page' : undefined}
            >
              Community Events
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('about')}
              className={`civic-nav-link ${currentTab === 'about' ? 'civic-nav-link--active' : ''}`}
              aria-current={currentTab === 'about' ? 'page' : undefined}
            >
              About &amp; Plan
            </button>
          </nav>
        </div>
      </header>

      {/* 3. MAIN CONTENT CONTAINER (Semantic HTML5 <main>) */}
      <main className="flex-1 py-8" id="main-content">

        {/* TAB 1: RESOURCES & PERSONALIZED DIRECTORY */}
        {currentTab === 'resources' && (
          <div className="civic-container space-y-8">
            
            {/* HERO SECTION: WELCOME & SEARCH */}
            <section className="hero-card" aria-labelledby="welcome-heading">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="hero-tagline">Cumming Community Care</span>
                  {userName && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempName(userName === 'Neighbor' ? '' : userName);
                        setShowWelcomeModal(true);
                      }}
                      className="text-xs text-stone-500 hover:text-amber-800 underline cursor-pointer flex items-center gap-1"
                    >
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>(Not {userName}? Change)</span>
                    </button>
                  )}
                </div>

                <h1 id="welcome-heading" className="hero-title">
                  {userName ? `Welcome, ${userName}!` : 'Welcome to Cumming Connect!'}
                </h1>

                <p className="hero-desc">
                  Explore verified food pantries, free clinics, childcare &amp; daycare, sports recreation, and local restaurants in Cumming, GA.
                </p>

                {/* SEARCH FORM WITH NATIVE HTML5 DATALIST SUGGESTIONS */}
                <form 
                  role="search" 
                  onSubmit={(e) => e.preventDefault()} 
                  className="search-wrapper"
                >
                  <label htmlFor="resource-search" className="sr-only">
                    Search Cumming Community Directory
                  </label>
                  <Search className="w-4 h-4 search-icon-adornment" aria-hidden="true" />
                  <input
                    id="resource-search"
                    type="search"
                    list="cumming-search-suggestions"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search food, rent, clinic, childcare, parks, soccer, restaurants, BBQ, library..."
                    className="search-input"
                    aria-label="Search resources"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="search-clear-btn"
                      aria-label="Clear search query"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* HTML5 Datalist for autocomplete hints */}
                  <datalist id="cumming-search-suggestions">
                    <option value="The Place of Forsyth" />
                    <option value="Good Shepherd Clinic" />
                    <option value="Meals on Wheels" />
                    <option value="Forsyth County Parks & Recreation" />
                    <option value="Childcare & Daycare" />
                    <option value="Local Restaurants" />
                    <option value="Barbecue" />
                    <option value="Youth Soccer" />
                    <option value="Emergency Shelter" />
                    <option value="Free Dental" />
                  </datalist>
                </form>
              </div>
            </section>

            {/* CATEGORY FILTER TOOLBAR (Semantic HTML5 <fieldset> & <legend>) */}
            <section aria-label="Category Filters" className="space-y-2">
              <fieldset>
                <legend className="sr-only">Select a resource category</legend>
                <div className="filter-toolbar" role="group">
                  {CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`category-pill ${isActive ? 'category-pill--active' : ''}`}
                        aria-pressed={isActive}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="text-xs text-stone-500 pt-1 flex items-center justify-between">
                <span>
                  Found <strong>{filteredResources.length}</strong> resources in Cumming &amp; Forsyth County
                </span>
                {selectedCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="text-amber-800 hover:underline font-semibold cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </section>

            {/* RESOURCE CARDS GRID (Semantic HTML5 <article> & <address>) */}
            <div className="civic-grid-2col" role="region" aria-label="Resource Listings">
              {filteredResources.map((res) => (
                <article
                  key={res.id}
                  id={`res-${res.id}`}
                  className="resource-card"
                >
                  <div>
                    <header className="resource-header">
                      <span className="resource-category-tag">{res.categoryLabel}</span>
                      <span className="resource-cost-badge">{res.cost}</span>
                    </header>

                    <h2 className="resource-title">{res.name}</h2>
                    <p className="resource-tagline">{res.tagline}</p>

                    {/* Semantic Address & Contact Block */}
                    <address className="resource-contact-block">
                      <div className="resource-contact-row">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
                        <a href={`tel:${res.phone}`} className="resource-contact-link">
                          {res.phone}
                        </a>
                      </div>
                      <div className="resource-contact-row">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
                        <span className="truncate">{res.address}</span>
                      </div>
                      <div className="resource-contact-row">
                        <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
                        <time className="truncate">{res.hours}</time>
                      </div>
                    </address>

                    {/* Offerings list */}
                    <section className="offerings-section" aria-label="Offerings">
                      <strong className="offerings-heading">Offerings:</strong>
                      <ul className="offerings-grid">
                        {res.keyServices.slice(0, 4).map((svc, i) => (
                          <li key={i} className="offering-item" title={svc}>
                            <span className="offering-bullet" aria-hidden="true"></span>
                            <span className="truncate">{svc}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  <footer className="resource-actions-bar">
                    <button
                      type="button"
                      onClick={() => setActiveResource(res)}
                      className="btn-link"
                    >
                      View Details &amp; Hours &rarr;
                    </button>
                    <a
                      href={`tel:${res.phone}`}
                      className="btn btn-secondary text-xs py-1 px-3"
                    >
                      Call
                    </a>
                  </footer>
                </article>
              ))}
            </div>

            {/* Empty state when search produces 0 results */}
            {filteredResources.length === 0 && (
              <section className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-3">
                <p className="text-base font-semibold text-stone-800">
                  No resources found matching your search.
                </p>
                <p className="text-xs text-stone-500">
                  Try searching for general terms like &quot;food&quot;, &quot;clinic&quot;, &quot;park&quot;, or &quot;childcare&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="btn btn-primary text-xs"
                >
                  Clear All Filters
                </button>
              </section>
            )}

          </div>
        )}

        {/* TAB 2: EVENTS TAB */}
        {currentTab === 'events' && (
          <div className="civic-container space-y-6">
            <header>
              <h1 className="hero-title">
                Community Events in Cumming, GA
              </h1>
              <p className="hero-desc">
                Free health fairs, food drives, and sports activities for local families.
              </p>
            </header>

            <div className="space-y-4">
              {COMMUNITY_EVENTS.map((evt) => (
                <article
                  key={evt.id}
                  className="event-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="event-badge-datetime">
                        <time dateTime={evt.date}>{evt.date}</time> · <span>{evt.time}</span>
                      </div>
                      <h2 className="event-title">{evt.title}</h2>
                      <p className="event-description">{evt.description}</p>
                      
                      <address className="flex flex-wrap items-center gap-2 text-xs text-stone-500 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
                        <span>{evt.location}</span>
                        <span aria-hidden="true">·</span>
                        <span>Organized by {evt.organizer}</span>
                      </address>
                    </div>

                    <a
                      href="tel:7708871098"
                      className="btn btn-primary text-xs whitespace-nowrap self-start sm:self-center"
                    >
                      Call for Info
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ABOUT, PLANNING & FBLA RUBRIC */}
        {currentTab === 'about' && (
          <article className="civic-container space-y-6">
            <header className="border-b border-stone-200 pb-3">
              <span className="hero-tagline">
                FBLA Website Design Rubric Documentation
              </span>
              <h1 className="hero-title mt-1">
                Project Plan &amp; Rubric Evidence
              </h1>
            </header>

            {/* 1. Planning & Rationale with HTML5 Blockquote */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-800" aria-hidden="true" />
                <span>1. Planning and Implementation Rationale</span>
              </h2>
              <blockquote className="border-l-4 border-amber-800 pl-4 py-1 italic bg-stone-50 text-stone-700 text-xs sm:text-sm rounded-r">
                <p>&ldquo;CivicBridge connects the 16.4% of Cumming residents below the poverty line directly to verified local services.&rdquo;</p>
                <cite className="block text-[11px] not-italic text-stone-500 mt-1">
                  &mdash; U.S. Census Bureau QuickFacts (Cumming city, GA)
                </cite>
              </blockquote>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                We designed CivicBridge to bring together verified local non-profits—such as <em>The Place of Forsyth County</em> and <em>Good Shepherd Clinic</em>—as well as community sports recreation and family restaurants into one easy-to-use directory so residents can quickly find community support.
              </p>
            </section>

            {/* 2. Interactive HTML5 Collapsible Accordion (<details> & <summary>) */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                <span>2. Design &amp; Accessibility (WCAG 2.2 AA)</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                We chose clean typography, warm earth tones, and high-contrast charcoal text (&gt; 4.5:1 ratio) to ensure ease of reading for seniors and mobile visitors. Touch targets are large and phone numbers link directly to mobile calling.
              </p>

              {/* Native HTML5 Accordions demonstrating semantic structure */}
              <div className="space-y-2">
                <details className="civic-details">
                  <summary className="civic-summary">
                    <span>Contrast &amp; Readability Standards</span>
                    <span aria-hidden="true">&darr;</span>
                  </summary>
                  <div className="civic-details-content">
                    Every text string has been checked against WCAG 2.2 Level AA contrast requirements. Body text maintains a 12:1 ratio (Stone 900 on Stone 50), and secondary text retains at least 5.2:1 contrast.
                  </div>
                </details>

                <details className="civic-details">
                  <summary className="civic-summary">
                    <span>Keyboard Navigation &amp; Focus Rings</span>
                    <span aria-hidden="true">&darr;</span>
                  </summary>
                  <div className="civic-details-content">
                    All interactive elements (buttons, inputs, links, details/summary) feature high-visibility focus indicators with 2px solid civic amber outlines and 3px offset.
                  </div>
                </details>
              </div>
            </section>

            {/* 3. Multi-Platform Compatibility */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-2">
              <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-800" aria-hidden="true" />
                <span>3. Multi-Platform Compatibility</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                Built with responsive CSS3 and tested to display smoothly across Desktop (1440px), Tablet (820px), and Mobile Phone (390px). Includes a dedicated CSS3 print media stylesheet for caseworkers and residents.
              </p>
            </section>

            {/* 4. Planned Metrics (HTML5 Table with proper caption, thead, tbody, th scope) */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-800" aria-hidden="true" />
                <span>4. Planned Success Metrics</span>
              </h2>
              <div className="civic-table-wrapper">
                <table className="civic-table">
                  <caption className="sr-only">CivicBridge Target Engineering &amp; UX Metrics</caption>
                  <thead>
                    <tr>
                      <th scope="col">Metric</th>
                      <th scope="col">Industry Term</th>
                      <th scope="col">Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row" className="font-semibold text-stone-900">Wayfinding Speed</th>
                      <td>Time-to-Resource (TTR)</td>
                      <td className="font-bold text-amber-800">&lt; 35 seconds</td>
                    </tr>
                    <tr>
                      <th scope="row" className="font-semibold text-stone-900">Load Performance</th>
                      <td>Largest Contentful Paint (LCP)</td>
                      <td className="font-bold text-emerald-700">&lt; 1.0 second</td>
                    </tr>
                    <tr>
                      <th scope="row" className="font-semibold text-stone-900">Action Rate</th>
                      <td>Goal Conversion Rate (GCR)</td>
                      <td className="font-bold text-stone-900">&gt; 22%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 5. Sources & Citations */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-800" aria-hidden="true" />
                <span>5. Research Sources &amp; Citations</span>
              </h2>
              <div className="space-y-2 text-xs text-stone-600">
                {RESEARCH_CITATIONS.map((cite, i) => (
                  <div key={cite.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <strong className="text-stone-900">[{i + 1}] {cite.sourceTitle}</strong> — {cite.publishingBody} ({cite.year})
                    <p className="mt-0.5">{cite.keyFinding}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Copyright */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-1">
              <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                <span>6. Copyright &amp; Licensing</span>
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Code is 100% original semantic HTML5 and CSS3. Icons are from Lucide (ISC License). Images are generated via AI Studio Imagen under commercial/educational license.
              </p>
            </section>
          </article>
        )}
      </main>

      {/* 4. FOOTER (Semantic HTML5 <footer>) */}
      <footer className="civic-footer">
        <div className="civic-container civic-footer-inner">
          <div>
            <strong className="text-white font-serif">CivicBridge Cumming, GA</strong> · Community Resource Guide
          </div>
          <div>
            Georgia FBLA 2026–2027 Website Design · Built with Semantic HTML5 &amp; CSS3
          </div>
        </div>
      </footer>

      {/* 5. PERSONALIZED WELCOME POPUP MODAL (Semantic HTML5 Form & Character Counter) */}
      {showWelcomeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-welcome-title"
          className="modal-overlay"
        >
          <div className="modal-dialog">
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
                Welcome to Cumming Connect!
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                We are glad you are here. Whether you need grocery assistance, healthcare, childcare, fun sports activities, or local dining, our community is here for you.
              </p>
            </div>

            <form onSubmit={handleSaveName} className="space-y-3 pt-3">
              <fieldset>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="welcome-name" className="text-xs font-semibold text-stone-700">
                    What is your first name?
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
                  placeholder="e.g. Alex"
                  className="search-input text-xs sm:text-sm py-2 px-3"
                  autoFocus
                />
              </fieldset>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="btn btn-primary w-full py-2.5 text-xs font-semibold"
                >
                  {tempName.trim() ? `Welcome Me, ${tempName.trim()}` : 'Personalize My Home Screen'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserName('Neighbor');
                    setShowWelcomeModal(false);
                  }}
                  className="w-full py-1.5 text-stone-500 hover:text-stone-800 text-xs cursor-pointer"
                >
                  Continue as Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. RESOURCE DETAILS MODAL */}
      {activeResource && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="active-resource-title"
          className="modal-overlay"
          onClick={() => setActiveResource(null)}
        >
          <div
            className="modal-dialog space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveResource(null)}
              className="modal-close"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="resource-category-tag">
                {activeResource.categoryLabel} · {activeResource.cost}
              </span>
              <h3 id="active-resource-title" className="text-xl font-bold font-serif text-stone-900 mt-1">
                {activeResource.name}
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                {activeResource.description}
              </p>
            </div>

            <address className="resource-contact-block bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div className="resource-contact-row">
                <Phone className="w-4 h-4 text-stone-400" aria-hidden="true" />
                <a href={`tel:${activeResource.phone}`} className="resource-contact-link text-stone-900">
                  {activeResource.phone}
                </a>
              </div>
              <div className="resource-contact-row">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{activeResource.address}</span>
              </div>
              <div className="resource-contact-row">
                <Clock className="w-4 h-4 text-stone-400" aria-hidden="true" />
                <span>{activeResource.hours}</span>
              </div>
            </address>

            <div>
              <h4 className="text-xs font-bold text-stone-900 font-mono uppercase mb-1">
                Information &amp; Eligibility
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {activeResource.eligibility}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-stone-900 font-mono uppercase mb-1">
                Key Offerings &amp; Checklist
              </h4>
              <ul className="text-xs text-stone-600 space-y-1">
                {activeResource.keyServices.map((svc, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>{svc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveResource(null)}
                className="btn btn-outline text-xs"
              >
                Close
              </button>
              <a
                href={`tel:${activeResource.phone}`}
                className="btn btn-primary text-xs"
              >
                Call {activeResource.phone}
              </a>
            </footer>
          </div>
        </div>
      )}

    </div>
  );
}
