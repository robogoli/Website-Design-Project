// Import React for rendering the Community Voices preview board
import React from 'react';
// Import Lucide icons for chat bubble, add note, and upvote heart controls
import { MessageSquare, Plus, Heart } from 'lucide-react';
// Import UserFeedback interface describing each community note entry
import { UserFeedback } from '../types';

// Props interface specifying feedback entries, like handlers, and navigation callbacks
interface CommunityVoicesProps {
  // Ordered list of community notes to preview
  feedbacks: UserFeedback[];
  // Total number of published notes displayed on the "View All" button
  allCount: number;
  // Dictionary tracking which notes the current visitor has marked helpful
  likedFeedbacks: Record<string, boolean>;
  // Callback toggling helpful upvote status for a given note ID
  onToggleLike: (id: string) => void;
  // Callback switching to the full Community Notes board tab
  onViewAll: () => void;
  // Callback opening the Community Notes tab to submit a new tip
  onShareNote: () => void;
}

// Homepage preview card strip showcasing the 3 most recent community neighbor notes
export const CommunityVoices: React.FC<CommunityVoicesProps> = ({
  feedbacks,
  allCount,
  likedFeedbacks,
  onToggleLike,
  onViewAll,
  onShareNote
}) => {
  return (
    // Highlighted warm-gradient section anchored below the resource directory
    <section className="mt-12 bg-gradient-to-r from-amber-50/80 via-stone-50 to-amber-50/50 border border-amber-200/80 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Top section header with title, summary, and action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          {/* Pill label identifying the public board */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Public Community Board</span>
          </div>
          {/* Section heading */}
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Community Voices &amp; Recent Neighbor Tips
          </h2>
          {/* Supporting explanation of resident-contributed tips */}
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
            Real, recent recommendations, program updates, and practical guidance posted by Forsyth County residents and visible to everyone browsing CivicBridge.
          </p>
        </div>

        {/* Action buttons to browse all notes or post a new note */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onViewAll}
            className="btn btn-outline text-xs px-4 py-2 cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>View All Notes ({allCount})</span>
          </button>
          <button
            type="button"
            onClick={onShareNote}
            className="btn btn-primary text-xs px-4 py-2 cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Share a Note</span>
          </button>
        </div>
      </div>

      {/* Responsive 3-column showcase grid displaying the latest three notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {feedbacks.slice(0, 3).map((item) => (
          // Individual neighbor note preview card
          <div
            key={item.id}
            className="bg-white border border-stone-200 rounded-xl p-4.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              {/* Resource badge and submission date row */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-xs text-amber-950 bg-amber-50/80 border border-amber-200/60 px-2 py-0.5 rounded truncate max-w-[200px]">
                  {item.resourceName || 'Countywide Service'}
                </span>
                <span className="text-[11px] text-stone-400 font-mono shrink-0">
                  {item.submittedAt}
                </span>
              </div>
              {/* Truncated quote excerpt from the resident's note */}
              <p className="text-xs text-stone-700 leading-relaxed italic line-clamp-3">
                &ldquo;{item.message}&rdquo;
              </p>
            </div>

            {/* Card footer showing author attribution and helpful heart button */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <span className="font-medium text-stone-800 text-[11px]">
                — {item.userName}
              </span>
              {/* Upvote button reflecting active user state */}
              <button
                type="button"
                onClick={() => onToggleLike(item.id)}
                className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  likedFeedbacks[item.id]
                    ? 'text-amber-800 bg-amber-50 font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Mark helpful"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    likedFeedbacks[item.id]
                      ? 'fill-amber-800 text-amber-800'
                      : 'text-stone-400'
                  }`}
                />
                <span>{item.likesCount || 0}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
