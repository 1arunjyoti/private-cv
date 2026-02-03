import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

/**
 * Custom render function that wraps components with necessary providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark' | 'system';
}

/**
 * Providers wrapper for testing components
 */
function AllProviders({ children, theme = 'light' }: { children: ReactNode; theme?: string }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={theme}
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

/**
 * Render component with all required providers
 */
export function renderWithProviders(
  ui: ReactElement,
  { theme, ...options }: CustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => <AllProviders theme={theme}>{children}</AllProviders>,
    ...options,
  });
}

/**
 * Re-export everything from @testing-library/react
 */
export * from '@testing-library/react';
export { renderWithProviders as render };
