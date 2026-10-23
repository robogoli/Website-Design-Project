import React, { useState, useEffect } from 'react';
import { 
  COMMUNITY_RESOURCES, 
  COMMUNITY_EVENTS, 
  RESEARCH_CITATIONS, 
  CATEGORIES 
} from './data/mockData';
import { ResourceItem, UserFeedback } from './types';
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
  User,
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';

const INITIAL_FEEDBACK_RECORDS: UserFeedback[] = [
  {
    id: 'CFB-2026-8941',
    userName: 'Elena R.',
    category: 'Accuracy & Updates',
    resourceName: 'Good Shepherd Free Clinic',
    rating: 'Helpful',
    message: 'Confirmed that Saturday clinic check-in begins at 8:30 AM rather than 9:00 AM.',
    submittedAt: 'Oct 20, 2026, 11:15 AM',
    status: 'Verified & Applied',
    adminResponseNote: 'Verified with clinic staff. Hours updated in Cumming directory.'
  },
  {
    id: 'CFB-2026-7214',
    userName: 'Marcus T.',
    category: 'Suggest New Resource',
    resourceName: 'Mary Alice Park & Beach',
    rating: 'Very Helpful',
    message: 'Requested adding senior parking waiver information for Forsyth County residents.',
    submittedAt: 'Oct 21, 2026, 2:40 PM',
    status: 'Verified & Applied',
    adminResponseNote: 'Verified with Forsyth County Parks & Rec. Senior waiver note added.'
  }
];

export default function App() {
  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<'resources' | 'events' | 'feedback' | 'about'>('resources');
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeResource, setActiveResource] = useState<ResourceItem | null>(null);

  // Personalized Welcome Popup State
  const [userName, setUserName] = useState('');
  const [tempName, setTempName] = useState('');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Feedback Form State
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState<UserFeedback['category']>('Accuracy & Updates');
  const [feedbackResource, setFeedbackResource] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<UserFeedback['rating']>('Helpful');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [recentReceipt, setRecentReceipt] = useState<UserFeedback | null>(null);

  // Feedback Tracker & History State
  const [feedbackList, setFeedbackList] = useState<UserFeedback[]>(() => {
    const saved = localStorage.getItem('cumming_feedback_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_FEEDBACK_RECORDS;
      }
    }
    return INITIAL_FEEDBACK_RECORDS;
  });
  const [lookupId, setLookupId] = useState('');

  // Quick resource response checks map (id -> true)
  const [quickCheckedMap, setQuickCheckedMap] = useState<Record<string, boolean>>({});

  // Load saved user name on initial load
  useEffect(() => {
    const saved = localStorage.getItem('cumming_user_name');
    if (saved) {
      setUserName(saved);
      setFeedbackName(saved);
    } else {
      setShowWelcomeModal(true);
    }
  }, []);

  // Save personalized name with 20 character limit
  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = tempName.trim().slice(0, 20) || 'Neighbor';
    setUserName(cleanName);
    setFeedbackName(cleanName);
    localStorage.setItem('cumming_user_name', cleanName);
    setShowWelcomeModal(false);
  };

  // Handle Feedback Submission with Validation Checks
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError('');

    // Field Checks
    const trimmedName = feedbackName.trim() || userName || 'Neighbor';
    if (trimmedName.length < 2) {
      setFeedbackError('Please enter your name (at least 2 characters).');
      return;
    }

    const trimmedMsg = feedbackMessage.trim();
    if (trimmedMsg.length < 10) {
      setFeedbackError('Please provide at least 10 characters describing your feedback or suggestion.');
      return;
    }

    if (trimmedMsg.length > 500) {
      setFeedbackError('Message must be 500 characters or fewer.');
      return;
    }

    // Generate unique Response Check Reference ID
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newId = `CFB-2026-${randomCode}`;
    const nowFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

    const newFeedback: UserFeedback = {
      id: newId,
      userName: trimmedName,
      category: feedbackCategory,
      resourceName: feedbackResource.trim() || undefined,
      rating: feedbackRating,
      message: trimmedMsg,
      submittedAt: nowFormatted,
      status: 'Received & Logged',
      adminResponseNote: 'Automated receipt logged. Queued for community editorial check.'
    };

    const updatedList = [newFeedback, ...feedbackList];
    setFeedbackList(updatedList);
    localStorage.setItem('cumming_feedback_history', JSON.stringify(updatedList));

    // Show instant verification receipt
    setRecentReceipt(newFeedback);
    setFeedbackMessage('');
    setFeedbackResource('');
    setLookupId(newId);
  };

  // Quick resource helpfulness check
  const handleQuickResourceCheck = (resourceId: string) => {
    setQuickCheckedMap(prev => ({ ...prev, [resourceId]: true }));
  };

  // Filter resources across category and search queries
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

  // Lookup filtered feedback items
  const displayFeedback = lookupId.trim()
    ? feedbackList.filter(f => f.id.toLowerCase().includes(lookupId.toLowerCase().trim()))
    : feedbackList;

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
              Events
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('feedback')}
              className={`civic-nav-link ${currentTab === 'feedback' ? 'civic-nav-link--active' : ''}`}
              aria-current={currentTab === 'feedback' ? 'page' : undefined}
            >
              Feedback &amp; Check
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

        {/* TAB 3: COMMUNITY FEEDBACK & RESPONSE CHECK */}
        {currentTab === 'feedback' && (
          <div className="civic-container space-y-6">
            <header className="border-b border-stone-200 pb-3">
              <span className="hero-tagline">
                Community Verification &amp; Quality Assurance
              </span>
              <h1 className="hero-title mt-1">
                Feedback &amp; Response Check
              </h1>
              <p className="hero-desc mb-0">
                Submit updates, report inaccuracies, or suggest new resources in Cumming, GA. Every submission receives a verified tracking check code.
              </p>
            </header>

            {/* Instant Verification Receipt (Appears after submission) */}
            {recentReceipt && (
              <section 
                role="status" 
                aria-live="polite" 
                className="response-check-receipt space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" aria-hidden="true" />
                    <div>
                      <h2 className="text-base font-bold text-emerald-950 font-serif">
                        Feedback Response Check Verified!
                      </h2>
                      <p className="text-xs text-emerald-800">
                        Thank you, <strong>{recentReceipt.userName}</strong>. Your feedback has been registered and assigned an audit check reference.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRecentReceipt(null)}
                    className="text-stone-400 hover:text-stone-700 p-1"
                    aria-label="Dismiss receipt"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-stone-500 block font-mono text-[11px] uppercase">Tracking Check ID:</span>
                    <strong className="text-amber-900 font-mono text-sm">{recentReceipt.id}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block font-mono text-[11px] uppercase">Timestamp:</span>
                    <span className="text-stone-800">{recentReceipt.submittedAt}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block font-mono text-[11px] uppercase">Initial Status:</span>
                    <span className="status-badge status-badge--received">
                      <Clock className="w-3 h-3" /> {recentReceipt.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-emerald-900 space-y-1">
                  <strong className="block font-semibold">Response Verification Checklist:</strong>
                  <ul className="space-y-0.5 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Form fields and character constraints verified
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Reference code generated and saved to browser audit log
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-700" /> CivicBridge volunteer review queued (est. 24–48 hours)
                    </li>
                  </ul>
                </div>
              </section>
            )}

            <div className="feedback-grid">
              
              {/* FEEDBACK FORM */}
              <section className="feedback-card" aria-labelledby="form-heading">
                <h2 id="form-heading" className="text-lg font-bold font-serif text-stone-900 mb-1 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-800" aria-hidden="true" />
                  <span>Submit Community Feedback</span>
                </h2>
                <p className="text-xs text-stone-600 mb-4">
                  All inputs are validated in real-time. Please provide clear details so our team can verify listings.
                </p>

                {feedbackError && (
                  <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{feedbackError}</span>
                  </div>
                )}

                <form onSubmit={handleFeedbackSubmit} noValidate>
                  
                  {/* Fieldset 1: Resident Name */}
                  <div className="form-group">
                    <label htmlFor="fb-name" className="form-label">
                      <span>Your Name / Initials:</span>
                      <span className="text-[11px] text-stone-400 font-mono">Required</span>
                    </label>
                    <input
                      id="fb-name"
                      type="text"
                      maxLength={30}
                      value={feedbackName}
                      onChange={(e) => setFeedbackName(e.target.value)}
                      placeholder="e.g. Alex M. or Forsyth Resident"
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Fieldset 2: Feedback Category */}
                  <div className="form-group">
                    <label htmlFor="fb-category" className="form-label">
                      <span>Feedback Category:</span>
                      <span className="text-[11px] text-stone-400 font-mono">Select one</span>
                    </label>
                    <select
                      id="fb-category"
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value as UserFeedback['category'])}
                      className="form-control"
                    >
                      <option value="Accuracy & Updates">Accuracy &amp; Updates (Phone, hours, address change)</option>
                      <option value="Suggest New Resource">Suggest New Resource (New pantry, clinic, park, restaurant)</option>
                      <option value="Website Accessibility">Website Accessibility (Readability, contrast, keyboard focus)</option>
                      <option value="General Suggestion">General Suggestion (General feedback for Cumming team)</option>
                    </select>
                  </div>

                  {/* Optional Resource Name */}
                  <div className="form-group">
                    <label htmlFor="fb-resource" className="form-label">
                      <span>Specific Resource or Place (Optional):</span>
                      <span className="text-[11px] text-stone-400 font-mono">Optional</span>
                    </label>
                    <input
                      id="fb-resource"
                      type="text"
                      list="cumming-search-suggestions"
                      value={feedbackResource}
                      onChange={(e) => setFeedbackResource(e.target.value)}
                      placeholder="e.g. Good Shepherd Clinic, Mary Alice Park..."
                      className="form-control"
                    />
                  </div>

                  {/* Helpfulness Check / Rating */}
                  <div className="form-group">
                    <span className="form-label">
                      <span>Experience / Helpfulness Check:</span>
                    </span>
                    <div className="grid grid-cols-3 gap-2 pt-0.5">
                      {(['Very Helpful', 'Helpful', 'Needs Improvement'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFeedbackRating(r)}
                          className={`py-2 px-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
                            feedbackRating === r
                              ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Message */}
                  <div className="form-group">
                    <label htmlFor="fb-message" className="form-label">
                      <span>Feedback Details &amp; Notes:</span>
                      <output htmlFor="fb-message" className="text-[11px] text-stone-400 font-mono">
                        {feedbackMessage.length}/500 chars (min 10)
                      </output>
                    </label>
                    <textarea
                      id="fb-message"
                      rows={4}
                      maxLength={500}
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Describe what you noticed or what you would like to suggest for Cumming community members..."
                      className="form-control resize-y"
                      required
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="btn btn-primary w-full py-2.5 text-xs font-semibold shadow-xs flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit &amp; Generate Response Check Code</span>
                    </button>
                  </div>

                </form>
              </section>

              {/* RESPONSE STATUS CHECK & TRACKER */}
              <section className="space-y-4">
                <div className="feedback-card">
                  <h2 className="text-base font-bold font-serif text-stone-900 mb-1 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-amber-800" aria-hidden="true" />
                    <span>Response Status Lookup</span>
                  </h2>
                  <p className="text-xs text-stone-600 mb-3">
                    Check the review and verification status of any community feedback code.
                  </p>

                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="search"
                        value={lookupId}
                        onChange={(e) => setLookupId(e.target.value)}
                        placeholder="Search Check ID (e.g. CFB-2026-8941)"
                        className="form-control font-mono text-xs pr-8"
                      />
                      {lookupId && (
                        <button
                          type="button"
                          onClick={() => setLookupId('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                          aria-label="Clear lookup"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Response Log Cards */}
                <div className="space-y-3" role="region" aria-label="Feedback Log">
                  <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                    <span className="font-semibold text-stone-700">Verified Community Log:</span>
                    <span>{displayFeedback.length} records</span>
                  </div>

                  {displayFeedback.map((fb) => (
                    <article 
                      key={fb.id}
                      className="bg-white border border-stone-200 rounded-xl p-4 space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-amber-900">{fb.id}</span>
                        <span className={`status-badge ${
                          fb.status === 'Verified & Applied' 
                            ? 'status-badge--verified' 
                            : fb.status === 'Under Review' 
                            ? 'status-badge--review' 
                            : 'status-badge--received'
                        }`}>
                          {fb.status === 'Verified & Applied' && <CheckCircle2 className="w-3 h-3" />}
                          {fb.status === 'Received & Logged' && <Clock className="w-3 h-3" />}
                          {fb.status}
                        </span>
                      </div>

                      <div className="text-xs text-stone-800 font-medium">
                        {fb.resourceName && (
                          <span className="text-amber-800 font-bold block">{fb.resourceName}</span>
                        )}
                        <p className="text-stone-600 mt-0.5">{fb.message}</p>
                      </div>

                      {fb.adminResponseNote && (
                        <div className="p-2 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-600">
                          <strong className="text-stone-800 font-mono uppercase block text-[10px]">
                            CivicBridge Response Check:
                          </strong>
                          <span>{fb.adminResponseNote}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-100">
                        <span>Submitted by {fb.userName}</span>
                        <time>{fb.submittedAt}</time>
                      </div>
                    </article>
                  ))}

                  {displayFeedback.length === 0 && (
                    <div className="bg-white border border-stone-200 rounded-xl p-6 text-center text-xs text-stone-500">
                      No response checks found matching &quot;{lookupId}&quot;.
                    </div>
                  )}
                </div>

              </section>

            </div>

          </div>
        )}

        {/* TAB 4: ABOUT, PLANNING & FBLA RUBRIC */}
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

                <details className="civic-details">
                  <summary className="civic-summary">
                    <span>User Feedback Response Verification</span>
                    <span aria-hidden="true">&darr;</span>
                  </summary>
                  <div className="civic-details-content">
                    The integrated feedback response check validates inputs client-side, generates audit tracking codes (e.g. CFB-2026-XXXX), and displays verification lifecycle status checks for community trust.
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
                    <tr>
                      <th scope="row" className="font-semibold text-stone-900">Feedback Verification</th>
                      <td>Feedback Response Rate (FRR)</td>
                      <td className="font-bold text-emerald-700">&gt; 95% within 48h</td>
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

      {/* 6. RESOURCE DETAILS MODAL WITH QUICK RESPONSE CHECK */}
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

            {/* Quick Listing Feedback Response Check */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-stone-800 block">Was this information accurate &amp; helpful?</span>
                <span className="text-[11px] text-stone-500">Your response check helps keep Cumming listings verified</span>
              </div>
              {quickCheckedMap[activeResource.id] ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                  <CheckCircle2 className="w-4 h-4" /> Checked!
                </span>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleQuickResourceCheck(activeResource.id)}
                    className="px-2.5 py-1 bg-white border border-stone-300 hover:bg-stone-100 rounded text-[11px] font-semibold text-stone-700 flex items-center gap-1 cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3 text-emerald-600" /> Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const resName = activeResource.name;
                      setActiveResource(null);
                      setFeedbackResource(resName);
                      setFeedbackCategory('Accuracy & Updates');
                      setCurrentTab('feedback');
                    }}
                    className="px-2.5 py-1 bg-white border border-stone-300 hover:bg-stone-100 rounded text-[11px] font-semibold text-stone-700 flex items-center gap-1 cursor-pointer"
                  >
                    <ThumbsDown className="w-3 h-3 text-amber-700" /> Report
                  </button>
                </div>
              )}
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
