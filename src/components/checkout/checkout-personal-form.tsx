import React from 'react';
import { Box, Text, VStack, Input } from '@chakra-ui/react';
import { COLORS } from '../../theme';

interface Props {
  className?: string;
  email: string;
  onEmailChange: (email: string) => void;
}

export const CheckoutPersonalForm: React.FC<Props> = ({ className, email, onEmailChange }) => {
  return (
    <Box className={className} bg={COLORS.darkLight} p={6} borderRadius='lg'>
      <Text fontSize='md' fontWeight='bold' mb={4}>Контактная информация</Text>
      <VStack spacing={4}>
        <Box w='full'>
          <Text fontSize='sm' color={COLORS.gray} mb={2}>Email *</Text>
          <Input
            type='email'
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder='your@email.com'
            bg={COLORS.dark}
            color={COLORS.white}
            borderColor={COLORS.darkSoft}
            _focus={{ borderColor: COLORS.blue, boxShadow: `0 0 0 1px ${COLORS.blue}` }}
            required
          />
        </Box>
      </VStack>
    </Box>
  );
};
