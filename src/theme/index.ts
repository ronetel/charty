import { extendTheme, transition } from '@chakra-ui/react';

const lightSemanticTokens = {
  colors: {
    'chakra-body-bg': '#F5F5F5',
    'primary': '#000000',
    'chakra-body-text': '#000000',
    white: '#FFFFFF',
    whiteTransparent: 'rgba(0, 0, 0, 0.4)',
    whiteTransparentLight: 'rgba(0, 0, 0, 0.2)',
    cardDarkGradient: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 30%, rgba(0, 0, 0, 0.1) 100%)',
    green: '#83FF88',
    blue: '#5599FE',
    blueHover: '#3377FE',
    yellow: '#FFEB83',
    red: '#FF8383',
    black: '#000000',
    blackLight: '#0F1011',
    dark: '#FFFFFF',
    darkLight: '#F0F0F0',
    darkSoft: '#E0E0E0',
    gray: '#666666',
    grayLight: '#CCCCCC',
    modalOverlay: 'rgba(0, 0, 0, 0.3)',
  },
};

const darkSemanticTokens = {
  colors: {
    'chakra-body-bg': '#0F1011',
    'primary': '#FFFFFF',
    'chakra-body-text': '#FFFFFF',
    white: '#FFFFFF',
    whiteTransparent: 'rgba(255, 255, 255, 0.4)',
    whiteTransparentLight: 'rgba(255, 255, 255, 0.2)',
    cardDarkGradient: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.8) 100%)',
    green: '#83FF88',
    blue: '#83B4FF',
    blueHover: '#5599FE',
    yellow: '#FFEB83',
    red: '#FF8383',
    black: '#000000',
    blackLight: '#0F1011',
    dark: '#1A1A1A',
    darkLight: '#262626',
    darkSoft: '#3B3B3B',
    gray: '#A1A1A1',
    grayLight: '#CCCCCC',
    modalOverlay: 'rgba(15, 16, 17, 0.3)',
  },
};

const semanticTokens = darkSemanticTokens;
const transitions = {
  mainTransition: '0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
};

const breakpoints = {
  sm: "30em",
  md: "48em",
  '840px': "840px",
  lg: "62em",
  xl: "80em",
  '1300px': "1300px",
  "2xl": "96em",
}

type SemanticColors = typeof semanticTokens['colors'];

type Colors = keyof SemanticColors;

type AllColors = {
  [K in Colors]: string;
};

export const COLORS: AllColors = Object.keys(semanticTokens.colors).reduce(
  (prev, color) => ({
    ...prev,
    [color as Colors]: `var(--chakra-colors-${color})`,
  }),
  {} as AllColors,
);

type SemanticTransitions = typeof transitions;

type Transitions = keyof SemanticTransitions;

type AllTransitions = {
  [K in Transitions]: string;
};

export const TRANSITIONS: AllTransitions = Object.keys(transitions).reduce(
  (prev, transition) => ({
    ...prev,
    [transition as Transitions]: `var(--chakra-transitions-${transition})`,
  }),
  {} as AllTransitions,
);

export const getThemeTokens = (theme: 'light' | 'dark') => {
  return theme === 'light' ? lightSemanticTokens : darkSemanticTokens;
};

export const customTheme = extendTheme({
  semanticTokens,
  breakpoints,
  fonts: {
    heading: `"Open Sans", sans-serif`,
    body: `"Open Sans", sans-serif`,
  },
  styles: {
    h2: {
      fontSize: '40px',
      color: COLORS.red,
      fontWeight: 800,
    }
    ,
    global: {
      'input, textarea': {
        color: 'var(--chakra-colors-chakra-body-text)'
      }
    }
  }
});