'use client';

import React from 'react';
import { User } from '../interface';
import { COLORS } from '../theme';
import { Box, VStack, Stack, Button, Text, Input, useToast, Flex, HStack } from '@chakra-ui/react';
import { profileUpdateSchema } from '../lib/validations';

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
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const toast = useToast();

  const handleSave = async () => {
    setErrors({});

    // Валидация данных
    const validationResult = profileUpdateSchema.safeParse({
      id: user.id,
      login: login.trim(),
      email: email.trim(),
      name: (user as any).name,
    });

    if (!validationResult.success) {
      const newErrors: Record<string, string> = {};
      validationResult.error.issues.forEach(err => {
        const path = err.path[0] as string;
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          id: user.id,
          login: login.trim(),
          email: email.trim()
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error');
      }

      const data = await res.json();

      // Обновим данные на сервере и заново запросим профиль
      const profileRes = await fetch('/api/user/profile', {
        headers: { 'authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData.user);
      }

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
        description: error instanceof Error ? error.message : 'Ошибка при обновлении данных',
        status: 'error',
        duration: 5,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  // Смена пароля в профиле
  const [newPassword, setNewPassword] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [changingPassword, setChangingPassword] = React.useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || currentPassword.length < 6) {
      toast({ title: 'Ошибка', description: 'Введите текущий пароль (мин. 6 символов)', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast({ title: 'Ошибка', description: 'Новый пароль должен быть минимум 6 символов', status: 'error', duration: 3000, isClosable: true });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server error');
      }
      setNewPassword('');
      setCurrentPassword('');
      toast({ title: 'Успех', description: 'Пароль изменён', status: 'success', duration: 3000, isClosable: true });
    } catch (e: any) {
      console.error('Change password error', e);
      toast({ title: 'Ошибка', description: e?.message || 'Не удалось изменить пароль', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setChangingPassword(false);
    }
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
      try { window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } })); } catch (e) {}
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
            borderColor={errors.login ? 'red.500' : COLORS.darkSoft}
            border={errors.login ? '1px solid' : undefined}
            _focus={{ borderColor: COLORS.blue, boxShadow: `0 0 0 1px ${COLORS.blue}` }}
          />
          {errors.login && (
            <Text fontSize='xs' color='red.400' mt={1}>{errors.login}</Text>
          )}
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
            borderColor={errors.email ? 'red.500' : COLORS.darkSoft}
            border={errors.email ? '1px solid' : undefined}
            _focus={{ borderColor: COLORS.blue, boxShadow: `0 0 0 1px ${COLORS.blue}` }}
          />
          {errors.email && (
            <Text fontSize='xs' color='red.400' mt={1}>{errors.email}</Text>
          )}
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
        <Box w='full'>
          <Text fontSize='sm' color={COLORS.gray} mb={2}>Сменить пароль</Text>
          <Input
            type='password'
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder='Текущий пароль'
            bg={COLORS.dark}
            color={COLORS.white}
            borderColor={COLORS.darkSoft}
            _focus={{ borderColor: COLORS.blue }}
            mb={2}
          />
          <Input
            type='password'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder='Новый пароль'
            bg={COLORS.dark}
            color={COLORS.white}
            borderColor={COLORS.darkSoft}
            _focus={{ borderColor: COLORS.blue }}
          />
          <Button mt={2} size='sm' bg={COLORS.blue} color={COLORS.white} isLoading={changingPassword} onClick={handleChangePassword}>Сменить пароль</Button>
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
