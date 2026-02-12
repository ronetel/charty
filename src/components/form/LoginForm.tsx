import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Modal,
  Text,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Stack,
  VStack,
} from '@chakra-ui/react';
import { COLORS, TRANSITIONS } from '../../theme';

const LoginForm = ({ isOpen, onClose, onSwitchToRegister }: { isOpen: boolean; onClose: () => void; onSwitchToRegister?: () => void; }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const doLogin = async () => {
    if (!login.trim() || !password.trim()) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Ошибка входа');
        return;
      }

      const data = await res.json();
      const token = data.token;
      const serverUser = data.user;

      const currentUser = {
        id: serverUser.id,
        login: serverUser.login || login,
        email: serverUser.email || '',
        games: [],
        wishlist: [],
        paymentMethods: [],
      };

      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('token', token);

      alert('Пользователь успешно вошёл');
      onClose();
      window.location.reload();
    } catch (e) {
      console.error('Login error', e);
      alert('Ошибка входа');
    }
  };

  return (
    <>
      {isOpen && (
        <Modal onClose={onClose} isOpen={true} isCentered>
          <ModalOverlay bg={COLORS.modalOverlay} />
          <ModalContent bg={COLORS.dark} borderRadius="10px" border="1px solid" borderColor={COLORS.darkSoft} p={6}>
            <ModalCloseButton />
            <ModalBody p={0}>
              <Text textAlign="center" fontSize="24px" fontWeight="bold" mb={6}>Вход</Text>
              <VStack spacing="10px" mb="24px">
                <Input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Логин" h="42px" bg={COLORS.darkLight} color={COLORS.white} />
                <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" h="42px" type="password" bg={COLORS.darkLight} color={COLORS.white} />
              </VStack>

              <Stack>
                <Button onClick={doLogin} mb="10px" bg={COLORS.darkSoft} h="42px" color={COLORS.white} w="100%" fontSize="18px" transition={TRANSITIONS.mainTransition} _hover={{ bg: COLORS.darkLight, color: COLORS.gray }}>Войти</Button>

                <Text mb="8px" textAlign="center" fontSize="14px">Нет аккаунта? <Box as="span" cursor="pointer" color={COLORS.blue} onClick={() => { onClose(); onSwitchToRegister && onSwitchToRegister(); }}>Зарегистрироваться</Box></Text>
              </Stack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default LoginForm;
