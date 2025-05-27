import React from 'react';

// This is a very basic placeholder for a toaster system.
// A real toaster system would be more complex, managing a list of toasts, animations, etc.

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error';
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onDismiss }) => {
  // Basic styling, would typically be more sophisticated
  const style: React.CSSProperties = {
    padding: '10px',
    margin: '10px 0',
    border: '1px solid',
    borderColor: type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue',
    color: type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue',
    background: '#f0f0f0',
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
  };

  return (
    <div style={style}>
      {message}
      {onDismiss && <button onClick={onDismiss} style={{ marginLeft: '10px' }}>X</button>}
    </div>
  );
};

// Placeholder for a toaster container hook or component if needed
export const Toaster: React.FC = () => {
  // In a real app, this would manage and display multiple toasts
  // For now, it's just a conceptual placeholder
  return null; 
};

// Example hook to show a toast (very simplified)
// export const useToast = () => {
//   return {
//     showToast: (message: string, type?: 'info' | 'success' | 'error') => {
//       // This would typically interact with a global state or context to add a toast
//       console.log(`Toast: ${message} (Type: ${type})`);
//       // A real implementation would render <Toast ... /> via a portal or state management
//     }
//   };
// };

export default Toast; // Exporting Toast as default, but a real system might have a Toaster component as default
