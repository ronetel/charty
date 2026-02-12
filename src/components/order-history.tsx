"use client";

import React from "react";
import { User } from "../interface";
import { COLORS } from "../theme";
import {
  Box,
  VStack,
  Stack,
  Text,
  Flex,
  Badge,
  Divider,
  useToast,
  Spinner,
  Button,
} from "@chakra-ui/react";

interface Order {
  id: string;
  user_id: string;
  email: string;
  items: Array<{
    id: number;
    name: string;
    price: string;
  }>;
  subtotal: number;
  commission: number;
  total: number;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
}

interface Props {
  user: User;
}

export default function OrderHistory({ user }: Props) {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [useDatabase, setUseDatabase] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => {
    fetchOrders();
  }, [user.id, useDatabase]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      if (useDatabase) {
        // Загрузка из базы данных
        const response = await fetch(`/api/user/orders/${user.id}`);

        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          throw new Error("Failed to fetch orders from database");
        }
      } else {
        // Загрузка из localStorage
        const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
        const userOrders = allOrders.filter(
          (order: Order) => order.user_id === user.id,
        );
        setOrders(
          userOrders.sort(
            (a: Order, b: Order) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          ),
        );
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заказы",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "pending":
        return "yellow";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Выполнен";
      case "pending":
        return "В обработке";
      case "cancelled":
        return "Отменён";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box bg={COLORS.darkLight} p={6} borderRadius="lg" textAlign="center">
        <Spinner size="lg" color={COLORS.blue} />
        <Text color={COLORS.gray} mt={4}>
          Загрузка истории заказов...
        </Text>
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box bg={COLORS.darkLight} p={6} borderRadius="lg" textAlign="center">
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          История заказов
        </Text>
        <Text color={COLORS.gray} py={8}>
          У вас ещё нет заказов
        </Text>
        <Button
          onClick={() => (window.location.href = "/catalog")}
          bg={COLORS.blue}
          color={COLORS.white}
          _hover={{ bg: "blue.600" }}
          mt={4}
        >
          Перейти в каталог
        </Button>
      </Box>
    );
  }

  return (
    <Box bg={COLORS.darkLight} p={6} borderRadius="lg">
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="lg" fontWeight="bold">
          История заказов
        </Text>
        {/* Кнопка для переключения между локальным хранилищем и базой данных */}
        {process.env.NODE_ENV === "development" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUseDatabase(!useDatabase)}
          >
            {useDatabase ? "Использовать localStorage" : "Использовать БД"}
          </Button>
        )}
      </Flex>

      <VStack spacing={4} align="stretch">
        {orders.map((order) => (
          <Box
            key={order.id}
            p={4}
            bg={COLORS.dark}
            borderRadius="md"
            borderLeftWidth={4}
            borderLeftColor={
              order.status === "completed"
                ? "green.500"
                : order.status === "pending"
                  ? "yellow.500"
                  : "red.500"
            }
            _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
          >
            <Flex justify="space-between" align="flex-start" mb={3}>
              <Box>
                <Text fontWeight="bold" color={COLORS.white} fontSize="md">
                  Заказ #{order.id.slice(0, 8).toUpperCase()}
                </Text>
                <Text fontSize="sm" color={COLORS.gray}>
                  {new Date(order.created_at).toLocaleDateString("ru-RU", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Box>
              <Badge
                colorScheme={getStatusColor(order.status)}
                fontSize="xs"
                px={3}
                py={1}
                borderRadius="full"
              >
                {getStatusText(order.status)}
              </Badge>
            </Flex>

            <Divider my={3} borderColor={COLORS.darkSoft} />

            <VStack spacing={2} align="stretch" mb={3}>
              {order.items.map((item) => (
                <Flex
                  key={item.id}
                  justify="space-between"
                  fontSize="sm"
                  py={1}
                >
                  <Text color={COLORS.gray} noOfLines={1}>
                    {item.name}
                  </Text>
                  <Text color={COLORS.white} fontWeight="bold">
                    ${parseFloat(item.price).toFixed(2)}
                  </Text>
                </Flex>
              ))}
            </VStack>

            <Divider my={3} borderColor={COLORS.darkSoft} />

            <VStack spacing={1} align="stretch">
              <Flex justify="space-between" fontSize="sm">
                <Text color={COLORS.gray}>Товары:</Text>
                <Text color={COLORS.white}>${order.subtotal.toFixed(2)}</Text>
              </Flex>
              <Flex justify="space-between" fontSize="sm">
                <Text color={COLORS.gray}>Комиссия (10%):</Text>
                <Text color={COLORS.white}>${order.commission.toFixed(2)}</Text>
              </Flex>
              <Flex
                justify="space-between"
                fontSize="sm"
                fontWeight="bold"
                pt={2}
              >
                <Text color={COLORS.white}>Итого:</Text>
                <Text color={COLORS.blue} fontSize="lg">
                  ${order.total.toFixed(2)}
                </Text>
              </Flex>
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
