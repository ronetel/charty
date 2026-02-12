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
  const toast = useToast();

  const handleAddCard = async () => {
    if (!cardNumber.trim() || !cardHolder.trim() || !expiryDate.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        status: 'error',
        duration: 5,
        isClosable: true,
      });
      return;
    }

    const maskedCardNumber = cardNumber.replace(/\d(?=\d{4})/g, '*');

    try {
      const res = await fetch('/api/user/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      const updatedUser = {
        ...user,
        paymentMethods: [...(user.paymentMethods || []), clientCard],
      };

      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);

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
      const res = await fetch(`/api/user/payment-methods?id=${encodeURIComponent(cardId)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Server error');

      const updatedPaymentMethods = user.paymentMethods?.filter(card => card.id !== cardId) || [];

      if (updatedPaymentMethods.length > 0) {
        const wasDefault = user.paymentMethods?.find(card => card.id === cardId)?.isDefault;
        if (wasDefault) {
          updatedPaymentMethods[0].isDefault = true;
        }
      }

      const updatedUser = { ...user, paymentMethods: updatedPaymentMethods };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cardId, userId: user.id, isDefault: true }),
      });
      if (!res.ok) throw new Error('Server error');

      const updatedPaymentMethods = user.paymentMethods?.map(card => ({ ...card, isDefault: card.id === cardId })) || [];
      const updatedUser = { ...user, paymentMethods: updatedPaymentMethods };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);

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
        <VStack spacing={3} mb={6}>
          {user.paymentMethods.map((card) => (
            <Flex
              key={card.id}
              p={4}
              bg={COLORS.dark}
              borderRadius='md'
              justify='space-between'
              align='center'
              borderLeftWidth={4}
              borderLeftColor={card.isDefault ? COLORS.blue : COLORS.darkSoft}
            >
              <VStack align='flex-start' spacing={1}>
                <Text color={COLORS.white} fontWeight='bold'>
                  {card.cardNumber}
                </Text>
                <Text fontSize='sm' color={COLORS.gray}>
                  {card.cardHolder}
                </Text>
                <Text fontSize='sm' color={COLORS.gray}>
                  {card.expiryDate}
                </Text>
              </VStack>

              <Flex gap={2}>
                {card.isDefault && (
                  <Badge colorScheme='blue' fontSize='xs'>
                    По умолчанию
                  </Badge>
                )}

                <Button
                  size='sm'
                  bg={COLORS.darkSoft}
                  color={COLORS.gray}
                  _hover={{ bg: COLORS.dark }}
                  onClick={() => handleSetDefault(card.id)}
                  isDisabled={card.isDefault}
                >
                  Использовать
                </Button>

                <Button
                  size='sm'
                  bg='red.500'
                  color={COLORS.white}
                  _hover={{ bg: 'red.600' }}
                  onClick={() => handleDeleteCard(card.id)}
                >
                  Удалить
                </Button>
              </Flex>
            </Flex>
          ))}
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
              placeholder='John Doe'
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
