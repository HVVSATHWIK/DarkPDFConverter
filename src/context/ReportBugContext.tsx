import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

export interface OperationContext {
  toolName?: string;
  pageCount?: number;
  fileSizeMb?: string;
  lastError?: string;
  operationStatus?: 'success' | 'failed' | 'user_disliked';
  settingsUsed?: Record<string, unknown>;
  [key: string]: unknown;
}

interface OpenModalParams {
  triggerElement?: HTMLElement | null;
  operationContext?: OperationContext;
}

interface ReportBugContextType {
  isOpen: boolean;
  openModal: (params?: HTMLElement | null | OpenModalParams) => void;
  closeModal: () => void;
  operationContext: OperationContext | null;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
}

const ReportBugContext = createContext<ReportBugContextType | undefined>(undefined);

export const ReportBugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [operationContext, setOperationContext] = useState<OperationContext | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openModal = useCallback((params?: HTMLElement | null | OpenModalParams) => {
    let el: HTMLElement | null = null;
    let contextData: OperationContext | null = null;

    if (params) {
      if ('nodeType' in params) {
        el = params as HTMLElement;
      } else if (typeof params === 'object') {
        el = params.triggerElement || null;
        contextData = params.operationContext || null;
      }
    }

    if (el) {
      triggerRef.current = el;
    } else if (document.activeElement instanceof HTMLElement) {
      triggerRef.current = document.activeElement;
    }

    setOperationContext(contextData);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Restore focus to trigger element after modal closes
    setTimeout(() => {
      if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
        triggerRef.current.focus();
      }
    }, 50);
  }, []);

  return (
    <ReportBugContext.Provider
      value={{ isOpen, openModal, closeModal, operationContext, triggerRef }}
    >
      {children}
    </ReportBugContext.Provider>
  );
};

export const useReportBug = (): ReportBugContextType => {
  const context = useContext(ReportBugContext);
  if (!context) {
    throw new Error('useReportBug must be used within a ReportBugProvider');
  }
  return context;
};
