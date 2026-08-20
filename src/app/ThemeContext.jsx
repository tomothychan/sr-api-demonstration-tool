// ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import '../index.css';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 1. Check saved local storage
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) return savedTheme;

    // 2. Fallback to OS system setting
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Set the HTML attribute
    root.setAttribute('data-theme', theme);
    
    // Save to local storage
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for easy consumption
export const useTheme = () => useContext(ThemeContext);