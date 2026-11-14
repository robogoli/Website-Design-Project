// Import React for rendering the neighbor name personalization modal
import React from 'react';
// Import close button icon from Lucide
import { X } from 'lucide-react';

// Props interface controlling dialog state, input value, and form handlers
interface WelcomeModalProps {
  // Controls whether the modal overlay is visible
  isOpen: boolean;
  // Draft greeting name currently typed in the input field
  tempName: string;
  // Callback updating the draft name string on each keystroke
  onTempNameChange: (name: string) => void;
  // Form submit handler saving the name to parent state and localStorage
  onSave: (e: React.FormEvent) => void;
  // Callback dismissing the dialog without saving changes
  onClose: () => void;
}

// Dialog allowing visitors to set a first name or nickname displayed in the header greeting
export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  tempName,
  onTempNameChange,
  onSave,
  onClose
}) => {
  // Skip rendering DOM markup when the modal is closed
  if (!isOpen) return null;

  return (
    // Clickable modal backdrop closing the dialog on outside click
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-welcome-title"
      className="modal-overlay"
      onClick={onClose}
    >
      {/* Modal card container stopping clicks from reaching the backdrop */}
      <div
        className="modal-dialog max-w-sm space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-right close icon button */}
        <button
          type="button"
          onClick={onClose}
          className="modal-close"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Friendly modal title and brief privacy explanation */}
        <div className="text-center space-y-1.5 pt-1">
          <h3 id="modal-welcome-title" className="text-xl font-bold font-serif text-stone-900">
            Glad you stopped by.
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            What should we call you? Your name will appear on the top banner and sign notes you submit to the community board.
          </p>
        </div>

        {/* Form capturing optional neighbor nickname */}
        <form onSubmit={onSave} className="space-y-3 pt-1">
          <fieldset>
            {/* Input label paired with live character counter */}
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="welcome-name" className="text-xs font-semibold text-stone-700">
                First name or nickname:
              </label>
              <output htmlFor="welcome-name" className="text-[11px] text-stone-400 font-mono">
                {tempName.length}/20 chars
              </output>
            </div>
            {/* Auto-focused text input capped at 20 characters */}
            <input
              type="text"
              id="welcome-name"
              maxLength={20}
              value={tempName}
              onChange={(e) => onTempNameChange(e.target.value)}
              placeholder="e.g. Sarah, Marcus, Neighbor..."
              className="form-control"
              autoFocus
            />
          </fieldset>

          {/* Submit and cancel action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="btn btn-primary flex-1 justify-center py-2.5 text-xs font-bold cursor-pointer shadow-xs"
            >
              Save Name
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline justify-center py-2.5 text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
