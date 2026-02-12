import { Box, Button, Input, Modal, Text, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Stack, VStack } from "@chakra-ui/react";
import React, { useState } from "react";
import { COLORS, TRANSITIONS } from "../../theme";

const RegisterForm = ({ isOpen, onClose, onSwitchToLogin }: { isOpen: boolean; onClose: () => void; onSwitchToLogin?: () => void; }) => {
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    if (!login.trim() || !email.trim() || !password.trim()) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, login, email, password }),
      });

      if (res.status === 409) {
        alert('Пользователь уже существует, попробуйте войти');
        return;
      }

      if (!res.ok) {
        alert('Ошибка регистрации');
        return;
      }

      const data = await res.json();
      const token = data.token;
      const serverUser = data.user;

      const currentUser = { id: serverUser.id, login, email: serverUser.email, games: [], wishlist: [], paymentMethods: [] };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('token', token);

      alert('Регистрация успешно завершена');
      onClose();
      window.location.reload();
    } catch (e) {
      console.error('Register error', e);
      alert('Ошибка регистрации');
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
              <Text textAlign="center" fontSize="24px" fontWeight="bold" mb={10}>Регистрация</Text>
              <VStack spacing="10px" mb="24px">
                <Input value={login} onChange={(e) => setLogin(e.target.value)} name="login" placeholder="Логин" h="42px" bg={COLORS.darkLight} color={COLORS.white} />
                <Input value={email} onChange={(e) => setEmail(e.target.value)} name="email" placeholder="Эл. почта" h="42px" type="email" bg={COLORS.darkLight} color={COLORS.white} />
                <Input value={password} onChange={(e) => setPassword(e.target.value)} name="password" placeholder="Пароль" h="42px" type="password" bg={COLORS.darkLight} color={COLORS.white} />
              </VStack>

              <Stack>
                <Button onClick={onSubmit} mb="10px" bg={COLORS.darkSoft} h="42px" color={COLORS.white} w="100%" fontSize="18px" transition={TRANSITIONS.mainTransition} _hover={{ bg: COLORS.darkLight, color: COLORS.gray }}>Зарегистрироваться</Button>
                <Text mb="40px" textAlign="center" fontSize="14px">Уже есть аккаунт? <Box as="span" textDecoration="underline" cursor="pointer" onClick={() => { onClose(); onSwitchToLogin && onSwitchToLogin(); }}>Войти</Box></Text>
              </Stack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default RegisterForm;
