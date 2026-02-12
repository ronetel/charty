import React from 'react';
import { Box, Stack, Text, Flex, Button, Center } from '@chakra-ui/react';
import { COLORS } from '../../theme';
import { IoClose } from 'react-icons/io5';
import { User } from '../../interface';

interface Props {
  items: User['games'];
  onRemoveItem: (id: number) => void;
  className?: string;
}

export const CheckoutCart: React.FC<Props> = ({
  items,
  onRemoveItem,
  className,
}) => {
  return (
    <Box className={className} bg={COLORS.darkLight} p={6} borderRadius='lg'>
      <Text fontSize='lg' fontWeight='bold' mb={4}>Товары в заказе</Text>

      {items.length === 0 ? (
        <Text color={COLORS.gray} textAlign='center' py={8}>Корзина пуста</Text>
      ) : (
        <Stack spacing={3}>
          {items.map((item) => (
            <Flex
              key={item.id}
              justify='space-between'
              align='center'
              p={3}
              bg={COLORS.dark}
              borderRadius='md'
              _hover={{ bg: COLORS.darkSoft }}
              transition='all 0.2s'
            >
              <Text color={COLORS.gray} noOfLines={1} flex={1}>{item.name}</Text>
              <Flex align='center' gap={3}>
                <Text color={COLORS.white} fontWeight='bold' minW='60px' textAlign='right'>
                  ${item.price}
                </Text>
                <Center
                  onClick={() => onRemoveItem(item.id)}
                  cursor='pointer'
                  bg={COLORS.darkSoft}
                  w='30px'
                  h='30px'
                  borderRadius='50%'
                  _hover={{ bg: 'red.500', transition: 'all 0.2s' }}
                >
                  <IoClose size='16px' color={COLORS.white} />
                </Center>
              </Flex>
            </Flex>
          ))}
        </Stack>
      )}
    </Box>
  );
};
