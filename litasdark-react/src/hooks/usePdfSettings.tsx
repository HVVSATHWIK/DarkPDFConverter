import React, { 
  useState, 
  useContext, 
  createContext, 
  useEffect,
  useCallback
} from 'react';
import type { FC, ReactNode } from 'react';
import { registerMessageHandlers } from '../services/messageService';

export type Message = { id: string; type: 'info' | 'error'; text: string };
export type Theme = 'dark' | 'darker' | 'darkest';

export interface PdfSettingsContextProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
  brightness: number;
  setBrightness: (b: number) => void;
  contrast: number;
  setContrast: (c: number) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  pageCount: number;
  setPageCount: (p: number) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  removeMessage: (id: string) => void;
}

const PdfSettingsContext = createContext<PdfSettingsContextProps | null>(null);

export const PdfSettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'dark';
  });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    registerMessageHandlers(
      setLoading,
      (msg) => setMessages(prev => [...prev, msg]),
      removeMessage
    );
  }, [removeMessage]);

  return (
    <PdfSettingsContext.Provider value={{
      theme,
      setTheme,
      brightness,
      setBrightness,
      contrast,
      setContrast,
      currentPage,
      setCurrentPage,
      pageCount,
      setPageCount,
      loading,
      setLoading,
      messages,
      setMessages,
      removeMessage
    }}>
      {children}
    </PdfSettingsContext.Provider>
  );
};

export const usePdfSettings = () => {
  const context = useContext(PdfSettingsContext);
  if (!context) throw new Error('usePdfSettings must be used within a PdfSettingsProvider');
  return context;
};