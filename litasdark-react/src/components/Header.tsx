// Update Header.tsx
import React from 'react';

const Header: React.FC = () => (
  <header>
    <h1>LitasDark: PDF Dark Mode Converter</h1>
    {/* Use absolute path from public folder */}
    <img src="/pdfdark.jpg" alt="Logo" id="logo" />
  </header>
);

export default Header;