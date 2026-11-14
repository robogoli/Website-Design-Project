// Import React hooks for managing feedback form state and smooth feed scrolling
import React, { useState, useRef } from 'react';
// Import Lucide icons for community board controls, privacy toggle, validation alerts, and upvotes
import {
  MessageSquare,
  Users,
  Eye,
  EyeOff,
  User,
  MapPin,
  ThumbsUp,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Info
} from 'lucide-react';
// Import UserFeedback interface defining community note fields
import { UserFeedback } from '../types';

// Props interface defining community board data, filter state, and submission/like callbacks
interface FeedbackSectionProps {
  // Filtered array of community notes currently visible in the feed
  feedbacks: UserFeedback[];
  // Total number of published notes regardless of active filter
  allCount: number;
  // Active feed filter tab ('all', 'public', or 'anonymous')
  filterType: 'all' | 'public' | 'anonymous';
  // Callback switching between feed filter tabs
  onFilterChange: (filter: 'all' | 'public' | 'anonymous') => void;
  // Async callback persisting a new community note to Supabase
  onSubmitFeedback: (feedback: Omit<UserFeedback, 'id' | 'submittedAt' | 'status' | 'likesCount'>) => Promise<UserFeedback>;
  // Callback toggling helpful upvote status for a community note ID
  onToggleLike: (id: string) => void;
  // Lookup dictionary of note IDs upvoted by the current visitor
  likedFeedbackIds: Record<string, boolean>;
  // Optional pre-populated organization name when navigated from ResourceDetails
  initialResourceName?: string;
}

// Community Notes page combining the submission form and live searchable neighbor feed
export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  feedbacks,
  allCount,
  filterType,
  onFilterChange,
  onSubmitFeedback,
  onToggleLike,
  likedFeedbackIds,
  initialResourceName = ''
}) => {
  // Toggle controlling whether the author's name is hidden as anonymous
  const [isAnonymous, setIsAnonymous] = useState(false);
  // Author display name when posting publicly
  const [name, setName] = useState('');
  // Selected feedback topic category
  const [category, setCategory] = useState<UserFeedback['category']>('Accuracy & Updates');
  // Optional organization name referenced in the note
  const [resourceName, setResourceName] = useState(initialResourceName);
  // Experience rating selection
  const [rating, setRating] = useState<'Very Helpful' | 'Helpful' | 'Needs Improvement'>('Very Helpful');
  // Main message body text written by the neighbor
  const [message, setMessage] = useState('');
  // Validation error message displayed above the form when checks fail
  const [error, setError] = useState('');
  // Temporary success banner flag shown after submitting a note
  const [success, setSuccess] = useState(false);
  // Ref targeting the scrollable community feed container
  const feedRef = useRef<HTMLDivElement>(null);

  // Validate and submit a new community note to Supabase and update local UI state
  const handleSubmit = (e: React.FormEvent) => {
    // Prevent native browser page reload on form submit
    e.preventDefault();
    // Clear any prior validation error before re-checking
    setError('');

    // Require a name unless the author opted into anonymous posting
    if (!isAnonymous && !name.trim()) {
      setError('Please provide a name or nickname, or select "Keep me anonymous".');
      return;
    }

    // Require at least 10 characters so submitted tips contain useful context
    if (message.trim().length < 10) {
      setError('Please write at least 10 characters so other neighbors have enough context.');
      return;
    }

    // Forward sanitized feedback payload to parent hook
    onSubmitFeedback({
      userName: isAnonymous ? 'A Friendly Neighbor' : name.trim(),
      isAnonymous,
      category,
      resourceName: resourceName.trim() || undefined,
      rating,
      message: message.trim()
    });

    // Clear the message textarea and show confirmation alert for 4 seconds
    setMessage('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);

    // Smoothly scroll the feed back to the top so the new note appears in view
    feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="civic-container space-y-6">
      {/* Page header introducing the public community board */}
      <header className="border-b border-stone-200 pb-3">
        <span className="hero-tagline">
          Community Voices &amp; Neighbor Notes
        </span>
        <h1 className="hero-title mt-1">
          Neighbor Notes &amp; Community Board
        </h1>
        <p className="hero-desc mb-0">
          Been to one of these spots recently? Leave a note. If someone changed their hours or treated your family with real care, speak up. It takes thirty seconds and saves the next neighbor a wasted trip.
        </p>

        {/* Public visibility notice banner */}
        <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2 leading-relaxed">
          <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <strong>Public Community Board:</strong> All notes, recent hours updates, and tips posted here are visible to everyone browsing CivicBridge across Forsyth County to keep our community informed and connected.
          </div>
        </div>
      </header>

      {/* Two-column layout pairing the submission form with the scrollable community feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Community note submission form */}
        <div className="lg:col-span-5 space-y-4">
          {success && (
            <div role="status" aria-live="polite" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Your note has been posted to the community board! Thank you for helping neighbors.</span>
            </div>
          )}

          <section className="feedback-card" aria-labelledby="form-heading">
            <h2 id="form-heading" className="text-lg font-bold font-serif text-stone-900 mb-1 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-800" aria-hidden="true" />
              <span>Drop a quick note or update</span>
            </h2>
            <p className="text-xs text-stone-600 mb-4">
              Spot a wrong phone number or had a great visit? Let folks know. You can sign your name or keep it totally anonymous.
            </p>

            {/* Accessible inline validation alert */}
            {error && (
              <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
              {/* Public name vs. anonymous privacy preference radio group */}
              <fieldset className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <legend className="text-xs font-bold text-stone-900 flex items-center justify-between w-full pb-1">
                  <span className="flex items-center gap-1.5">
                    {isAnonymous ? <EyeOff className="w-4 h-4 text-stone-600" /> : <Eye className="w-4 h-4 text-amber-800" />}
                    <span>Would you like your name shown?</span>
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
                      <span className="font-bold block">Yes, show my name</span>
                      <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                        Displays your name alongside your note
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
                      onChange={() => {
                        setIsAnonymous(true);
                        setName('');
                      }}
                      className="mt-0.5 text-amber-800 focus:ring-amber-800 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold block">Keep me anonymous</span>
                      <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                        Hides your name; shows as &ldquo;A Friendly Neighbor&rdquo;
                      </span>
                    </div>
                  </label>
                </div>
              </fieldset>

              {/* Author name input (disabled when anonymous posting is active) */}
              <div className="form-group">
                <label htmlFor="fb-name" className="form-label">
                  <span>{isAnonymous ? 'Your Name or Nickname (Private):' : 'Your Name or Nickname:'}</span>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {isAnonymous ? 'Hidden from feed' : 'Required'}
                  </span>
                </label>
                <input
                  id="fb-name"
                  type="text"
                  maxLength={30}
                  value={isAnonymous ? '' : name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAnonymous ? 'Anonymous mode enabled (name will not be shown)' : 'e.g. Alex M. or Forsyth Neighbor'}
                  className={`form-control ${isAnonymous ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : ''}`}
                  disabled={isAnonymous}
                  required={!isAnonymous}
                />
                {isAnonymous && (
                  <p className="text-[11px] text-stone-500 flex items-center gap-1.5 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Your privacy is protected. Displays as <strong>&ldquo;A Friendly Neighbor&rdquo;</strong>.</span>
                  </p>
                )}
              </div>

              {/* Note topic category selector */}
              <div className="form-group">
                <label htmlFor="fb-category" className="form-label">
                  <span>What kind of note is this?</span>
                </label>
                <select
                  id="fb-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as UserFeedback['category'])}
                  className="form-control"
                >
                  <option value="Accuracy & Updates">Hours, phone, or address update</option>
                  <option value="Suggest New Resource">Suggest a new local place or program</option>
                  <option value="Website Accessibility">Website ease of use or accessibility</option>
                  <option value="General Suggestion">General neighbor tip or suggestion</option>
                </select>
              </div>

              {/* Optional target resource name field */}
              <div className="form-group">
                <label htmlFor="fb-resource" className="form-label">
                  <span>Which place is this about? (Optional):</span>
                </label>
                <input
                  id="fb-resource"
                  type="text"
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  placeholder="e.g. The Place, Good Shepherd Clinic, Lanier Tech, Auto Repair..."
                  className="form-control"
                />
              </div>

              {/* Experience rating button selector */}
              <div className="form-group">
                <span className="form-label">
                  <span>How was your experience?</span>
                </span>
                <div className="grid grid-cols-3 gap-2 pt-0.5">
                  {(['Very Helpful', 'Helpful', 'Needs Improvement'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRating(r)}
                      className={`py-2 px-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
                        rating === r
                          ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {r === 'Very Helpful' ? 'Wonderful' : r === 'Helpful' ? 'Helpful' : 'Could Be Better'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note body textarea with live character limit warning */}
              <div className="form-group">
                <label htmlFor="fb-message" className="form-label">
                  <span>Your Note or Details:</span>
                  <output
                    htmlFor="fb-message"
                    className={`text-[11px] font-mono font-medium transition-colors ${
                      message.length >= 480
                        ? 'text-red-600 font-bold'
                        : message.length >= 400
                        ? 'text-amber-600'
                        : 'text-stone-400'
                    }`}
                  >
                    {message.length}/500 chars (min 10)
                  </output>
                </label>
                <textarea
                  id="fb-message"
                  rows={4}
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share what you noticed, a tip for fellow families, or what needs updating..."
                  className="form-control resize-y"
                  required
                ></textarea>
              </div>

              {/* Submit button posting the note to the live board */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="btn btn-primary w-full py-2.5 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Post to Community Board</span>
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right column: Scrollable community notes feed with filter tabs */}
        <aside className="lg:col-span-7 space-y-4" aria-label="Community Feedback Board">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
            {/* Feed header showing total note count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-800" aria-hidden="true" />
                  <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                    Community Board &amp; Neighbor Notes
                  </h2>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  Real updates, experiences, and kind words shared by local Forsyth County residents.
                </p>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  <span>{allCount} Neighbor Notes</span>
                </span>
              </div>
            </div>

            {/* Segmented filter control switching between All, Signed, and Anonymous notes */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => onFilterChange('all')}
                  className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All ({allCount})
                </button>
                <button
                  type="button"
                  onClick={() => onFilterChange('public')}
                  className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    filterType === 'public'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Signed
                </button>
                <button
                  type="button"
                  onClick={() => onFilterChange('anonymous')}
                  className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    filterType === 'anonymous'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Anonymous
                </button>
              </div>

              <span className="text-[11px] text-stone-500 font-mono">
                Showing {feedbacks.length} notes
              </span>
            </div>

            {/* Scrollable feed container displaying filtered community notes */}
            <div ref={feedRef} className="space-y-3.5 max-h-[780px] overflow-y-auto pr-1">
              {feedbacks.length === 0 ? (
                <div className="text-center py-10 px-4 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-xs text-stone-500">
                  No neighbor notes found in this filter yet.
                </div>
              ) : (
                feedbacks.map((item) => (
                  // Individual neighbor note article card
                  <article
                    key={item.id}
                    className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all space-y-2.5 shadow-2xs"
                  >
                    {/* Author badge, verification pill, category tag, rating badge, and date */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.isAnonymous ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300">
                            <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                            <span>A Friendly Neighbor</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                            <User className="w-3.5 h-3.5 text-amber-700" />
                            <span>{item.userName}</span>
                          </span>
                        )}

                        {item.status === 'Verified & Applied' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-mono font-bold bg-emerald-50 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Verified Note
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
                          {item.rating === 'Very Helpful' ? 'Wonderful' : item.rating === 'Helpful' ? 'Helpful' : 'Could Be Better'}
                        </span>
                      </div>

                      <time className="text-[11px] text-stone-400 font-mono shrink-0">
                        {item.submittedAt}
                      </time>
                    </div>

                    {/* Referenced organization name when provided */}
                    {item.resourceName && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-700">
                        <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                        <span>About: <strong className="text-stone-900">{item.resourceName}</strong></span>
                      </div>
                    )}

                    {/* Resident's quoted message body */}
                    <blockquote className="text-xs sm:text-sm text-stone-800 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-200/70">
                      &ldquo;{item.message}&rdquo;
                    </blockquote>

                    {/* Card footer with upvote toggle button */}
                    <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
                      <span className="text-stone-400 text-[11px]">Neighbor Voice</span>
                      <button
                        type="button"
                        onClick={() => onToggleLike(item.id)}
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
  );
};
