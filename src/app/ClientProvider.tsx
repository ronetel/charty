'use client';

import { customTheme, getThemeTokens } from '../theme';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import React, { Suspense, useState, useEffect } from 'react'

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {

    const savedTheme = localStorage.getItem('appTheme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    setMounted(true);

    const handleThemeChange = (event: CustomEvent) => {
      setTheme(event.detail.theme);
    };

    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, []);

  const currentThemeTokens = getThemeTokens(theme);
  const dynamicTheme = extendTheme({
    semanticTokens: currentThemeTokens,
    breakpoints: customTheme.config?.breakpoints || {},
    fonts: customTheme.fonts,
    styles: customTheme.styles,
  });

  if (!mounted) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ChakraProvider theme={customTheme}>
          {children}
        </ChakraProvider>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChakraProvider theme={dynamicTheme}>
        {children}
      </ChakraProvider>
    </Suspense>
  )
}

export default ClientProvider