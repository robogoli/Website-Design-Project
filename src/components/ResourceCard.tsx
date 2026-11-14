// Import React and memo for rendering optimization of individual directory listing cards
import React, { memo } from 'react';
// Import vector icons from Lucide for phone, address pin, operating hours, and verified badges
import { Phone, MapPin, Clock, CheckCircle2, PhoneCall, ShieldCheck } from 'lucide-react';
// Import domain interface definition for directory items
import { ResourceItem } from '../types';

// TypeScript interface defining component props passed to ResourceCard
interface ResourceCardProps {
  // Complete data object containing details for a single community listing
  resource: ResourceItem;
  // Callback function invoked when visitor clicks 'More details' to open full modal sheet
  onSelect: (resource: ResourceItem) => void;
  // Callback function invoked when visitor clicks to call the verified phone number
  onCall: (phone: string, resourceName: string) => void;
}

// Memoized resource card component preventing unnecessary re-renders when parent states change
export const ResourceCard = memo(function ResourceCard({
  resource,
  onSelect,
  onCall,
}: ResourceCardProps) {
  return (
    // Semantic HTML article landmark representing an independent, reusable community directory card
    <article
      id={`res-${resource.id}`}
      className="resource-card flex flex-col justify-between transition-all"
    >
      <div>
        {/* Card header holding civic category tag, county district, and cost badge */}
        <header className="resource-header flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Category badge */}
            <span className="resource-category-tag">{resource.categoryLabel}</span>
            {/* Geographic district tag */}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              {resource.district}
            </span>
          </div>
          {/* Cost badge (e.g. Free, Sliding Scale, Subsidized) */}
          <span className="resource-cost-badge shrink-0">{resource.cost}</span>
        </header>

        {/* Organization name rendered in readable serif font */}
        <h2 className="resource-title">{resource.name}</h2>
        {/* Short descriptive tagline summarizing community mission */}
        <p className="resource-tagline">{resource.tagline}</p>

        {/* Semantic address element holding contact phone, street location, and operating hours */}
        <address className="resource-contact-block mt-3 space-y-1.5 not-italic">
          {/* Telephone number row with phone icon */}
          <div className="resource-contact-row">
            <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
            <a
              href={`tel:${resource.phone.replace(/[^\d+]/g, '')}`}
              onClick={(e) => {
                // Intercept default link navigation to run device check modal
                e.preventDefault();
                onCall(resource.phone, resource.name);
              }}
              className="resource-contact-link"
              title={`Call ${resource.name} at ${resource.phone}`}
            >
              {resource.phone}
            </a>
          </div>

          {/* Physical address row with pin icon */}
          <div className="resource-contact-row">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
            <span className="truncate">{resource.address}</span>
          </div>

          {/* Weekly operating schedule with clock icon */}
          <div className="resource-contact-row">
            <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
            <time className="truncate">{resource.hours}</time>
          </div>
        </address>

        {/* Services checklist section highlighting top offerings */}
        <section className="offerings-section mt-3 pt-2.5 border-t border-stone-100" aria-label="Services offered">
          <strong className="offerings-heading block text-[11px] font-bold text-stone-800 uppercase tracking-wide mb-1.5 font-mono">
            Key Services:
          </strong>
          {/* List of services with checkmark icons */}
          <ul className="offerings-grid">
            {resource.keyServices.slice(0, 4).map((svc, i) => (
              <li key={i} className="offering-item" title={svc}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span className="truncate">{svc}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Verified municipal record badge */}
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{resource.verificationDate || 'Verified Record'}</span>
        </div>
      </div>

      {/* Card action footer containing 'More details' and 'Call now' buttons */}
      <footer className="resource-footer mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        {/* Opens full dialog modal */}
        <button
          type="button"
          onClick={() => onSelect(resource)}
          className="btn btn-outline text-xs cursor-pointer"
          aria-haspopup="dialog"
        >
          More details
        </button>

        {/* Call button triggering phone dial or clipboard prompt */}
        <a
          href={`tel:${resource.phone.replace(/[^\d+]/g, '')}`}
          onClick={(e) => {
            e.preventDefault();
            onCall(resource.phone, resource.name);
          }}
          className="btn btn-primary text-xs inline-flex items-center gap-1.5 cursor-pointer"
          aria-label={`Call ${resource.name} at ${resource.phone}`}
        >
          <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Call now</span>
        </a>
      </footer>
    </article>
  );
});
