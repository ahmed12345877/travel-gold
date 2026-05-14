import { useEffect } from 'react';
import { useThemeMode } from './ThemeModeProvider';

/**
 * Apply theme colors to document root via CSS custom properties
 * This ensures all components that use CSS variables get the correct colors
 */
export function ThemeColorsApplier() {
  const { mode } = useThemeMode();

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme mode class for CSS selector matching
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    
    // Force browser to recalculate styles
    void root.offsetHeight;
  }, [mode]);

  return null;
}
