'use client';

import { useTheme } from '../contexts/themeContext.tsx';

const sanitizeCssValue = (val: string | undefined): string => {
  if (!val || typeof val !== 'string') return '';
  return val.replace(/<\/style/gi, '');
};

export const UXBaseline = () => {
  const theme = useTheme();
  const primaryColor = sanitizeCssValue(theme.text.primary);
  const backgroundColor = sanitizeCssValue(theme.background.main);

  return (
    <style>{`
      html {
        box-sizing: border-box;
        -webkit-text-size-adjust: 100%;
        font-size: 16px; 
      }

      *, *::before, *::after {
        box-sizing: inherit;
      }

      body {
        margin: 0; /* Remove browser default 8px margin */
        color: ${primaryColor};
        background-color: ${backgroundColor};
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-family: "Roboto", "Helvetica", "Arial", sans-serif;
        font-size: 1rem;
      }

      /* Consistent bolding */
      b, strong {
        font-weight: 700;
      }

      /* Remove default button/input borders to start from zero */
      button, input, select, textarea {
        font-family: inherit;
        font-size: 0.75rem;
        line-height: inherit;
        margin: 0;
      }

      img {
        display: block;
        max-width: 100%;
      }
    `}</style>
  );
};
