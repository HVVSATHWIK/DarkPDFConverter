import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  // Add other props like 'size' if needed
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'default', className, ...props }) => {
  // Basic styling - a real UI library button would have much more sophisticated styling and variants
  const baseStyle = 'font-bold py-2 px-4 rounded';
  let variantStyle = '';

  switch (variant) {
    case 'destructive':
      variantStyle = 'bg-red-500 hover:bg-red-700 text-white';
      break;
    case 'outline':
      variantStyle = 'bg-transparent hover:bg-gray-100 text-blue-700 border border-blue-500';
      break;
    // Add other variants as needed
    case 'default':
    default:
      variantStyle = 'bg-blue-500 hover:bg-blue-700 text-white';
      break;
  }

  return (
    <button className={`${baseStyle} ${variantStyle} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
