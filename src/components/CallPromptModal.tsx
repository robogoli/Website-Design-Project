import React from 'react';
import { PhoneCall, Copy, AlertCircle, Check } from 'lucide-react';

interface CallPromptModalProps {
  isOpen: boolean;
  phone: string;
  cleanedPhone: string;
  resourceName: string;
  isMobile: boolean;
  copied: boolean;
  onClose: () => void;
  onCopy: () => void;
}

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
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-call-title"
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-dialog max-w-md space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
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

          <div className="pt-2 border-t border-amber-200/90 flex items-center justify-between gap-2 text-xs text-stone-600 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Number copied to clipboard: {phone}</span>
            </span>
            <span className="text-[11.5px] text-stone-500 hidden sm:inline">Ready to paste</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              try {
                window.location.href = `tel:${cleanedPhone}`;
              } catch {
                // Ignore protocol launch failure
              }
            }}
            className="btn btn-primary text-xs sm:text-sm flex-1 justify-center py-3 inline-flex items-center gap-2 font-bold cursor-pointer shadow-sm hover:scale-[1.01] transition-transform"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{isMobile ? `Call ${phone}` : 'Yes, Open Calling App'}</span>
          </button>

          <button
            type="button"
            onClick={onCopy}
            className="btn btn-outline text-xs sm:text-sm justify-center py-3 inline-flex items-center gap-2 cursor-pointer font-semibold bg-stone-50 hover:bg-stone-100"
          >
            <Copy className="w-4 h-4 text-stone-500" />
            <span>{copied ? 'Copied to Clipboard!' : (isMobile ? 'Copy Number' : 'No, Just Copy Number')}</span>
          </button>

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
