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
import { loginValidationSchema } from '../../lib/validations';

const LoginForm = ({ isOpen, onClose, onSwitchToRegister }: { isOpen: boolean; onClose: () => void; onSwitchToRegister?: () => void; }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForgot, setShowForgot] = useState(false);
  const [forgotLogin, setForgotLogin] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotStage, setForgotStage] = useState<0 | 1>(0);

  const doLogin = async () => {
    setErrors({});
    
    const result = loginValidationSchema.safeParse({
      login: login.trim() || undefined,
      password: password.trim(),
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        const path = err.path[0] as string;
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          login: login.trim() || undefined, 
          password: password.trim() 
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrors({ submit: err.error || 'Ошибка входа' });
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
      setErrors({ submit: 'Ошибка входа. Проверьте соединение.' });
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
              
              {errors.submit && (
                <Box bg="red.900" color="red.100" p={3} borderRadius="md" mb={4} fontSize="sm">
                  {errors.submit}
                </Box>
              )}

              <VStack spacing="12px" mb="24px">
                <Box w="full">
                  <Input 
                    value={login} 
                    onChange={(e) => setLogin(e.target.value)} 
                    placeholder="Логин" 
                    h="42px" 
                    bg={COLORS.darkLight} 
                    color={COLORS.white}
                    borderColor={errors.login ? 'red.500' : undefined}
                    border={errors.login ? '1px solid' : undefined}
                  />
                  {errors.login && (
                    <Text fontSize="xs" color="red.400" mt={1}>{errors.login}</Text>
                  )}
                </Box>
                
                <Box w="full">
                  <Input 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Пароль" 
                    h="42px" 
                    type="password" 
                    bg={COLORS.darkLight} 
                    color={COLORS.white}
                    borderColor={errors.password ? 'red.500' : undefined}
                    border={errors.password ? '1px solid' : undefined}
                  />
                  {errors.password && (
                    <Text fontSize="xs" color="red.400" mt={1}>{errors.password}</Text>
                  )}
                </Box>
              </VStack>

              {!showForgot ? (
                <Text mb="8px" textAlign="center" fontSize="14px">
                  <Box as="span" cursor="pointer" color={COLORS.blue} onClick={() => setShowForgot(true)}>Забыли пароль?</Box>
                </Text>
              ) : (
                <VStack spacing={3} mb={4}>
                  {forgotStage === 0 ? (
                    <>
                      <Input value={forgotLogin} onChange={(e) => setForgotLogin(e.target.value)} placeholder="Логин или Email" bg={COLORS.darkLight} color={COLORS.white} />
                      <Button size="sm" onClick={async () => {
                        try {
                          const res = await fetch('/api/auth/request-reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login: forgotLogin || undefined, email: forgotEmail || forgotLogin || undefined }) });
                          if (!res.ok) {
                            const err = await res.json().catch(() => ({}));
                            throw new Error(err.error || 'Server error');
                          }
                          alert('Код отправлен на почту, проверьте ваш почтовый ящик');
                          setForgotStage(1);
                        } catch (e: any) {
                          console.error('Request reset error', e);
                          alert(e?.message || 'Не удалось отправить код');
                        }
                      }}>Запросить код</Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowForgot(false)}>Отмена</Button>
                    </>
                  ) : (
                    <>
                      <Input value={forgotCode} onChange={(e) => setForgotCode(e.target.value)} placeholder="Код из письма" bg={COLORS.darkLight} color={COLORS.white} />
                      <Input value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} placeholder="Новый пароль" type="password" bg={COLORS.darkLight} color={COLORS.white} />
                      <Button size="sm" onClick={async () => {
                        try {
                          const res = await fetch('/api/auth/confirm-reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: forgotCode, newPassword: forgotNewPassword }) });
                          if (!res.ok) {
                            const err = await res.json().catch(() => ({}));
                            throw new Error(err.error || 'Server error');
                          }
                          alert('Пароль успешно изменён. Войдите с новым паролем');
                          setShowForgot(false);
                          setForgotStage(0);
                          setForgotCode('');
                          setForgotNewPassword('');
                        } catch (e: any) {
                          console.error('Confirm reset error', e);
                          alert(e?.message || 'Не удалось сменить пароль');
                        }
                      }}>Подтвердить и сменить пароль</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setShowForgot(false); setForgotStage(0); }}>Отмена</Button>
                    </>
                  )}
                </VStack>
              )}

              <Stack>
                <Button 
                  onClick={doLogin} 
                  mb="10px" 
                  bg={COLORS.darkSoft} 
                  h="42px" 
                  color={COLORS.white} 
                  w="100%" 
                  fontSize="18px" 
                  transition={TRANSITIONS.mainTransition} 
                  _hover={{ bg: COLORS.darkLight, color: COLORS.gray }}
                >
                  Войти
                </Button>

                <Text mb="8px" textAlign="center" fontSize="14px">
                  Нет аккаунта? <Box as="span" cursor="pointer" color={COLORS.blue} onClick={() => { onClose(); onSwitchToRegister && onSwitchToRegister(); }}>Зарегистрироваться</Box>
                </Text>
              </Stack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default LoginForm;
