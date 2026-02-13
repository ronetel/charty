'use client';

import React from 'react';
import { User } from '../interface';
import { COLORS } from '../theme';
import { Box, VStack, Stack, Button, Text, Input, Flex, Badge, useToast } from '@chakra-ui/react';
import { IoClose } from 'react-icons/io5';

interface Props {
  user: User;
  setUser: (user: User) => void;
}

export default function PaymentMethods({ user, setUser }: Props) {
  const [isAddingCard, setIsAddingCard] = React.useState(false);
  const [cardNumber, setCardNumber] = React.useState('');
  const [cardHolder, setCardHolder] = React.useState('');
  const [expiryDate, setExpiryDate] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editHolder, setEditHolder] = React.useState('');
  const [editExpiry, setEditExpiry] = React.useState('');
  const toast = useToast();

  const handleAddCard = async () => {
    // basic validation
    const num = cardNumber.trim();
    const holder = cardHolder.trim();
    const expiry = expiryDate.trim();

    if (!num || !holder || !expiry) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', status: 'error', duration: 5000, isClosable: true });
      return;
    }

    if (num.length !== 16) {
      toast({ title: 'Ошибка', description: 'Номер карты должен содержать 16 цифр', status: 'error', duration: 5000, isClosable: true });
      return;
    }

    // Валидация имени владельца карты: строго Имя Фамилия (Ivan Ivanov)
    if (!/^([A-Za-zА-Яа-яЁё\-]+\s+[A-Za-zА-Яа-яЁё\-]+)$/.test(holder)) {
      toast({ title: 'Ошибка', description: 'Введите корректное имя держателя (например: Ivan Ivanov)', status: 'error', duration: 5000, isClosable: true });
      return;
    }

    // expiry MM/YY
    const expMatch = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expMatch) {
      toast({ title: 'Ошибка', description: 'Неверный формат срока (MM/YY)', status: 'error', duration: 5000, isClosable: true });
      return;
    }
    const month = parseInt(expMatch[1], 10);
    const year = parseInt(expMatch[2], 10) + 2000;
    if (month < 1 || month > 12) {
      toast({ title: 'Ошибка', description: 'Неверный месяц в сроке', status: 'error', duration: 5000, isClosable: true });
      return;
    }
    const now = new Date();
    const expDate = new Date(year, month - 1, 1);
    // set to end of month
    expDate.setMonth(expDate.getMonth() + 1);
    if (expDate <= now) {
      toast({ title: 'Ошибка', description: 'Срок карты истёк', status: 'error', duration: 5000, isClosable: true });
      return;
    }
    

    const maskedCardNumber = num.replace(/\d(?=\d{4})/g, '*');

    try {
      const res = await fetch('/api/user/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ userId: user.id, methodType: 'card', maskedData: maskedCardNumber, isDefault: !(user.paymentMethods || []).length }),
      });

      if (!res.ok) throw new Error('Server error');
      const data = await res.json();

      const serverMethod = data.method;
      const clientCard = {
        id: serverMethod.id ? String(serverMethod.id) : `card_${Date.now()}`,
        cardNumber: maskedCardNumber,
        cardHolder: cardHolder.trim(),
        expiryDate: expiryDate.trim(),
        isDefault: !!serverMethod.isDefault,
      };

      // Обновим локального пользователя
      try {
        const stored = localStorage.getItem('currentUser');
        let base = user;
        if (stored) {
          try { base = JSON.parse(stored); } catch (e) { base = user; }
        }
        const newPaymentMethods = [ ...(base.paymentMethods || []), clientCard ];
        const newUser = { ...base, paymentMethods: newPaymentMethods };
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setUser(newUser);
      } catch (e) {}

      setCardNumber('');
      setCardHolder('');
      setExpiryDate('');
      setIsAddingCard(false);

      toast({ title: 'Успех', description: 'Карта успешно добавлена', status: 'success', duration: 5, isClosable: true });
    } catch (e) {
      console.error('Add card error', e);
      toast({ title: 'Ошибка', description: 'Не удалось добавить карту', status: 'error', duration: 5, isClosable: true });
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const res = await fetch(`/api/user/payment-methods?id=${encodeURIComponent(cardId)}`, { method: 'DELETE', headers: { 'authorization': `Bearer ${localStorage.getItem('token')}` } });
      if (!res.ok) throw new Error('Server error');

      // Обновим локального пользователя
      try {
        const stored = localStorage.getItem('currentUser');
        let base = user;
        if (stored) {
          try { base = JSON.parse(stored); } catch (e) { base = user; }
        }
        const newPaymentMethods = (base.paymentMethods || []).filter((m: any) => m.id !== cardId);
        const newUser = { ...base, paymentMethods: newPaymentMethods };
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setUser(newUser);
      } catch (e) {}

      toast({ title: 'Успех', description: 'Карта удалена', status: 'success', duration: 5, isClosable: true });
    } catch (e) {
      console.error('Delete card error', e);
      toast({ title: 'Ошибка', description: 'Не удалось удалить карту', status: 'error', duration: 5, isClosable: true });
    }
  };

  const handleSetDefault = async (cardId: string) => {
    try {
      const res = await fetch('/api/user/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ id: cardId, userId: user.id, isDefault: true }),
      });
      if (!res.ok) throw new Error('Server error');

      // Обновим локального пользователя
      try {
        const stored = localStorage.getItem('currentUser');
        let base = user;
        if (stored) {
          try { base = JSON.parse(stored); } catch (e) { base = user; }
        }
        const newPaymentMethods = (base.paymentMethods || []).map((m: any) => ({ ...m, isDefault: m.id === cardId }));
        const newUser = { ...base, paymentMethods: newPaymentMethods };
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setUser(newUser);
      } catch (e) {}

      toast({ title: 'Успех', description: 'Способ оплаты установлен по умолчанию', status: 'success', duration: 5, isClosable: true });
    } catch (e) {
      console.error('Set default error', e);
      toast({ title: 'Ошибка', description: 'Не удалось установить карту по умолчанию', status: 'error', duration: 5, isClosable: true });
    }
  };

  return (
    <Box bg={COLORS.darkLight} p={6} borderRadius='lg'>
      <Text fontSize='lg' fontWeight='bold' mb={6}>Способы оплаты</Text>

      {!user.paymentMethods || user.paymentMethods.length === 0 ? (
        <VStack spacing={4}>
          <Text color={COLORS.gray} textAlign='center' py={8}>
            У вас нет привязанных карт
          </Text>
        </VStack>
      ) : (
        <VStack spacing={6} mb={6} align='start'>
          {user.paymentMethods.map((card) => {
            const c: any = card;
            const rawNumber = String(c.cardNumber || c.maskedData || c.masked_data || '');
            const formatted = rawNumber
              .replace(/(.{4})/g, '$1 ')
              .trim() || '•••• •••• •••• ••••';
            const holder = c.cardHolder || c.cardholder || c.name || '';
            const expiry = c.expiryDate || c.expiry || '';
            return (
              <Flex
                key={card.id}
                w='100%'
                p={8}
                bg={COLORS.dark}
                borderRadius='lg'
                align='center'
                boxShadow='sm'
                gap={6}
                alignSelf='flex-start'
              >
                <Box flex='1' mr={4}>
                  <Text color={COLORS.white} fontWeight='700' fontSize='lg' letterSpacing='1px'>
                    {formatted}
                  </Text>
                  <Flex gap={4} mt={2} align='center' flexWrap='wrap'>
                    {!editingId || editingId !== String(card.id) ? (
                      <>
                        <Text fontSize='sm' color={COLORS.gray}>{holder || 'Ivan Ivanov'}</Text>
                        <Text fontSize='sm' color={COLORS.gray}>{expiry ? `• ${expiry}` : ''}</Text>
                      </>
                    ) : (
                      <>
                        <Input
                          value={editHolder}
                          onChange={(e) => setEditHolder(e.target.value)}
                          size='sm'
                          placeholder='Ivan Ivanov'
                          bg={COLORS.dark}
                          color={COLORS.white}
                          borderColor={COLORS.darkSoft}
                        />
                        <Input
                          value={editExpiry}
                          onChange={(e) => setEditExpiry(e.target.value)}
                          size='sm'
                          placeholder='MM/YY'
                          bg={COLORS.dark}
                          color={COLORS.white}
                          borderColor={COLORS.darkSoft}
                        />
                      </>
                    )}
                  </Flex>
                </Box>

                <Flex gap={4} align='center' ml='auto'>
                  {editingId === String(card.id) ? (
                    <>
                      <Button size='sm' bg={COLORS.blue} color={COLORS.white} onClick={async () => {
                        // validate
                        const h = editHolder.trim();
                        const e = editExpiry.trim();
                        if (!h || !/^([A-Za-zА-Яа-яЁё\-]+\s+[A-Za-zА-Яа-яЁё\-]+)$/.test(h)) {
                          toast({ title: 'Ошибка', description: 'Введите корректное имя держателя (Имя Фамилия)', status: 'error', duration: 4000, isClosable: true });
                          return;
                        }
                        if (!/^(\d{2})\/(\d{2})$/.test(e)) {
                          toast({ title: 'Ошибка', description: 'Неверный формат срока (MM/YY)', status: 'error', duration: 4000, isClosable: true });
                          return;
                        }
                        try {
                          const res = await fetch('/api/user/payment-methods', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ id: card.id, userId: user.id, cardHolder: h, expiryDate: e }) });
                          if (!res.ok) throw new Error('Server error');
                          const data = await res.json();
                          const updated = data.method;
                          // update local
                          try {
                            const stored = localStorage.getItem('currentUser');
                            let base = user;
                            if (stored) {
                              try { base = JSON.parse(stored); } catch (e) { base = user; }
                            }
                            const newPaymentMethods = (base.paymentMethods || []).map((m: any) => m.id === updated.id ? { ...m, cardHolder: updated.cardHolder, expiryDate: updated.expiryDate } : m);
                            const newUser = { ...base, paymentMethods: newPaymentMethods };
                            localStorage.setItem('currentUser', JSON.stringify(newUser));
                            setUser(newUser);
                          } catch (e) {}
                          setEditingId(null);
                          toast({ title: 'Успех', description: 'Карта обновлена', status: 'success', duration: 3000, isClosable: true });
                        } catch (err) {
                          console.error('Update card error', err);
                          toast({ title: 'Ошибка', description: 'Не удалось обновить карту', status: 'error', duration: 3000, isClosable: true });
                        }
                      }}>Сохранить</Button>
                      <Button size='sm' variant='ghost' onClick={() => setEditingId(null)}>Отмена</Button>
                    </>
                  ) : (
                    <>
                      {card.isDefault ? (
                        <Badge bg={COLORS.blue} color={COLORS.white} fontSize='xs' px={2} py={1} borderRadius='md'>По умолчанию</Badge>
                      ) : (
                        <Button size='sm' variant='outline' onClick={() => handleSetDefault(card.id)}>Сделать по умолчанию</Button>
                      )}

                      <Button size='sm' onClick={() => { const c2: any = card; setEditingId(String(card.id)); setEditHolder(c2.cardHolder || c2.cardholder || ''); setEditExpiry(c2.expiryDate || c2.expiry || ''); }}>Изменить</Button>
                      <Button size='sm' colorScheme='red' onClick={() => handleDeleteCard(card.id)}>Удалить</Button>
                    </>
                  )}
                </Flex>
              </Flex>
            );
          })}
        </VStack>
      )}

      {!isAddingCard ? (
        <Button
          w='full'
          bg={COLORS.blue}
          color={COLORS.white}
          _hover={{ bg: 'blue.600' }}
          onClick={() => setIsAddingCard(true)}
        >
          Добавить карту
        </Button>
      ) : (
        <VStack spacing={3} p={4} bg={COLORS.dark} borderRadius='md'>
          <Box w='full'>
            <Text fontSize='sm' color={COLORS.gray} mb={2}>Номер карты</Text>
            <Input
              type='text'
              inputMode='numeric'
              value={cardNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                setCardNumber(value);
              }}
              placeholder='4111111111111111'
              bg={COLORS.dark}
              color={COLORS.white}
              borderColor={COLORS.darkSoft}
              _focus={{ borderColor: COLORS.blue }}
            />
          </Box>

          <Box w='full'>
            <Text fontSize='sm' color={COLORS.gray} mb={2}>Имя на карте</Text>
            <Input
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder='Ivan Ivanov'
              bg={COLORS.dark}
              color={COLORS.white}
              borderColor={COLORS.darkSoft}
              _focus={{ borderColor: COLORS.blue }}
            />
          </Box>

          <Box w='full'>
            <Text fontSize='sm' color={COLORS.gray} mb={2}>Срок действия (MM/YY)</Text>
            <Input
              value={expiryDate}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                  value = value.slice(0, 2) + '/' + value.slice(2, 4);
                }
                setExpiryDate(value);
              }}
              placeholder='12/25'
              bg={COLORS.dark}
              color={COLORS.white}
              borderColor={COLORS.darkSoft}
              _focus={{ borderColor: COLORS.blue }}
            />
          </Box>

          <Stack width='full' spacing={2}>
            <Button
              w='full'
              bg={COLORS.blue}
              color={COLORS.white}
              _hover={{ bg: 'blue.600' }}
              onClick={handleAddCard}
            >
              Добавить карту
            </Button>

            <Button
              w='full'
              bg={COLORS.darkSoft}
              color={COLORS.gray}
              _hover={{ bg: COLORS.dark }}
              onClick={() => {
                setIsAddingCard(false);
                setCardNumber('');
                setCardHolder('');
                setExpiryDate('');
              }}
            >
              Отмена
            </Button>
          </Stack>
        </VStack>
      )}
    </Box>
  );
}
