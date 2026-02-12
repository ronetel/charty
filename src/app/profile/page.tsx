'use client';

import React from 'react';
import { Container, VStack, HStack, Box, Button, Text, useToast, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { User } from '../../interface';
import { COLORS } from '../../theme';
import { useRouter } from 'next/navigation';
import ProfileForm from '../../components/profile-form';
import OrderHistory from '../../components/order-history';
import PaymentMethods from '../../components/payment-methods';

export default function ProfilePage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');
  const router = useRouter();

  React.useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedTheme = localStorage.getItem('appTheme') as 'light' | 'dark' | null;

    if (!storedUser) {
      router.push('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (storedTheme) {
        setTheme(storedTheme);
      }
    } catch (error) {
      console.error('Failed to parse user:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);

    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
  };

  if (loading) {
    return <Container>Загрузка...</Container>;
  }

  if (!user) {
    return (
      <Container maxW="1200px" py={10}>
        <Box textAlign='center'>
          <Text fontSize='xl' mb={4}>Пожалуйста, войдите в свой аккаунт</Text>
          <Button onClick={() => router.push('/')} bg={COLORS.blue} color={COLORS.white}>
            На главную
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="1200px" py={10}>
      <HStack justify='space-between' align='center' mb={8}>
        <Text fontSize='2xl' fontWeight='bold'>Личный кабинет</Text>
        <Button
          leftIcon={<Text>←</Text>}
          bg={COLORS.darkSoft}
          color={COLORS.gray}
          _hover={{ bg: COLORS.dark }}
          onClick={() => router.push('/')}
        >
          На главную
        </Button>
      </HStack>

      <Tabs variant='soft-rounded' colorScheme='blue'>
        <TabList mb={4}>
          <Tab>Профиль</Tab>
          <Tab>Способы оплаты</Tab>
          <Tab>История заказов</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <ProfileForm user={user} setUser={setUser} theme={theme} onThemeChange={handleThemeChange} />
          </TabPanel>

          <TabPanel>
            <PaymentMethods user={user} setUser={setUser} />
          </TabPanel>

          <TabPanel>
            <OrderHistory user={user} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}

