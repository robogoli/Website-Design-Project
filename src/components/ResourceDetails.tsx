// Import React and useEffect hook for keyboard navigation listeners
import React, { useEffect } from 'react';
// Import Lucide icons for contact fields, verification badges, eligibility, and actions
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
  Info,
  MessageSquare
} from 'lucide-react';
// Import domain types for the inspected resource and matching resident notes
import { ResourceItem, UserFeedback } from '../types';
// Import reusable focus-trap hook handling initial focus and focus restoration
import { useFocusTrap } from '../hooks/useFocusTrap';

// Props interface specifying resource data, dialog callbacks, and community notes
interface ResourceDetailsProps {
  // Complete community resource record displayed inside the dialog
  resource: ResourceItem;
  // Callback closing the details modal
  onClose: () => void;
  // Callback initiating a verified phone call prompt
  onCall: (phone: string, resourceName: string) => void;
  // True if the visitor has confirmed this listing's accuracy during this session
  isQuickChecked?: boolean;
  // Callback recording a listing accuracy confirmation
  onQuickCheck?: (id: string) => void;
  // Callback redirecting the visitor to the feedback form pre-filled with this resource
  onSuggestUpdate?: (resourceName: string) => void;
  // Full community feedback list filtered below for notes matching this organization
  feedbacks?: UserFeedback[];
}

// Accessible modal displaying complete eligibility, intake steps, verification, and neighbor notes
export const ResourceDetails: React.FC<ResourceDetailsProps> = ({
  resource,
  onClose,
  onCall,
  isQuickChecked = false,
  onQuickCheck,
  onSuggestUpdate,
  feedbacks = []
}) => {
  // Attach focus-trap hook so the first focusable control receives focus and previous focus is restored on close
  const dialogRef = useFocusTrap<HTMLDivElement>(true);

  // Extract a readable hostname from an external verification URL
  const formatDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  // Trap Tab/Shift+Tab keyboard cycling inside the modal and close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Dismiss modal immediately if user presses Escape
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Keep Tab focus cycling within interactive controls inside the dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Wrap Shift+Tab from the first control back to the last control
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Wrap forward Tab from the last control back to the first control
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    // Register global keyboard listener while modal is open
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, dialogRef]);

  // Pre-filter community board notes mentioning this organization
  const matchingNotes = feedbacks.filter(f =>
    f.resourceName && (
      f.resourceName.toLowerCase().includes(resource.name.toLowerCase()) ||
      resource.name.toLowerCase().includes(f.resourceName.toLowerCase())
    )
  );

  return (
    // Clickable backdrop closing the details sheet when clicked outside the card
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="active-resource-title"
      className="modal-overlay"
      onClick={onClose}
    >
      {/* Scrollable dialog card stopping propagation so inner clicks keep the modal open */}
      <div
        ref={dialogRef}
        className="modal-dialog space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-right close button (first focusable element trapped on mount) */}
        <button
          type="button"
          onClick={onClose}
          className="modal-close"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header badges, organization title, summary description, and audit source */}
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

        {/* Contact details card covering phone, street address, hours, and external site */}
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

        {/* Eligibility requirements summary box */}
        <div className="p-3 rounded-xl border space-y-1 bg-stone-50 border-stone-200">
          <h4 className="text-xs font-bold text-amber-950 font-mono uppercase flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-800" />
            <span>Eligibility &amp; Who Can Receive Help</span>
          </h4>
          <p className="text-xs text-stone-700 leading-relaxed">
            {resource.eligibility}
          </p>
        </div>

        {/* Intake documents checklist rendered when specific requirements exist */}
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

        {/* Complete checklist of core programs and services */}
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

        {/* Authoritative public source domain link */}
        {resource.sourceUrl && (
          <div className="text-xs text-stone-500 pt-1 flex items-center justify-between border-t border-stone-100">
            <span className="font-mono text-[11px]">Primary Source Record:</span>
            <a
              href={resource.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-800 hover:text-amber-950 font-medium inline-flex items-center gap-1 underline text-[11px] font-mono break-all"
            >
              <span>{formatDomain(resource.sourceUrl)}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        )}

        {/* Neighbor tips and community notes referencing this listing */}
        <div className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-amber-800" />
              <h3 className="font-bold text-stone-900 font-serif text-xs sm:text-sm">
                Public Community Notes ({matchingNotes.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSuggestUpdate && onSuggestUpdate(resource.name)}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
            >
              + Add note for this place
            </button>
          </div>

          {matchingNotes.length > 0 ? (
            <div className="space-y-2">
              {matchingNotes.map((note) => (
                // Individual neighbor note card inside the resource modal
                <div key={note.id} className="bg-white p-2.5 rounded-lg border border-amber-200/60 shadow-2xs space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                    <span className="font-bold text-stone-900">{note.userName}</span>
                    <time className="text-stone-400 font-mono">{note.submittedAt}</time>
                  </div>
                  <p className="text-stone-700 italic leading-relaxed text-[11.5px]">
                    &ldquo;{note.message}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-0.5 text-[10.5px] text-stone-500 font-mono">
                    <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                      {note.rating === 'Very Helpful' ? 'Wonderful' : note.rating}
                    </span>
                    {note.likesCount ? <span>· {note.likesCount} neighbors found this helpful</span> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-600">
              No notes posted for this place yet. Been here recently? <button type="button" onClick={() => onSuggestUpdate && onSuggestUpdate(resource.name)} className="text-amber-800 font-bold underline cursor-pointer">Leave a tip</button> to help other Forsyth County neighbors!
            </p>
          )}
        </div>

        {/* One-click listing accuracy confirmation and update suggestion bar */}
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

        {/* Sticky modal footer with Close and Call actions */}
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
