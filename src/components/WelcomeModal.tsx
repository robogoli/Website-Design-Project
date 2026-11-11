import React from 'react';
import { X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  tempName: string;
  onTempNameChange: (name: string) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  tempName,
  onTempNameChange,
  onSave,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-welcome-title"
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-dialog max-w-sm space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="modal-close"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5 pt-1">
          <h3 id="modal-welcome-title" className="text-xl font-bold font-serif text-stone-900">
            Glad you stopped by.
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            What should we call you? Your name will appear on the top banner and sign notes you submit to the community board.
          </p>
        </div>

        <form onSubmit={onSave} className="space-y-3 pt-1">
          <fieldset>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="welcome-name" className="text-xs font-semibold text-stone-700">
                First name or nickname:
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
              onChange={(e) => onTempNameChange(e.target.value)}
              placeholder="e.g. Sarah, Marcus, Neighbor..."
              className="form-control"
              autoFocus
            />
          </fieldset>

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
