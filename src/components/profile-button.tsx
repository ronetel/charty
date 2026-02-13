import React, { useState, useEffect } from 'react';
import { Button, Box, Flex, Text } from '@chakra-ui/react';
import { HiOutlineUser } from 'react-icons/hi2';
import Link from 'next/link';
import { User } from '../interface';
import { COLORS, TRANSITIONS } from '../theme';

interface Props {
  onClickSignIn?: () => void;
  className?: string;
}

export const ProfileButton: React.FC<Props> = ({ className, onClickSignIn }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = () => {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (mounted) setUser(parsed);
        } catch (e) {
          if (mounted) setUser(null);
        }
      } else {
        if (mounted) setUser(null);
      }
      if (mounted) setLoading(false);
    };
    load();

    const handleStorage = () => load();
    window.addEventListener('storage', handleStorage);
    return () => { mounted = false; window.removeEventListener('storage', handleStorage); };
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Flex align='center' gap={2} className={className}>
      {!user ? (
        <Button
          onClick={onClickSignIn}
          bg={COLORS.blue}
          color={COLORS.white}
          _hover={{ bg: 'blue.600' }}
          size='sm'
          display='flex'
          alignItems='center'
          gap={2}
        >
          <HiOutlineUser size={16} />
          <Text>Войти</Text>
        </Button>
      ) : (
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <Button
            bg={COLORS.darkLight}
            color={COLORS.white}
            _hover={{ bg: COLORS.darkSoft, transition: TRANSITIONS.mainTransition }}
            size='sm'
            display='flex'
            alignItems='center'
            gap={2}
          >
            <HiOutlineUser size={16} />
            <Text>{(user as any).login || (user as any).name}</Text>
          </Button>
        </Link>
      )}
    </Flex>
  );
};