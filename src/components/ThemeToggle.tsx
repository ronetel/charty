import React, { useContext } from 'react';
import { Button, Icon, Flex } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { COLORS, TRANSITIONS } from '../../theme';
import { ThemeContext } from '../../context/ThemeContext';

export const ThemeToggle = () => {
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    return null;
  }

  const { isDarkMode, toggleTheme } = themeContext;

  return (
    <Button
      onClick={toggleTheme}
      bg={COLORS.darkLight}
      color={COLORS.white}
      _hover={{ bg: COLORS.darkSoft, transition: TRANSITIONS.mainTransition }}
      size='sm'
      display='flex'
      alignItems='center'
      gap={2}
    >
      {isDarkMode ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
};
