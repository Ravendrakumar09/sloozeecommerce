'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const storedTheme = localStorage.getItem('theme') as Theme;
    let initialTheme: Theme = 'light';
    
    if (storedTheme) {
      initialTheme = storedTheme;
    } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initialTheme = 'dark';
    }
    
    setTheme(initialTheme);
    
    // Apply theme immediately to prevent flash
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (initialTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      const root = document.documentElement;
      // Ensure the class is applied
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      // Only update localStorage if it's different (avoid unnecessary writes)
      const currentStored = localStorage.getItem('theme');
      if (currentStored !== theme) {
        localStorage.setItem('theme', theme);
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    console.log('toggleTheme called, current theme:', theme);
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('Setting theme to:', newTheme);
      
      // Apply immediately to DOM for instant feedback
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (newTheme === 'dark') {
          root.classList.add('dark');
          console.log('Added dark class to documentElement');
        } else {
          root.classList.remove('dark');
          console.log('Removed dark class from documentElement');
        }
        localStorage.setItem('theme', newTheme);
        console.log('Saved theme to localStorage:', newTheme);
      }
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

