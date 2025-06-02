import { useState, useEffect } from 'react';

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

// Hook to persist dialog state across page reloads
export function useDialogState(dialogKey: string) {
  const [isOpen, setIsOpen] = useState(false);

  // Load dialog state from sessionStorage on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem(`dialog_${dialogKey}`);
    if (savedState === 'true') {
      setIsOpen(true);
    }
  }, [dialogKey]);

  // Save dialog state to sessionStorage whenever it changes
  useEffect(() => {
    if (isOpen) {
      sessionStorage.setItem(`dialog_${dialogKey}`, 'true');
    } else {
      sessionStorage.removeItem(`dialog_${dialogKey}`);
    }
  }, [isOpen, dialogKey]);

  return [isOpen, setIsOpen] as const;
} 