import React, { useState } from 'react';
import { Box, Text, VStack, Input } from '@chakra-ui/react';
import { COLORS } from '../../theme';
import { checkoutPersonalFormSchema } from '../../lib/validations';

interface Props {
  className?: string;
  email: string;
  onEmailChange: (email: string) => void;
}

export const CheckoutPersonalForm: React.FC<Props> = ({ className, email, onEmailChange }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleEmailChange = (value: string) => {
    onEmailChange(value);
    
    // Валидация email при изменении
    const result = checkoutPersonalFormSchema.safeParse({ email: value });
    
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        newErrors['email'] = err.message;
      });
      setErrors(newErrors);
    } else {
      setErrors({});
    }
  };

  return (
    <Box className={className} bg={COLORS.darkLight} p={6} borderRadius='lg'>
      <Text fontSize='md' fontWeight='bold' mb={4}>Контактная информация</Text>
      <VStack spacing={4}>
        <Box w='full'>
          <Text fontSize='sm' color={COLORS.gray} mb={2}>Email *</Text>
          <Input
            type='email'
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder='your@email.com'
            bg={COLORS.dark}
            color={COLORS.white}
            borderColor={errors.email ? 'red.500' : COLORS.darkSoft}
            border={errors.email ? '1px solid' : undefined}
            _focus={{ borderColor: COLORS.blue, boxShadow: `0 0 0 1px ${COLORS.blue}` }}
            required
          />
          {errors.email && (
            <Text fontSize='xs' color='red.400' mt={1}>{errors.email}</Text>
          )}
        </Box>
      </VStack>
    </Box>
  );
};
