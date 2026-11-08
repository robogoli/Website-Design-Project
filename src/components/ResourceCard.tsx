import React from 'react';
import { Phone, MapPin, Clock, CheckCircle2, PhoneCall, ExternalLink, ShieldCheck } from 'lucide-react';
import { ResourceItem } from '../types';

interface ResourceCardProps {
  resource: ResourceItem;
  onSelect: (resource: ResourceItem) => void;
  onCall: (phone: string, resourceName: string) => void;
  isVerified?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onSelect,
  onCall,
  isVerified = false
}) => {
  const verifiedRecord = Boolean(resource.isVerified ?? isVerified);
  return (
    <article
      id={`res-${resource.id}`}
      className="resource-card flex flex-col justify-between"
    >
      <div>
        <header className="resource-header flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="resource-category-tag">{resource.categoryLabel}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              {resource.district}
            </span>
          </div>
          <span className="resource-cost-badge shrink-0">{resource.cost}</span>
        </header>

        <h2 className="resource-title">{resource.name}</h2>
        <p className="resource-tagline">{resource.tagline}</p>

        <address className="resource-contact-block mt-3 space-y-1.5 not-italic">
          <div className="resource-contact-row">
            <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
            <a
              href={`tel:${resource.phone.replace(/[^\d+]/g, '')}`}
              onClick={(e) => {
                e.preventDefault();
                onCall(resource.phone, resource.name);
              }}
              className="resource-contact-link"
              title={`Call ${resource.name} at ${resource.phone}`}
            >
              {resource.phone}
            </a>
          </div>

          <div className="resource-contact-row">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
            <span className="truncate">{resource.address}</span>
          </div>

          <div className="resource-contact-row">
            <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
            <time className="truncate">{resource.hours}</time>
          </div>
        </address>

        <section className="offerings-section mt-3 pt-2.5 border-t border-stone-100" aria-label="Services offered">
          <strong className="offerings-heading block text-[11px] font-bold text-stone-800 uppercase tracking-wide mb-1.5 font-mono">
            Key Services:
          </strong>
          <ul className="offerings-grid">
            {resource.keyServices.slice(0, 4).map((svc, i) => (
              <li key={i} className="offering-item" title={svc}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span className="truncate">{svc}</span>
              </li>
            ))}
          </ul>
        </section>

        {verifiedRecord ? (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/70 px-2.5 py-1 rounded-lg border border-emerald-200/60 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{resource.verificationDate || 'Verified Record'}</span>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-stone-600 bg-stone-100/80 px-2.5 py-1 rounded-lg border border-stone-200 font-mono">
            <span className="w-2 h-2 rounded-full bg-stone-400 shrink-0" aria-hidden="true" />
            <span>Unverified Listing</span>
          </div>
        )}
      </div>

      <footer className="resource-footer mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelect(resource)}
          className="btn btn-outline text-xs cursor-pointer"
          aria-haspopup="dialog"
        >
          More details
        </button>

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
};
