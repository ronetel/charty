'use client';

import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { COLORS } from '../../theme';

interface Props {
  className?: string;
}

export const CheckoutAddressForm: React.FC<Props> = ({ className }) => {
  return (
    <Box className={className} bg={COLORS.darkLight} p={6} borderRadius='lg'>
      <Text fontSize='md' fontWeight='bold' mb={4}>Информация о доставке</Text>
      <Text color={COLORS.gray} fontSize='sm'>
        Ключи для игр будут отправлены на указанный email сразу после оплаты.
      </Text>
    </Box>
  );
};
