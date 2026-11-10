import React, { useEffect, useRef } from 'react';
import {
  X,
  Phone,
  MapPin,
  Clock,
  Globe,
  CheckCircle2,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Info
} from 'lucide-react';
import { ResourceItem } from '../types';

interface ResourceDetailsProps {
  resource: ResourceItem;
  onClose: () => void;
  onCall: (phone: string, resourceName: string) => void;
  isQuickChecked?: boolean;
  onQuickCheck?: (id: string) => void;
  onSuggestUpdate?: (resourceName: string) => void;
}

export const ResourceDetails: React.FC<ResourceDetailsProps> = ({
  resource,
  onClose,
  onCall,
  isQuickChecked = false,
  onQuickCheck,
  onSuggestUpdate
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Store trigger element and focus modal on mount; restore on unmount
  useEffect(() => {
    triggerElementRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    return () => {
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        triggerElementRef.current.focus();
      }
    };
  }, []);

  // Keyboard focus trap & Escape key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="active-resource-title"
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="modal-dialog space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="modal-close"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="resource-category-tag">
              {resource.categoryLabel}
            </span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              {resource.district}
            </span>
            <span className="resource-cost-badge">
              {resource.cost}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              {resource.verificationDate || 'Verified Listing'}
            </span>
          </div>

          <h3 id="active-resource-title" className="text-xl font-bold font-serif text-stone-900 mt-1">
            {resource.name}
          </h3>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
            {resource.description}
          </p>

          {resource.verificationSource && (
            <div className="text-[11px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-200/70 mt-2 font-mono">
              <strong>Verification Source:</strong> {resource.verificationSource}
            </div>
          )}
        </div>

        <address className="resource-contact-block bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2 not-italic">
          <div className="resource-contact-row">
            <Phone className="w-4 h-4 text-stone-400 shrink-0" aria-hidden="true" />
            <a
              href={`tel:${resource.phone.replace(/[^\d+]/g, '')}`}
              onClick={(e) => {
                e.preventDefault();
                onCall(resource.phone, resource.name);
              }}
              className="resource-contact-link text-stone-900 font-semibold hover:text-amber-800"
              title={`Call ${resource.name} at ${resource.phone}`}
            >
              {resource.phone}
            </a>
          </div>

          <div className="resource-contact-row">
            <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-stone-800">{resource.address}</span>
          </div>

          <div className="resource-contact-row">
            <Clock className="w-4 h-4 text-stone-400 shrink-0" aria-hidden="true" />
            <span className="text-stone-800">{resource.hours}</span>
          </div>

          {resource.website && (
            <div className="resource-contact-row">
              <Globe className="w-4 h-4 text-stone-400 shrink-0" aria-hidden="true" />
              <a
                href={resource.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-800 hover:text-amber-950 font-semibold inline-flex items-center gap-1 underline text-xs"
              >
                <span>Visit Official Website</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          )}
        </address>

        {/* Provider-specific eligibility details */}
        <div className="p-3 rounded-xl border space-y-1 bg-stone-50 border-stone-200">
          <h4 className="text-xs font-bold text-amber-950 font-mono uppercase flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-800" />
            <span>Eligibility &amp; Who Can Receive Help</span>
          </h4>
          <p className="text-xs text-stone-700 leading-relaxed">
            {resource.eligibility}
          </p>
        </div>

        {/* Intake requirements checklist */}
        {resource.intakeRequirements && resource.intakeRequirements.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-stone-900 font-mono uppercase mb-1">
              What to bring / Intake documents
            </h4>
            <ul className="text-xs text-stone-600 space-y-1">
              {resource.intakeRequirements.map((req, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Key services offered */}
        <div>
          <h4 className="text-xs font-bold text-stone-900 font-mono uppercase mb-1">
            Services &amp; Offerings
          </h4>
          <ul className="text-xs text-stone-600 space-y-1">
            {resource.keyServices.map((svc, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>{svc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Source verification link */}
        {resource.sourceUrl && (
          <div className="text-xs text-stone-500 pt-1 flex items-center justify-between border-t border-stone-100">
            <span className="font-mono text-[11px]">Primary Source Record:</span>
            <a
              href={resource.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-800 hover:text-amber-950 font-medium inline-flex items-center gap-1 underline text-[11px] font-mono break-all"
            >
              <span>{resource.sourceUrl.replace(/^https?:\/\//, '').slice(0, 32)}...</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        )}

        {/* Accuracy and community feedback check */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-semibold text-stone-800 block">Is this listing up to date?</span>
            <span className="text-[11px] text-stone-500">
              Community confirmations help neighbors know contact info and hours remain active.
            </span>
          </div>

          {isQuickChecked ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs shrink-0">
              <CheckCircle2 className="w-4 h-4" /> Thank you for confirming!
            </span>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onQuickCheck && onQuickCheck(resource.id)}
                className="px-2.5 py-1 bg-white border border-stone-300 hover:bg-stone-100 rounded text-[11px] font-semibold text-stone-700 flex items-center gap-1 cursor-pointer"
              >
                <ThumbsUp className="w-3 h-3 text-emerald-600" /> Confirm this information looks correct
              </button>
              <button
                type="button"
                onClick={() => onSuggestUpdate && onSuggestUpdate(resource.name)}
                className="px-2.5 py-1 bg-white border border-stone-300 hover:bg-stone-100 rounded text-[11px] font-semibold text-stone-700 flex items-center gap-1 cursor-pointer"
              >
                <ThumbsDown className="w-3 h-3 text-amber-700" /> Suggest update
              </button>
            </div>
          )}
        </div>

        <footer className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline text-xs cursor-pointer"
          >
            Close
          </button>
          <a
            href={`tel:${resource.phone.replace(/[^\d+]/g, '')}`}
            onClick={(e) => {
              e.preventDefault();
              onCall(resource.phone, resource.name);
            }}
            className="btn btn-primary text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Call {resource.phone}</span>
          </a>
        </footer>
      </div>
    </div>
  );
};
