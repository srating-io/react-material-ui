import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, Themes } from '../src/contexts/themeContext.tsx';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: Themes;
}

const AllTheProviders = ({ children, theme = 'dark' }: { children: React.ReactNode; theme?: Themes }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export const renderWithTheme = (
  ui: ReactElement,
  { theme = 'dark', ...options }: CustomRenderOptions = {}
) => {
  return render(ui, {
    wrapper: ({ children }) => <AllTheProviders theme={theme}>{children}</AllTheProviders>,
    ...options,
  });
};

export * from '@testing-library/react';
export { renderWithTheme as render };
