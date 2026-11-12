// Import React lifecycle and ref hooks for managing DOM focus trapping
import { useEffect, useRef } from 'react';

// Custom accessibility hook ensuring keyboard focus is trapped inside modal dialogs
export function useFocusTrap<T extends HTMLElement>(isOpen: boolean) {
  // Reference to the modal dialog container DOM element
  const containerRef = useRef<T>(null);
  
  // Store the element that had focus prior to the modal opening so focus can be returned
  const previousFocus = useRef<HTMLElement | null>(null);

  // Focus management effect that activates whenever modal open state changes
  useEffect(() => {
    // If the modal is closed, do not perform focus trapping
    if (!isOpen) return;

    // Capture the currently focused element before the modal took over the screen
    previousFocus.current = document.activeElement as HTMLElement | null;

    // Query all natively interactive focusable elements inside the modal container
    const focusables = containerRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    // Automatically focus the first interactive element inside the modal on render
    focusables?.[0]?.focus();

    // Cleanup function that executes when the modal is closed or unmounted
    return () => {
      // Restore keyboard focus back to the triggering element to preserve accessibility
      if (previousFocus.current && typeof previousFocus.current.focus === 'function') {
        previousFocus.current.focus();
      } else if (typeof document !== 'undefined' && document.body) {
        // Fallback to document body if previously focused element was removed from the DOM
        document.body.focus();
      }
    };
  }, [isOpen]);

  // Return the container ref for attachment to modal JSX elements
  return containerRef;
}
