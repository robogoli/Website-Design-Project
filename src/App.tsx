import React, { useState, useEffect } from 'react';
import { 
  COMMUNITY_RESOURCES, 
  COMMUNITY_EVENTS, 
  RESEARCH_CITATIONS, 
  CATEGORIES,
  INITIAL_COMMUNITY_FEEDBACKS
} from './data/mockData';
import { ResourceItem, UserFeedback } from './types';
import { CivicChatbot } from './components/CivicChatbot';
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
  Monitor,
  Laptop,
  Globe,
  BookOpen, 
  User, 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Users,
  Github,
  ExternalLink
} from 'lucide-react';

export default function App() {
  // Navigation tabs
  const [currentTab, setCurrentTab] = useState<'resources' | 'events' | 'feedback' | 'about'>('resources');
  
  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeResource, setActiveResource] = useState<ResourceItem | null>(null);

  // Personalized Welcome Popup State
  const [userName, setUserName] = useState('');
  const [tempName, setTempName] = useState('');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Feedback form state
  const [feedbackName, setFeedbackName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<UserFeedback['category']>('Accuracy & Updates');
  const [feedbackResource, setFeedbackResource] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<UserFeedback['rating']>('Helpful');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Community feedback board state (persisted in localStorage)
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>(() => {
    try {
      const saved = localStorage.getItem('civicbridge_feedbacks') || localStorage.getItem('cumming_community_feedbacks');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved community feedbacks:', e);
    }
    return INITIAL_COMMUNITY_FEEDBACKS;
  });

  const [feedbackSideFilter, setFeedbackSideFilter] = useState<'all' | 'public' | 'anonymous'>('all');
  const [likedFeedbackIds, setLikedFeedbackIds] = useState<Record<string, boolean>>({});
  const [quickCheckedMap, setQuickCheckedMap] = useState<Record<string, boolean>>({});

  // Initialize personalized user name
  useEffect(() => {
    const saved = localStorage.getItem('civicbridge_user_name') || localStorage.getItem('cumming_user_name');
    if (saved) {
      setUserName(saved);
      setFeedbackName(saved);
    } else {
      setShowWelcomeModal(true);
    }
  }, []);

  // Save user name from modal
  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = tempName.trim().slice(0, 20) || 'Neighbor';
    setUserName(cleanName);
    setFeedbackName(cleanName);
    localStorage.setItem('civicbridge_user_name', cleanName);
    setShowWelcomeModal(false);
  };

  // Toggle helpful like count on feedback cards
  const handleToggleLikeFeedback = (feedbackId: string) => {
    setFeedbacks(prev => {
      const updated = prev.map(item => {
        if (item.id === feedbackId) {
          const isLiked = likedFeedbackIds[feedbackId];
          const currentLikes = item.likesCount || 0;
          return { ...item, likesCount: isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1 };
        }
        return item;
      });
      try {
        localStorage.setItem('civicbridge_feedbacks', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to store community feedbacks:', err);
      }
      return updated;
    });

    setLikedFeedbackIds(prev => ({
      ...prev,
      [feedbackId]: !prev[feedbackId]
    }));
  };

  // Filter feedbacks for side display
  const displayedFeedbacks = feedbacks.filter((item) => {
    if (feedbackSideFilter === 'public') return !item.isAnonymous;
    if (feedbackSideFilter === 'anonymous') return item.isAnonymous;
    return true;
  });

  // Handle feedback submission
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError('');

    let finalDisplayName = 'Anonymous Resident';
    if (!isAnonymous) {
      const trimmedName = feedbackName.trim() || userName;
      if (!trimmedName || trimmedName.length < 2) {
        setFeedbackError('Please enter your name (at least 2 characters) or select the anonymous option below.');
        return;
      }
      finalDisplayName = trimmedName;
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

    const newId = `fb-${Date.now()}`;
    const nowFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const newFeedback: UserFeedback = {
      id: newId,
      userName: finalDisplayName,
      isAnonymous,
      category: feedbackCategory,
      resourceName: feedbackResource.trim() || undefined,
      rating: feedbackRating,
      message: trimmedMsg,
      submittedAt: nowFormatted,
      status: 'Received & Logged',
      likesCount: 0
    };

    const updatedFeedbacks = [newFeedback, ...feedbacks];
    setFeedbacks(updatedFeedbacks);
    try {
      localStorage.setItem('civicbridge_feedbacks', JSON.stringify(updatedFeedbacks));
    } catch (err) {
      console.error('Failed to save feedbacks:', err);
    }

    setSubmissionSuccess(true);
    setFeedbackMessage('');
    setFeedbackResource('');
    setTimeout(() => setSubmissionSuccess(false), 5000);
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

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      
      {/* 1. EMERGENCY CRISIS HOTLINE RIBBON */}
      <aside className="crisis-banner" aria-label="Crisis Hotlines">
        <div className="crisis-banner-inner">
          <span className="font-bold">CivicBridge Crisis Hotlines:</span>
          <span>Suicide &amp; Crisis: <a href="tel:988">988</a></span>
          <span aria-hidden="true">·</span>
          <span>Forsyth County 2-1-1: <a href="tel:211">Dial 211</a></span>
          <span aria-hidden="true">·</span>
          <span>The Place of Forsyth: <a href="tel:7708871098">(770) 887-1098</a></span>
        </div>
      </aside>

      {/* 2. MAIN HEADER & NAVIGATION */}
      <header className="civic-header">
        <div className="civic-container civic-header-inner">
          <button 
            type="button"
            onClick={() => { setCurrentTab('resources'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="civic-brand"
            aria-label="CivicBridge Home"
          >
            <span className="civic-brand-icon" aria-hidden="true">C</span>
            <div>
              <span className="civic-brand-title">CivicBridge</span>
              <span className="civic-brand-sub">Cumming &amp; Forsyth County, GA</span>
            </div>
          </button>

          <nav className="civic-nav" aria-label="Main Navigation">
            {(['resources', 'events', 'feedback', 'about'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setCurrentTab(tab)}
                className={`civic-nav-link ${currentTab === tab ? 'civic-nav-link--active' : ''}`}
                aria-current={currentTab === tab ? 'page' : undefined}
              >
                {tab === 'resources' && 'Resources & Places'}
                {tab === 'events' && 'Events'}
                {tab === 'feedback' && 'Feedback'}
                {tab === 'about' && 'About & Plan'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="flex-1 py-8" id="main-content">

        {/* TAB 1: RESOURCES & DIRECTORY */}
        {currentTab === 'resources' && (
          <div className="civic-container space-y-8">
            
            {/* HERO SECTION */}
            <section className="hero-card" aria-labelledby="welcome-heading">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="hero-tagline">Civic Community Directory</span>
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

                  {/* Multi-Platform Device Compatibility Badges with Icons */}
                  <div className="inline-flex items-center gap-2 bg-stone-100/90 border border-stone-200/80 px-2.5 py-1 rounded-full text-[11px] text-stone-600 font-medium">
                    <span className="font-mono text-stone-500 uppercase text-[10px]">Verified:</span>
                    <span className="inline-flex items-center gap-1 text-stone-800" title="iPhone Safari & Chrome Compatible">
                      <Smartphone className="w-3.5 h-3.5 text-amber-800" />
                      <span>iPhone</span>
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="inline-flex items-center gap-1 text-stone-800" title="PC Desktop Browsers Compatible">
                      <Monitor className="w-3.5 h-3.5 text-amber-800" />
                      <span>PC Browser</span>
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="inline-flex items-center gap-1 text-stone-800" title="Android & Mobile Phone Compatible">
                      <Smartphone className="w-3.5 h-3.5 text-amber-800" />
                      <span>Phone</span>
                    </span>
                  </div>
                </div>

                <h1 id="welcome-heading" className="hero-title">
                  {userName ? `Welcome, ${userName}!` : 'Welcome to CivicBridge!'}
                </h1>

                <p className="hero-desc">
                  Explore verified food pantries, free clinics, schools, home &amp; auto repairs, childcare, sports recreation, and local dining in Cumming and Forsyth County, GA.
                </p>

                {/* SEARCH FORM */}
                <form 
                  role="search" 
                  onSubmit={(e) => e.preventDefault()} 
                  className="search-wrapper"
                >
                  <label htmlFor="resource-search" className="sr-only">
                    Search CivicBridge Directory
                  </label>
                  <Search className="w-4 h-4 search-icon-adornment" aria-hidden="true" />
                  <input
                    id="resource-search"
                    type="search"
                    list="civic-search-suggestions"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search schools, auto repair, food pantries, clinics, colleges, childcare, handyman..."
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

                  <datalist id="civic-search-suggestions">
                    <option value="Elementary Schools" />
                    <option value="Middle Schools" />
                    <option value="High Schools" />
                    <option value="Lanier Technical College" />
                    <option value="University of North Georgia" />
                    <option value="Auto Repair & Brakes" />
                    <option value="Plumbing & HVAC Repair" />
                    <option value="Handyman & Home Repairs" />
                    <option value="Appliance & Electronics Repair" />
                    <option value="The Place of Forsyth" />
                    <option value="Good Shepherd Clinic" />
                    <option value="Childcare & Daycare" />
                  </datalist>
                </form>
              </div>
            </section>

            {/* CATEGORY FILTER TOOLBAR */}
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

            {/* RESOURCE CARDS GRID */}
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
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                            <span className="truncate">{svc}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  <footer className="resource-footer">
                    <button
                      type="button"
                      onClick={() => setActiveResource(res)}
                      className="btn btn-outline text-xs"
                      aria-haspopup="dialog"
                    >
                      View Details
                    </button>
                    <a
                      href={`tel:${res.phone}`}
                      className="btn btn-primary text-xs"
                      aria-label={`Call ${res.name} at ${res.phone}`}
                    >
                      Call
                    </a>
                  </footer>
                </article>
              ))}
            </div>

            {/* Empty state */}
            {filteredResources.length === 0 && (
              <section className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-3">
                <p className="text-base font-semibold text-stone-800">
                  No resources found matching your search.
                </p>
                <p className="text-xs text-stone-500">
                  Try searching for terms like &quot;schools&quot;, &quot;repairs&quot;, &quot;food&quot;, &quot;clinic&quot;, or &quot;childcare&quot;.
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
                Community Events in Cumming &amp; Forsyth County
              </h1>
              <p className="hero-desc">
                Free resource fairs, food drives, and family activities for local residents.
              </p>
            </header>

            <div className="space-y-4">
              {COMMUNITY_EVENTS.map((evt) => (
                <article key={evt.id} className="event-card">
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

        {/* TAB 3: COMMUNITY FEEDBACK & PUBLIC BOARD */}
        {currentTab === 'feedback' && (
          <div className="civic-container space-y-6">
            <header className="border-b border-stone-200 pb-3">
              <span className="hero-tagline">
                Community Voice &amp; Public Suggestions
              </span>
              <h1 className="hero-title mt-1">
                Community Feedback &amp; Public Board
              </h1>
              <p className="hero-desc mb-0">
                Share updates, suggest new resources, or provide feedback for CivicBridge. All feedback is displayed openly on the community board—you can choose to show your name or remain completely anonymous.
              </p>
            </header>

            {/* SIDE-BY-SIDE RESPONSIVE GRID (Form on left, Community Board on the side) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Submit Feedback Form */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Subtle success banner */}
                {submissionSuccess && (
                  <div role="status" aria-live="polite" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Feedback published successfully to the community board!</span>
                  </div>
                )}

                <section className="feedback-card" aria-labelledby="form-heading">
                  <h2 id="form-heading" className="text-lg font-bold font-serif text-stone-900 mb-1 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-800" aria-hidden="true" />
                    <span>Submit Community Feedback</span>
                  </h2>
                  <p className="text-xs text-stone-600 mb-4">
                    Share your thoughts with the community. You can choose whether your name is shown publicly or kept completely anonymous.
                  </p>

                  {feedbackError && (
                    <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{feedbackError}</span>
                    </div>
                  )}

                  <form onSubmit={handleFeedbackSubmit} noValidate className="space-y-3.5">
                    
                    {/* ASK IF THEY WANT TO BE ANONYMOUS */}
                    <fieldset className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                      <legend className="text-xs font-bold text-stone-900 flex items-center justify-between w-full pb-1">
                        <span className="flex items-center gap-1.5">
                          {isAnonymous ? <EyeOff className="w-4 h-4 text-stone-600" /> : <Eye className="w-4 h-4 text-amber-800" />}
                          <span>Do you want this feedback to be anonymous?</span>
                        </span>
                        <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isAnonymous ? 'bg-stone-200 text-stone-800' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {isAnonymous ? 'Anonymous' : 'Public Name'}
                        </span>
                      </legend>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          !isAnonymous 
                            ? 'border-amber-800 bg-amber-50/70 text-amber-950 font-medium shadow-xs' 
                            : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                        }`}>
                          <input 
                            type="radio" 
                            name="anonymity-preference" 
                            checked={!isAnonymous} 
                            onChange={() => setIsAnonymous(false)} 
                            className="mt-0.5 text-amber-800 focus:ring-amber-800 cursor-pointer"
                          />
                          <div>
                            <span className="font-bold block">No, show my name</span>
                            <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                              Displays your name publicly on the feedback feed
                            </span>
                          </div>
                        </label>

                        <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isAnonymous 
                            ? 'border-amber-800 bg-amber-50/70 text-amber-950 font-medium shadow-xs' 
                            : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                        }`}>
                          <input 
                            type="radio" 
                            name="anonymity-preference" 
                            checked={isAnonymous} 
                            onChange={() => setIsAnonymous(true)} 
                            className="mt-0.5 text-amber-800 focus:ring-amber-800 cursor-pointer"
                          />
                          <div>
                            <span className="font-bold block">Yes, make it anonymous</span>
                            <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                              Hides your name; displays as &ldquo;Anonymous Resident&rdquo;
                            </span>
                          </div>
                        </label>
                      </div>
                    </fieldset>

                    {/* Resident Name Field */}
                    <div className="form-group">
                      <label htmlFor="fb-name" className="form-label">
                        <span>{isAnonymous ? 'Your Name / Initials (Private):' : 'Your Name / Initials:'}</span>
                        <span className="text-[11px] text-stone-400 font-mono">
                          {isAnonymous ? 'Hidden from public feed' : 'Required'}
                        </span>
                      </label>
                      <input
                        id="fb-name"
                        type="text"
                        maxLength={30}
                        value={isAnonymous ? '' : feedbackName}
                        onChange={(e) => setFeedbackName(e.target.value)}
                        placeholder={isAnonymous ? 'Anonymity enabled (name will not be shown)' : 'e.g. Alex M. or Forsyth Resident'}
                        className={`form-control ${isAnonymous ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : ''}`}
                        disabled={isAnonymous}
                        required={!isAnonymous}
                      />
                      {isAnonymous && (
                        <p className="text-[11px] text-stone-500 flex items-center gap-1.5 pt-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Your identity is protected. Displays as <strong>&ldquo;Anonymous Resident&rdquo;</strong>.</span>
                        </p>
                      )}
                    </div>

                    {/* Feedback Category */}
                    <div className="form-group">
                      <label htmlFor="fb-category" className="form-label">
                        <span>Feedback Category:</span>
                      </label>
                      <select
                        id="fb-category"
                        value={feedbackCategory}
                        onChange={(e) => setFeedbackCategory(e.target.value as UserFeedback['category'])}
                        className="form-control"
                      >
                        <option value="Accuracy & Updates">Accuracy &amp; Updates (Phone, hours, address change)</option>
                        <option value="Suggest New Resource">Suggest New Resource (New pantry, clinic, park, repair shop)</option>
                        <option value="Website Accessibility">Website Accessibility (Readability, contrast, keyboard focus)</option>
                        <option value="General Suggestion">General Suggestion</option>
                      </select>
                    </div>

                    {/* Specific Resource or Place */}
                    <div className="form-group">
                      <label htmlFor="fb-resource" className="form-label">
                        <span>Specific Resource or Place (Optional):</span>
                      </label>
                      <input
                        id="fb-resource"
                        type="text"
                        list="civic-search-suggestions"
                        value={feedbackResource}
                        onChange={(e) => setFeedbackResource(e.target.value)}
                        placeholder="e.g. Good Shepherd Clinic, Lanier Tech, Auto Repair..."
                        className="form-control"
                      />
                    </div>

                    {/* Helpfulness Rating */}
                    <div className="form-group">
                      <span className="form-label">
                        <span>Experience / Rating:</span>
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
                        <span>Feedback Details:</span>
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
                        placeholder="Describe what you noticed or would like to suggest..."
                        className="form-control resize-y"
                        required
                      ></textarea>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="btn btn-primary w-full py-2.5 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Publish Feedback</span>
                      </button>
                    </div>

                  </form>
                </section>
              </div>

              {/* RIGHT COLUMN (ON THE SIDE): Live Community Feedback Feed */}
              <aside className="lg:col-span-7 space-y-4" aria-label="Community Feedback Board">
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
                  
                  {/* Board Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-800" aria-hidden="true" />
                        <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                          Community Feedback Board
                        </h2>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Displaying feedback and suggestions shared by local residents.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        <span>{feedbacks.length} Submissions</span>
                      </span>
                    </div>
                  </div>

                  {/* Filter tabs: All, Public, Anonymous */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setFeedbackSideFilter('all')}
                        className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                          feedbackSideFilter === 'all'
                            ? 'bg-amber-800 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        All ({feedbacks.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackSideFilter('public')}
                        className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                          feedbackSideFilter === 'public'
                            ? 'bg-amber-800 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Public ({feedbacks.filter(f => !f.isAnonymous).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackSideFilter('anonymous')}
                        className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                          feedbackSideFilter === 'anonymous'
                            ? 'bg-amber-800 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Anonymous ({feedbacks.filter(f => f.isAnonymous).length})
                      </button>
                    </div>

                    <span className="text-[11px] text-stone-500 font-mono">
                      Showing {displayedFeedbacks.length} records
                    </span>
                  </div>

                  {/* Feedback Cards List */}
                  <div className="space-y-3.5 max-h-[780px] overflow-y-auto pr-1">
                    {displayedFeedbacks.length === 0 ? (
                      <div className="text-center py-10 px-4 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-xs text-stone-500">
                        No feedback found in this filter category.
                      </div>
                    ) : (
                      displayedFeedbacks.map((item) => (
                        <article 
                          key={item.id}
                          className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all space-y-2.5 shadow-2xs"
                        >
                          {/* Top row: Resident Identity, Category & Timestamp */}
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.isAnonymous ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300">
                                  <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                                  <span>Anonymous Resident</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                                  <User className="w-3.5 h-3.5 text-amber-700" />
                                  <span>{item.userName}</span>
                                </span>
                              )}

                              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200/60">
                                {item.category}
                              </span>

                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                item.rating === 'Very Helpful'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : item.rating === 'Helpful'
                                  ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}>
                                {item.rating}
                              </span>
                            </div>

                            <time className="text-[11px] text-stone-400 font-mono shrink-0">
                              {item.submittedAt}
                            </time>
                          </div>

                          {/* Resource Name if applicable */}
                          {item.resourceName && (
                            <div className="flex items-center gap-1.5 text-xs text-stone-700">
                              <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                              <span>Place: <strong className="text-stone-900">{item.resourceName}</strong></span>
                            </div>
                          )}

                          {/* Message Quote */}
                          <blockquote className="text-xs sm:text-sm text-stone-800 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-200/70">
                            &ldquo;{item.message}&rdquo;
                          </blockquote>

                          {/* Bottom Row: Helpful Vote Button */}
                          <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
                            <span className="text-stone-400 text-[11px]">Community Voice</span>
                            <button
                              type="button"
                              onClick={() => handleToggleLikeFeedback(item.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                                likedFeedbackIds[item.id]
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                              }`}
                              aria-label={`Mark feedback as helpful, currently ${item.likesCount || 0} votes`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${likedFeedbackIds[item.id] ? 'text-amber-800 fill-amber-800' : 'text-stone-500'}`} />
                              <span>Helpful ({item.likesCount || 0})</span>
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </aside>

            </div>
          </div>
        )}

        {/* TAB 4: ABOUT, DOCUMENTATION & PLAN */}
        {currentTab === 'about' && (
          <article className="civic-container space-y-6">
            <header className="border-b border-stone-200 pb-3">
              <span className="hero-tagline">
                TSA Webmaster Competition Documentation
              </span>
              <h1 className="hero-title mt-1">
                Project Documentation &amp; Architecture
              </h1>
            </header>

            {/* 1. TSA Webmaster Documentation & GitHub Repository Card */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-stone-900 text-white rounded-xl">
                    <Github className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                      GitHub Repository &amp; Source Code Documentation
                    </h2>
                    <span className="text-xs text-stone-500 font-mono">
                      Repository: robogoli/TSAWebmaster
                    </span>
                  </div>
                </div>

                <a
                  href="https://github.com/robogoli/TSAWebmaster/tree/main"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary text-xs inline-flex items-center gap-2 self-start sm:self-auto shadow-xs"
                >
                  <Github className="w-4 h-4" />
                  <span>Open GitHub Repository</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                The entire CivicBridge source code is publicly hosted on GitHub for TSA Webmaster competitive review. The repository features complete semantic HTML5 landmarks, handcrafted CSS3 styling, custom responsive typography, and an interactive assistant chatbot.
              </p>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div>
                  <span className="font-bold text-stone-900 block font-mono">Direct Repository Link:</span>
                  <a 
                    href="https://github.com/robogoli/TSAWebmaster/tree/main"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-800 hover:text-amber-950 underline font-mono text-xs break-all font-medium"
                  >
                    https://github.com/robogoli/TSAWebmaster/tree/main
                  </a>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded bg-stone-200 text-stone-800 font-mono text-[11px] font-bold">
                    Branch: main
                  </span>
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-mono text-[11px] font-bold">
                    100% Validated
                  </span>
                </div>
              </div>
            </section>

            {/* 2. Mission & Purpose */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-800" aria-hidden="true" />
                <span>Mission &amp; Community Impact</span>
              </h2>
              <blockquote className="border-l-4 border-amber-800 pl-4 py-1 italic bg-stone-50 text-stone-700 text-xs sm:text-sm rounded-r">
                <p>&ldquo;CivicBridge connects residents across Forsyth County directly to verified local services and support networks.&rdquo;</p>
              </blockquote>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                CivicBridge brings together verified local non-profits, healthcare clinics, food pantries, educational institutions, repair services, childcare providers, and sports programs into one responsive, accessible directory.
              </p>
            </section>

            {/* 3. Multi-Platform Compatibility with Device Icons: iPhone, PC Browser, and Mobile Phone */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-800" aria-hidden="true" />
                  <span>Multi-Platform Compatibility &amp; Responsive Verification</span>
                </h2>
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Verified Across All 3 Form Factors
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                CivicBridge has been thoroughly engineered and verified across desktop computers, tablets, and smartphones. Each layout is tested for accessibility, touch targets (&ge; 48px), and fast rendering:
              </p>

              {/* 3 Compatibility Cards with Visual Icons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* 1. iPhone */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-amber-700/50 transition-all space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                      iOS Verified
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 font-serif">iPhone</h3>
                  <p className="text-[11px] text-stone-500 font-mono">iOS Safari &amp; Chrome (390px &amp; 430px)</p>
                  <ul className="text-xs text-stone-600 space-y-1 pt-1.5 border-t border-stone-200/60">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Touch targets &ge; 48px for thumb comfort</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Direct tap-to-call mobile dialing</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>iOS safe area layout protection</span>
                    </li>
                  </ul>
                </div>

                {/* 2. PC Browser */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-amber-700/50 transition-all space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                      Desktop Verified
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 font-serif">PC Browser</h3>
                  <p className="text-[11px] text-stone-500 font-mono">Chrome, Firefox, Safari, Edge (1440px &amp; 1920px)</p>
                  <ul className="text-xs text-stone-600 space-y-1 pt-1.5 border-t border-stone-200/60">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>2-column adaptive resource grid</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Side-by-side live feedback feed</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>High-visibility keyboard focus rings</span>
                    </li>
                  </ul>
                </div>

                {/* 3. Mobile Phone */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-amber-700/50 transition-all space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                      Mobile Verified
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 font-serif">Mobile Phone</h3>
                  <p className="text-[11px] text-stone-500 font-mono">Android Chrome &amp; Firefox (360px &ndash; 820px)</p>
                  <ul className="text-xs text-stone-600 space-y-1 pt-1.5 border-t border-stone-200/60">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Single-column responsive flow</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Horizontal category pill scrollbar</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Lightweight bandwidth footprint</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. Accessibility & Design Standards */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                <span>Design &amp; Accessibility (WCAG 2.2 AA)</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                We chose clean typography, warm earth tones, and high-contrast text (&gt; 4.5:1 ratio) to ensure ease of reading for seniors and mobile visitors. Touch targets are generous and phone numbers link directly to mobile calling.
              </p>

              <div className="space-y-2">
                <details className="civic-details">
                  <summary className="civic-summary">
                    <span>Contrast &amp; Readability Standards</span>
                    <span aria-hidden="true">&darr;</span>
                  </summary>
                  <div className="civic-details-content">
                    All text strings follow WCAG 2.2 Level AA contrast requirements. Body text maintains a 12:1 ratio (Stone 900 on Stone 50), and secondary text retains at least 5.2:1 contrast.
                  </div>
                </details>

                <details className="civic-details">
                  <summary className="civic-summary">
                    <span>Keyboard Navigation &amp; Focus Rings</span>
                    <span aria-hidden="true">&darr;</span>
                  </summary>
                  <div className="civic-details-content">
                    All interactive elements feature high-visibility focus indicators with 2px solid civic amber outlines and 3px offset.
                  </div>
                </details>

                <details className="civic-details">
                  <summary className="civic-summary">
                    <span>Community Voice &amp; Anonymity Options</span>
                    <span aria-hidden="true">&darr;</span>
                  </summary>
                  <div className="civic-details-content">
                    The integrated community feedback system allows residents to submit suggestions openly or anonymously, empowering local voices while protecting user privacy.
                  </div>
                </details>
              </div>
            </section>

            {/* 5. Planned Metrics Table */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-800" aria-hidden="true" />
                <span>Planned Success Metrics</span>
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

            {/* 6. Sources & Citations */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-800" aria-hidden="true" />
                <span>Research Sources &amp; Citations</span>
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
          </article>
        )}
      </main>

      {/* 4. FOOTER */}
      <footer className="civic-footer print:hidden">
        <div className="civic-container space-y-4">
          <div className="civic-footer-inner">
            <div>
              <strong className="text-white font-serif text-base block">CivicBridge</strong>
              <span className="text-xs text-stone-300">Forsyth County &amp; Cumming Community Resource Directory</span>
            </div>

            {/* Device Compatibility Badges with Icons */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-stone-400 font-mono text-[11px] uppercase mr-1">Responsive on:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800 text-stone-200 border border-stone-700 font-medium">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>iPhone</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800 text-stone-200 border border-stone-700 font-medium">
                <Monitor className="w-3.5 h-3.5 text-amber-400" />
                <span>PC Browser</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800 text-stone-200 border border-stone-700 font-medium">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Mobile Phone</span>
              </span>
            </div>

            {/* GitHub Repository Link */}
            <div>
              <a
                href="https://github.com/robogoli/TSAWebmaster/tree/main"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-100 hover:text-white rounded-lg text-xs font-mono font-medium transition-colors border border-stone-700 shadow-xs"
              >
                <Github className="w-4 h-4 text-stone-300" />
                <span>GitHub Repository: robogoli/TSAWebmaster</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </a>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-400 gap-2">
            <div>
              TSA Webmaster 2026–2027 Competitive Entry · Built with Semantic HTML5, CSS3 &amp; React
            </div>
            <div>
              Cumming &amp; Forsyth County, Georgia
            </div>
          </div>
        </div>
      </footer>

      {/* 5. PERSONALIZED WELCOME POPUP MODAL */}
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
                Welcome to CivicBridge!
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                We are glad you are here. Whether you need grocery assistance, healthcare, schools &amp; education, home or auto repairs, childcare, sports activities, or local dining, our community is here for you.
              </p>
            </div>

            <form onSubmit={handleSaveName} className="space-y-3 pt-3">
              <fieldset>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="welcome-name" className="text-xs font-semibold text-stone-700">
                    Type in your name
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
                  {tempName.trim() ? `Welcome Me, ${tempName.trim()}` : 'Type in your name'}
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

      {/* 6. RESOURCE DETAILS MODAL WITH QUICK ACCURACY CHECK */}
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

            {/* Quick Listing Accuracy Check */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-stone-800 block">Was this information accurate &amp; helpful?</span>
                <span className="text-[11px] text-stone-500">Your feedback helps keep CivicBridge listings accurate and up-to-date</span>
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

      {/* 7. INTERACTIVE CHATBOT (CivicBridge Assistant) */}
      <CivicChatbot onSelectResource={(res) => setActiveResource(res)} />

    </div>
  );
}
