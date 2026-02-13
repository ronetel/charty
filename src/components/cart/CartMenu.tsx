import {
  Text,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalBody,
  Button,
  Flex,
  Image,
  Box,
  Center,
  Stack,
  Link,
  ModalCloseButton,
} from "@chakra-ui/react";
import { COLORS, TRANSITIONS } from "../../theme";
import React, { useState, useEffect } from "react";
import { User } from "../../interface";
import { IoClose } from "react-icons/io5";
import { FaArrowRightLong } from "react-icons/fa6";
import { useRouter } from "next/navigation";

const CartMenu = ({
  isOpen,
  onClose,
  user,
  activeView,
  setActiveView,
  refreshCard,
  setRefreshCard,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  activeView: "cart" | "wishlist";
  setActiveView: (view: "cart" | "wishlist") => void;
  refreshCard: boolean;
  setRefreshCard: (refresh: boolean) => void;
}) => {
  console.log("🚀 ~ USER", user);

  const totalSum = () => {
    let sum = 0;
    const items = activeView === "cart" ? (cartItems || user.games) : user.wishlist;
    if(items.length === 0) return sum;

    items.forEach((item) => {
      sum += Number(item.price);
    });
    return sum.toFixed(2);
  };

  const [cartItems, setCartItems] = useState<any[]>(user.games || []);

  const handleDelete = async (id: number) => {
    if (activeView === 'cart') {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized');
        const res = await fetch(`/api/user/cart?productId=${id}`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to remove');
        const json = await res.json();
        const newCart = json?.cart?.items?.map((it: any) => ({ id: it.product.id, name: it.product.name, price: it.priceAtOrder, slug: it.product.rawgSlug || it.product.metadata?.slug })) || [];
        setCartItems(newCart);
        try {
          const stored = localStorage.getItem('currentUser');
          if (stored) {
            const base = JSON.parse(stored);
            localStorage.setItem('currentUser', JSON.stringify({ ...base, games: newCart }));
          }
        } catch (e) {}
        setRefreshCard(!refreshCard);
      } catch (e) {
        console.error('Cart delete error', e);
      }
    } else {
      const data = user.wishlist;
      const updatedData = data.filter((game) => game.id !== id);
      try {
        const stored = localStorage.getItem('currentUser');
        let base = user;
        if (stored) {
          try { base = JSON.parse(stored); } catch (e) { base = user; }
        }
        const newUser = { ...base, wishlist: updatedData };
        localStorage.setItem('currentUser', JSON.stringify(newUser));
      } catch (e) {}
      setRefreshCard(!refreshCard);
    }
  }

  const router = useRouter();

  const handleCheckout = () => {
    const items = activeView === 'cart' ? (cartItems || user.games) : user.wishlist;
    if (items.length === 0) {
      alert('Корзина пуста');
      return;
    }
    router.push('/checkout');
  }

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/user/cart', { headers: { authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const json = await res.json();
        const cart = json?.cart?.items?.map((it: any) => ({ id: it.product.id, name: it.product.name, price: it.priceAtOrder, slug: it.product.rawgSlug || it.product.metadata?.slug })) || [];
        setCartItems(cart);
      } catch (e) {}
    })();
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <Modal onClose={onClose} isOpen={true}>
          <ModalOverlay bg={COLORS.modalOverlay} />

          <ModalContent
            bg={COLORS.dark}
            p="0"
            my={0}
            h='100%'
            containerProps={{ justifyContent: 'flex-end', margin: '0px', padding: '0px' }}
            sx={{
              'section': {margin: '0px', padding: '0px'},
            }}
          >
            <ModalHeader
              display="flex"
              pb={0}
              mb='30px'
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontSize="24px" fontWeight="700" color={COLORS.white}>
                {(activeView === 'cart' ? (cartItems?.length || 0) : (user?.wishlist?.length || 0))} {activeView === 'cart' ? 'товаров' : 'в избранном'}
              </Text>
              <ModalCloseButton />
              {}
            </ModalHeader>
            <ModalBody py={0} p={0} bg={COLORS.dark}>
              <Flex h='calc(100vh - 80px)' minH='500px' flexDirection='column' justifyContent='space-between' rowGap='30px'>
                <Flex px='6' columnGap='10px' justifyContent='center'>
                  <Button onClick={() => setActiveView("cart")} h='40px' w='120px' color={activeView === "cart" ? COLORS.white : COLORS.darkSoft} bg={COLORS.darkLight} transition={TRANSITIONS.mainTransition} _hover={{bg: COLORS.darkSoft}}>
                    <Image src={activeView === "cart" ? "/icons/bag-icon.svg" : "/icons/bag-icon-dark.svg"} alt="корзина"/>
                    <Box as='span' ml='10px'>Корзина</Box>
                  </Button>

                  <Button onClick={() => setActiveView("wishlist")} h='40px' w='120px' color={activeView !== "cart" ? COLORS.white : COLORS.darkSoft} bg={COLORS.darkLight}  transition={TRANSITIONS.mainTransition} _hover={{bg: COLORS.darkSoft}}>
                    <Image src={activeView !== "cart" ? "/icons/medal-star-icon.svg" : "/icons/medal-star-icon-dark.svg"} alt="избранное"/>
                    <Box as='span' ml='10px' >Избранное</Box>
                  </Button>
                </Flex>

                <Stack h='calc(100%)' overflow='auto' px='6' spacing='10px'
                  sx={{
                    "::-webkit-scrollbar": {
                      width: "6px",
                      height: "auto",
                    },
                    "::-webkit-scrollbar-track": {
                      background: COLORS.blackLight,
                      borderRadius: "10px",
                    },
                    "::-webkit-scrollbar-thumb": {
                      background: COLORS.blue,
                      borderRadius: "10px",
                    },
                    "::-webkit-scrollbar-button": {
                      display: "none",
                    },
                    "::-webkit-scrollbar-thumb:hover": {
                      background: COLORS.blueHover,
                    },
                  }}>
                  {(activeView === 'cart' ? (cartItems || []) : (user?.wishlist || [])).map((item) => (
                    <Flex _hover={{textDecoration: 'none'}} key={item.id} p="10px 15px" borderRadius='10px' justifyContent='space-between' alignItems='center' bg={COLORS.darkLight} columnGap='15px'>
                      <Text as={Link} href={`/catalog/${item.slug}`} _hover={{textDecoration: 'none'}} color={COLORS.gray} fontSize='md' fontWeight='600' noOfLines={1}>{item.name}</Text>

                      <Flex columnGap='10px' alignItems='center' w='auto'>
                        <Text color={COLORS.gray} fontWeight='600'>{item.price} ₽</Text>
                        <Center onClick={() => handleDelete(item.id)} cursor='pointer' bg={COLORS.darkSoft} w='30px' h='30px' borderRadius='50%'>
                          <IoClose size='16px' color={COLORS.white} />
                        </Center>
                      </Flex>
                    </Flex>
                  ))}

                  {activeView === 'cart' && (cartItems || []).length === 0 ? (
                    <Text textAlign='center'>Нет игр в корзине</Text>
                  ) : <></>}

                  {activeView === "wishlist" && user?.wishlist.length === 0 ? (
                    <Text textAlign='center'>Нет игр в избранном</Text>
                  ) : <></>}
                </Stack>

                <Flex p='24px' justifyContent='space-between' bg={COLORS.darkLight} alignItems='center'>
                    <Text fontWeight='600' fontSize='md' color={COLORS.gray}>
                    Общая сумма: {totalSum()} ₽
                  </Text>

                  <Flex onClick={handleCheckout} cursor='pointer' columnGap='15px' alignItems='center' fontWeight='700' fontSize='20px' transition={TRANSITIONS.mainTransition} _hover={{color: COLORS.gray}}>
                    Оформить заказ
                    <FaArrowRightLong />
                  </Flex>
                </Flex>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default CartMenu;
