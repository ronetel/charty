"use client";

import React from "react";
import {
  Container,
  Flex,
  Stack,
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Radio,
  RadioGroup,
  Input,
} from "@chakra-ui/react";
import { User } from "../../interface";
import { COLORS } from "../../theme";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [email, setEmail] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<string>("");
  const [useNewCard, setUseNewCard] = React.useState(false);
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardHolder, setCardHolder] = React.useState("");
  const [expiryDate, setExpiryDate] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const router = useRouter();
  const toast = useToast();

  React.useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      router.push("/");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setEmail(parsedUser.email || "");

    if (parsedUser.paymentMethods && parsedUser.paymentMethods.length > 0) {
      const defaultCard = parsedUser.paymentMethods.find(
        (card: any) => card.isDefault,
      );
      setPaymentMethod(
        defaultCard?.id || parsedUser.paymentMethods[0]?.id || "",
      );
    }
  }, [router]);

  if (!user) {
    return <Container>Загрузка...</Container>;
  }

  const cartItems = user.games || [];

  if (cartItems.length === 0) {
    return (
      <Container maxW="1200px" py={10}>
        <Box textAlign="center">
          <Text fontSize="xl" mb={4}>
            Корзина пуста
          </Text>
          <Button
            onClick={() => router.push("/catalog")}
            bg={COLORS.blue}
            color={COLORS.white}
          >
            К каталогу
          </Button>
        </Box>
      </Container>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price), 0);
  const commission = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + commission;

  const handleSubmit = async () => {
    if (!email) {
      toast({
        title: "Ошибка",
        description: "Введите email",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!paymentMethod && !useNewCard) {
      toast({
        title: "Ошибка",
        description: "Выберите способ оплаты",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (useNewCard && (!cardNumber || !cardHolder || !expiryDate)) {
      toast({
        title: "Ошибка",
        description: "Заполните данные карты",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      // Если пользователь добавляет новую карту, сначала сохраняем её
      let paymentMethodId = paymentMethod;
      if (useNewCard) {
        const maskedCardNumber = cardNumber.replace(/\d(?=\d{4})/g, "*");
        const cardResponse = await fetch("/api/user/payment-methods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            methodType: "card",
            maskedData: maskedCardNumber,
            isDefault: !(user.paymentMethods || []).length,
          }),
        });

        if (!cardResponse.ok) {
          throw new Error("Не удалось сохранить карту");
        }

        const cardData = await cardResponse.json();
        paymentMethodId = cardData.method.id;
      }

      // Создаем заказ в базе данных
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: email,
          items: cartItems,
          paymentMethodId: paymentMethodId,
          subtotal: subtotal,
          commission: commission,
          total: total,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Ошибка при создании заказа");
      }

      const orderData = await orderResponse.json();

      // Очищаем корзину пользователя
      const updatedUser = { ...user, games: [] };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      toast({
        title: "Успех! 🎉",
        description:
          "Заказ успешно оформлен! Ключи активации отправлены на вашу почту",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Ошибка",
        description:
          error instanceof Error ? error.message : "Ошибка при создании заказа",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxW="1200px" py={10}>
      <Text fontSize="2xl" fontWeight="bold" mb={8}>
        Оформление заказа
      </Text>

      <Flex gap={8} flexDirection={{ base: "column", lg: "row" }}>
        {/* Левая колонка */}
        <VStack flex={1} spacing={6} align="stretch">
          {/* Товары в заказе */}
          <Box bg={COLORS.darkLight} p={6} borderRadius="lg">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Товары в заказе
            </Text>
            <Stack spacing={3}>
              {cartItems.map((item) => (
                <Flex
                  key={item.id}
                  justify="space-between"
                  align="center"
                  p={3}
                  bg={COLORS.dark}
                  borderRadius="md"
                >
                  <Text color={COLORS.gray} noOfLines={1}>
                    {item.name}
                  </Text>
                  <Text color={COLORS.gray} fontWeight="bold">
                    ${item.price}
                  </Text>
                </Flex>
              ))}
            </Stack>
          </Box>

          {/* Контактная информация */}
          <Box bg={COLORS.darkLight} p={6} borderRadius="lg">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Контактная информация
            </Text>
            <VStack spacing={4}>
              <Box w="full">
                <Text fontSize="sm" color={COLORS.gray} mb={2}>
                  Email *
                </Text>
                <Box
                  as="input"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  placeholder="your@email.com"
                  w="full"
                  p={3}
                  bg={COLORS.dark}
                  color={COLORS.white}
                  border={`1px solid ${COLORS.darkSoft}`}
                  borderRadius="md"
                  _focus={{ outline: "none", borderColor: COLORS.blue }}
                />
              </Box>
            </VStack>
          </Box>

          {/* Способ оплаты */}
          <Box bg={COLORS.darkLight} p={6} borderRadius="lg">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Способ оплаты
            </Text>

            {user.paymentMethods && user.paymentMethods.length > 0 && (
              <VStack spacing={3} mb={6}>
                <Text fontSize="sm" color={COLORS.gray}>
                  Привязанные карты:
                </Text>
                <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
                  <VStack spacing={2} align="start">
                    {user.paymentMethods.map((card) => (
                      <Radio
                        key={card.id}
                        value={card.id}
                        colorScheme="blue"
                        color={COLORS.white}
                      >
                        <Text fontSize="sm" ml={2} color={COLORS.gray}>
                          {card.cardNumber} - {card.cardHolder}
                        </Text>
                      </Radio>
                    ))}
                  </VStack>
                </RadioGroup>
              </VStack>
            )}

            {!useNewCard ? (
              <Button
                w="full"
                bg={COLORS.blue}
                color={COLORS.white}
                _hover={{ bg: "blue.600" }}
                onClick={() => setUseNewCard(true)}
              >
                Добавить новую карту
              </Button>
            ) : (
              <VStack spacing={3} p={4} bg={COLORS.dark} borderRadius="md">
                <Box w="full">
                  <Text fontSize="sm" color={COLORS.gray} mb={2}>
                    Номер карты
                  </Text>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16);
                      setCardNumber(value);
                    }}
                    placeholder="4111111111111111"
                    bg={COLORS.dark}
                    color={COLORS.white}
                    borderColor={COLORS.darkSoft}
                    _focus={{ borderColor: COLORS.blue }}
                  />
                </Box>

                <Box w="full">
                  <Text fontSize="sm" color={COLORS.gray} mb={2}>
                    Имя на карте
                  </Text>
                  <Input
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    bg={COLORS.dark}
                    color={COLORS.white}
                    borderColor={COLORS.darkSoft}
                    _focus={{ borderColor: COLORS.blue }}
                  />
                </Box>

                <Box w="full">
                  <Text fontSize="sm" color={COLORS.gray} mb={2}>
                    Срок действия (MM/YY)
                  </Text>
                  <Input
                    value={expiryDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + "/" + value.slice(2, 4);
                      }
                      setExpiryDate(value);
                    }}
                    placeholder="12/25"
                    bg={COLORS.dark}
                    color={COLORS.white}
                    borderColor={COLORS.darkSoft}
                    _focus={{ borderColor: COLORS.blue }}
                  />
                </Box>

                <Stack width="full" spacing={2}>
                  <Button
                    w="full"
                    bg={COLORS.blue}
                    color={COLORS.white}
                    _hover={{ bg: "blue.600" }}
                    onClick={async () => {
                      if (
                        !cardNumber.trim() ||
                        !cardHolder.trim() ||
                        !expiryDate.trim()
                      ) {
                        toast({
                          title: "Ошибка",
                          description: "Заполните все поля карты",
                          status: "error",
                          duration: 5000,
                          isClosable: true,
                        });
                        return;
                      }

                      const maskedCardNumber = cardNumber.replace(
                        /\d(?=\d{4})/g,
                        "*",
                      );

                      try {
                        const res = await fetch("/api/user/payment-methods", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            userId: user.id,
                            methodType: "card",
                            maskedData: maskedCardNumber,
                            isDefault: !(user.paymentMethods || []).length,
                          }),
                        });

                        if (!res.ok) throw new Error("Server error");
                        const data = await res.json();
                        const serverMethod = data.method;

                        const newCardId = serverMethod.id
                          ? String(serverMethod.id)
                          : `card_${Date.now()}`;
                        const clientCard = {
                          id: newCardId,
                          cardNumber: maskedCardNumber,
                          cardHolder: cardHolder.trim(),
                          expiryDate: expiryDate.trim(),
                          isDefault: !!serverMethod.isDefault,
                        };

                        const updatedUser = {
                          ...user,
                          paymentMethods: [
                            ...(user.paymentMethods || []),
                            clientCard,
                          ],
                        };
                        localStorage.setItem(
                          "currentUser",
                          JSON.stringify(updatedUser),
                        );
                        setUser(updatedUser);
                        setPaymentMethod(clientCard.id);
                        setUseNewCard(false);
                        setCardNumber("");
                        setCardHolder("");
                        setExpiryDate("");

                        toast({
                          title: "Успех",
                          description: "Карта сохранена и выбрана для оплаты",
                          status: "success",
                          duration: 5000,
                          isClosable: true,
                        });
                      } catch (e) {
                        console.error("Save card error", e);
                        toast({
                          title: "Ошибка",
                          description: "Не удалось сохранить карту",
                          status: "error",
                          duration: 5000,
                          isClosable: true,
                        });
                      }
                    }}
                  >
                    Использовать эту карту
                  </Button>

                  <Button
                    w="full"
                    bg={COLORS.darkSoft}
                    color={COLORS.gray}
                    _hover={{ bg: COLORS.dark }}
                    onClick={() => {
                      setUseNewCard(false);
                      setCardNumber("");
                      setCardHolder("");
                      setExpiryDate("");
                    }}
                  >
                    Отмена
                  </Button>
                </Stack>
              </VStack>
            )}
          </Box>
        </VStack>

        {/* Правая колонка - Итого */}
        <Box
          w={{ base: "100%", lg: "350px" }}
          h="fit-content"
          bg={COLORS.darkLight}
          p={6}
          borderRadius="lg"
          sx={{
            "@media (min-width: 992px)": {
              position: "sticky",
              top: "20px",
            },
          }}
        >
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Итого к оплате
          </Text>

          <Stack
            spacing={3}
            mb={6}
            pb={6}
            borderBottomWidth={1}
            borderBottomColor={COLORS.darkSoft}
          >
            <Flex justify="space-between">
              <Text color={COLORS.gray}>Товары:</Text>
              <Text color={COLORS.white} fontWeight="bold">
                ${subtotal.toFixed(2)}
              </Text>
            </Flex>

            <Flex justify="space-between">
              <Text color={COLORS.gray}>Комиссия (10%):</Text>
              <Text color={COLORS.white} fontWeight="bold">
                ${commission.toFixed(2)}
              </Text>
            </Flex>
          </Stack>

          <Flex justify="space-between" mb={6}>
            <Text fontSize="lg" fontWeight="bold">
              Всего:
            </Text>
            <Text fontSize="lg" fontWeight="bold" color={COLORS.blue}>
              ${total.toFixed(2)}
            </Text>
          </Flex>

          <Button
            w="full"
            bg={COLORS.blue}
            color={COLORS.white}
            _hover={{ bg: "blue.600" }}
            isLoading={submitting}
            onClick={handleSubmit}
            isDisabled={!email || (!paymentMethod && !useNewCard)}
          >
            Оплатить
          </Button>

          <Button
            w="full"
            mt={3}
            bg={COLORS.darkSoft}
            color={COLORS.gray}
            _hover={{ bg: COLORS.dark }}
            onClick={() => router.back()}
          >
            Вернуться в корзину
          </Button>
        </Box>
      </Flex>
    </Container>
  );
}
