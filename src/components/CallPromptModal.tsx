// Import React for rendering the device-aware phone dialing modal
import React from 'react';
// Import Lucide icons for call action, clipboard copy, device notice, and checkmark
import { PhoneCall, Copy, AlertCircle, Check } from 'lucide-react';

// Props interface defining telephone details and dialog callbacks
interface CallPromptModalProps {
  // Controls whether the modal overlay is mounted
  isOpen: boolean;
  // Formatted display phone number (e.g., (770) 887-1098)
  phone: string;
  // Stripped numeric/plus phone string safe for tel: links
  cleanedPhone: string;
  // Name of the organization or helpline being dialed
  resourceName: string;
  // True when user agent indicates a mobile phone or tablet
  isMobile: boolean;
  // True once the phone number has been copied to the clipboard
  copied: boolean;
  // Callback closing the modal dialog
  onClose: () => void;
  // Callback copying the phone number manually to clipboard
  onCopy: () => void;
}

// Accessible confirmation modal helping desktop and mobile visitors dial safely
export const CallPromptModal: React.FC<CallPromptModalProps> = ({
  isOpen,
  phone,
  cleanedPhone,
  resourceName,
  isMobile,
  copied,
  onClose,
  onCopy
}) => {
  // Do not render DOM nodes when the modal is closed
  if (!isOpen) return null;

  return (
    // Backdrop overlay closing the dialog when clicked outside
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-call-title"
      className="modal-overlay"
      onClick={onClose}
    >
      {/* Modal card preventing click propagation to the backdrop */}
      <div
        className="modal-dialog max-w-md space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header with phone icon, context-aware heading, and formatted number */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-amber-100 text-amber-900 shrink-0">
            <PhoneCall className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <h3 id="modal-call-title" className="text-lg font-bold font-serif text-stone-900 leading-tight">
              {isMobile ? `Call ${resourceName}` : 'Calling from this computer?'}
            </h3>
            <span className="text-xs text-stone-500 font-mono font-medium block">
              {phone}
            </span>
          </div>
        </div>

        {/* Device guidance panel and automatic clipboard confirmation strip */}
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-4 text-xs text-stone-700 space-y-2.5 leading-relaxed">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-800" />
            <div className="space-y-1">
              <p className="font-semibold text-stone-900">
                {isMobile
                  ? 'Your smartphone dialer will open with this verified number.'
                  : 'Desktop Browser Notice:'}
              </p>
              <p className="text-[11.5px] text-stone-600">
                {isMobile
                  ? 'Tap below to place your call directly.'
                  : 'Clicking will launch your computer’s default calling app (FaceTime, Skype, Phone Link, etc.).'}
              </p>
            </div>
          </div>

          {/* Clipboard readiness status bar */}
          <div className="pt-2 border-t border-amber-200/90 flex items-center justify-between gap-2 text-xs text-stone-600 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Number copied to clipboard: {phone}</span>
            </span>
            <span className="text-[11.5px] text-stone-500 hidden sm:inline">Ready to paste</span>
          </div>
        </div>

        {/* Dialog action buttons: launch dialer, copy number, or dismiss */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          {/* Primary button triggering the operating system tel: URI handler */}
          <button
            type="button"
            onClick={() => {
              try {
                // Attempt to open the native phone or calling application
                window.location.href = `tel:${cleanedPhone}`;
              } catch {
                // Ignore browser security blocks in restricted iframes
              }
            }}
            className="btn btn-primary text-xs sm:text-sm flex-1 justify-center py-3 inline-flex items-center gap-2 font-bold cursor-pointer shadow-sm hover:scale-[1.01] transition-transform"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{isMobile ? `Call ${phone}` : 'Yes, Open Calling App'}</span>
          </button>

          {/* Secondary button copying the phone number manually */}
          <button
            type="button"
            onClick={onCopy}
            className="btn btn-outline text-xs sm:text-sm justify-center py-3 inline-flex items-center gap-2 cursor-pointer font-semibold bg-stone-50 hover:bg-stone-100"
          >
            <Copy className="w-4 h-4 text-stone-500" />
            <span>{copied ? 'Copied to Clipboard!' : (isMobile ? 'Copy Number' : 'No, Just Copy Number')}</span>
          </button>

          {/* Dismiss button closing the dialog */}
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost text-xs justify-center py-3 text-stone-500 hover:text-stone-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
