import React from 'react';
import { PdfSettingsProvider, usePdfSettings } from './hooks/usePdfSettings';
import Header from './components/Header';
import PdfUploader from './components/PdfUploader';
import ThemeSettings from './components/ThemeSettings';
import PreviewCanvas from './components/PreviewCanvas';
import PdfControls from './components/PdfControls';
import Loading from './components/Loading';
import Messages from './components/Messages';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    console.error('Error caught by boundary:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error:', error, 'Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h1>Something went wrong</h1>
          <p>Please try reloading the page or uploading a different PDF</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { messages } = usePdfSettings();
  
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <div className="left-panel">
          <PdfUploader />
          <ThemeSettings />
        </div>
        <div className="right-panel">
          <PreviewCanvas />
          <PdfControls />
        </div>
      </main>
      <Loading />
      <Messages messages={messages} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <PdfSettingsProvider>
        <AppContent />
      </PdfSettingsProvider>
    </ErrorBoundary>
  );
};

export default App;