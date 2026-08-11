// ThemeToggle.jsx
import React from 'react';
import { useTheme } from './ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="sr-btn-secondary">
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
}