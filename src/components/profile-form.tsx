'use client';

import React from 'react';
import { User } from '../interface';
import { COLORS } from '../theme';
import { Box, VStack, Stack, Button, Text, Input, useToast, Flex, HStack } from '@chakra-ui/react';

interface Props {
  user: User;
  setUser: (user: User) => void;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

export default function ProfileForm({ user, setUser, theme = 'dark', onThemeChange }: Props) {
  const [login, setLogin] = React.useState((user as any).login || '');
  const [email, setEmail] = React.useState(user.email);
  const [loading, setLoading] = React.useState(false);
  const [currentTheme, setCurrentTheme] = React.useState<'light' | 'dark'>(theme);
  const toast = useToast();

  const handleSave = async () => {
    if (!login.trim() || !email.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        status: 'error',
        duration: 5,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, login: login.trim(), email: email.trim() }),
      });

      if (!res.ok) {
        throw new Error('Server error');
      }

      const data = await res.json();

      const updatedUser = {
        ...user,
        login: login.trim(),
        email: email.trim(),
        ...(data.user || {}),
      };

      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast({
        title: 'Успех',
        description: 'Данные обновлены',
        status: 'success',
        duration: 5,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Ошибка',
        description: 'Ошибка при обновлении данных',
        status: 'error',
        duration: 5,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  const handleThemeToggle = async () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    localStorage.setItem('appTheme', newTheme);
    onThemeChange?.(newTheme);

    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ theme: newTheme }),
      });
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <Box bg={COLORS.darkLight} p={6} borderRadius='lg'>
      <Text fontSize='lg' fontWeight='bold' mb={6}>Личные данные</Text>

      <VStack spacing={4}>
        <Box w='full'>
          <Text fontSize='sm' color={COLORS.gray} mb={2}>Логин *</Text>
          <Input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder='Логин'
            bg={COLORS.dark}
            color={COLORS.white}
            borderColor={COLORS.darkSoft}
            _focus={{ borderColor: COLORS.blue, boxShadow: `0 0 0 1px ${COLORS.blue}` }}
          />
        </Box>

        <Box w='full'>
          <Text fontSize='sm' color={COLORS.gray} mb={2}>Email *</Text>
          <Input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='your@email.com'
            bg={COLORS.dark}
            color={COLORS.white}
            borderColor={COLORS.darkSoft}
            _focus={{ borderColor: COLORS.blue, boxShadow: `0 0 0 1px ${COLORS.blue}` }}
          />
        </Box>

        <Box w='full'>
          <Text fontSize='sm' color={COLORS.gray} mb={2}>Тема</Text>
          <Flex
            align='center'
            justify='space-between'
            bg={COLORS.dark}
            p={3}
            borderRadius='md'
            border='1px solid'
            borderColor={COLORS.darkSoft}
          >
            <HStack spacing={2}>
              <Text fontSize='xl'>{currentTheme === 'dark' ? '🌙' : '☀️'}</Text>
              <Text color={COLORS.white}>
                {currentTheme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}
              </Text>
            </HStack>
            <Button
              size='sm'
              bg={COLORS.blue}
              color={COLORS.white}
              _hover={{ bg: 'blue.600' }}
              onClick={handleThemeToggle}
            >
              Изменить
            </Button>
          </Flex>
        </Box>

        <Stack width='full' spacing={2}>
          <Button
            w='full'
            bg={COLORS.blue}
            color={COLORS.white}
            _hover={{ bg: 'blue.600' }}
            isLoading={loading}
            onClick={handleSave}
          >
            Сохранить
          </Button>

          <Button
            w='full'
            bg={COLORS.darkSoft}
            color={COLORS.gray}
            _hover={{ bg: COLORS.dark }}
            onClick={handleLogout}
          >
            Выйти
          </Button>
        </Stack>
      </VStack>
    </Box>
  );
}
