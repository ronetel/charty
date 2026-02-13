import { Box, Button, Input, Modal, Text, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Stack, VStack } from "@chakra-ui/react";
import React, { useState } from "react";
import { COLORS, TRANSITIONS } from "../../theme";
import { registerValidationSchema } from "../../lib/validations";

const RegisterForm = ({ isOpen, onClose, onSwitchToLogin }: { isOpen: boolean; onClose: () => void; onSwitchToLogin?: () => void; }) => {
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<'form' | 'code'>('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Шаг 1: запрос кода на почту
  const requestVerificationCode = async () => {
    setErrors({});
    // Валидация данных перед отправкой кода
    const result = registerValidationSchema.safeParse({
      name: name.trim() || undefined,
      login: login.trim(),
      email: email.trim(),
      password: password.trim(),
      passwordConfirm: passwordConfirm.trim(),
      consent,
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
      setLoading(true);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'register', email: email.trim(), login: login.trim(), code }),
      });
      setLoading(false);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrors({ submit: err.error || 'Не удалось отправить код' });
        return;
      }
      // Переходим на шаг ввода кода
      // Сохраняем сгенерированный код локально временно (сервер не хранит код в этой реализации)
      // Пользователь введёт код из письма; при желании код можно вернуть из ответа, но для безопасности не делаем этого
      setStage('code');
    } catch (e) {
      setLoading(false);
      console.error('Send code error', e);
      setErrors({ submit: 'Ошибка отправки кода. Проверьте соединение.' });
    }
  };

  // Шаг 2: завершение регистрации с кодом
  const completeRegistrationWithCode = async () => {
    setErrors({});
    if (!verificationCode.trim()) {
      setErrors({ code: 'Введите код подтверждения' });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim() || undefined, 
          login: login.trim(), 
          email: email.trim(), 
          password: password.trim(),
          passwordConfirm: passwordConfirm.trim(),
          consent,
          code: verificationCode.trim()
        }),
      });
      setLoading(false);

      if (res.status === 409) {
        setErrors({ submit: 'Пользователь уже существует, попробуйте войти' });
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData && Array.isArray(errorData.errors)) {
          const serverErrors: Record<string, string> = {};
          errorData.errors.forEach((err: any) => {
            const p = String(err.path || '').split('.').pop() || 'submit';
            serverErrors[p] = err.message || errorData.error || 'Ошибка валидации';
          });
          setErrors(serverErrors);
          return;
        }
        setErrors({ submit: errorData.error || 'Ошибка регистрации' });
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

      alert('Регистрация успешно завершена');
      onClose();
      window.location.reload();
    } catch (e) {
      setLoading(false);
      console.error('Register error', e);
      setErrors({ submit: 'Ошибка регистрации. Проверьте соединение.' });
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
              <Text textAlign="center" fontSize="24px" fontWeight="bold" mb={6}>Регистрация</Text>
              
              {errors.submit && (
                <Box bg="red.900" color="red.100" p={3} borderRadius="md" mb={4} fontSize="sm">
                  {errors.submit}
                </Box>
              )}

              <VStack spacing="12px" mb="24px">
                                <Box w="full" display="flex" alignItems="center">
                                  <input type="checkbox" id="consent" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginRight: 8 }} />
                                  <label htmlFor="consent" style={{ color: COLORS.white, fontSize: '14px' }}>
                                    Я согласен на обработку персональных данных
                                  </label>
                                </Box>
                                {errors.consent && (
                                  <Text fontSize="xs" color="red.400" mt={1}>{errors.consent}</Text>
                                )}
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
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Эл. почта" 
                    h="42px" 
                    type="email" 
                    bg={COLORS.darkLight} 
                    color={COLORS.white}
                    borderColor={errors.email ? 'red.500' : undefined}
                    border={errors.email ? '1px solid' : undefined}
                  />
                  {errors.email && (
                    <Text fontSize="xs" color="red.400" mt={1}>{errors.email}</Text>
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

                <Box w="full">
                  <Input 
                    value={passwordConfirm} 
                    onChange={(e) => setPasswordConfirm(e.target.value)} 
                    placeholder="Подтвердите пароль" 
                    h="42px" 
                    type="password" 
                    bg={COLORS.darkLight} 
                    color={COLORS.white}
                    borderColor={errors.passwordConfirm ? 'red.500' : undefined}
                    border={errors.passwordConfirm ? '1px solid' : undefined}
                  />
                  {errors.passwordConfirm && (
                    <Text fontSize="xs" color="red.400" mt={1}>{errors.passwordConfirm}</Text>
                  )}
                </Box>
              </VStack>

              <Stack>
                {stage === 'form' ? (
                  <>
                    <Button 
                      onClick={requestVerificationCode} 
                      mb="10px" 
                      bg={COLORS.darkSoft} 
                      h="42px" 
                      color={COLORS.white} 
                      w="100%" 
                      fontSize="18px" 
                      transition={TRANSITIONS.mainTransition} 
                      _hover={{ bg: COLORS.darkLight, color: COLORS.gray }}
                      isLoading={loading}
                    >
                      Далее
                    </Button>
                    <Text mb="8px" textAlign="center" fontSize="14px">
                      Уже есть аккаунт? <Box as="span" textDecoration="underline" cursor="pointer" color={COLORS.blue} onClick={() => { onClose(); onSwitchToLogin && onSwitchToLogin(); }}>Войти</Box>
                    </Text>
                  </>
                ) : (
                  <>
                    <Box w="full">
                      <Input
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Код из письма"
                        h="42px"
                        bg={COLORS.darkLight}
                        color={COLORS.white}
                        borderColor={errors.code ? 'red.500' : undefined}
                        border={errors.code ? '1px solid' : undefined}
                      />
                      {errors.code && (
                        <Text fontSize="xs" color="red.400" mt={1}>{errors.code}</Text>
                      )}
                    </Box>

                    <Button 
                      onClick={completeRegistrationWithCode} 
                      mb="6px" 
                      bg={COLORS.blue} 
                      h="42px" 
                      color={COLORS.white} 
                      w="100%" 
                      fontSize="16px" 
                      transition={TRANSITIONS.mainTransition} 
                      _hover={{ bg: COLORS.darkLight }}
                      isLoading={loading}
                    >
                      Зарегистрироваться
                    </Button>

                    <Button variant="ghost" onClick={() => setStage('form')}>Назад</Button>
                  </>
                )}
                {errors.submit && (
                  <Text fontSize="sm" color="red.400">{errors.submit}</Text>
                )}
              </Stack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default RegisterForm;
