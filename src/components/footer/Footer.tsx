import React, { useState } from "react";
import FooterBtn from "./FooterBtn";
import { Box, Flex, Link, Text } from "@chakra-ui/react";
import { COLORS } from "../../theme";
import Header from "../nav/Header";
import { loadGames } from "../../utils/loadGames";
import { RandomGame } from "../../interface";
import { useRouter } from "next/navigation";

const Footer = () => {
  const [randomGameSlug, setRandomGameSlug] = useState<string>();
  const router = useRouter();
  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getRandomGame = async () => {
    const randomPage = Math.floor(Math.random() * 200);
    const randomGame = (await loadGames({
      page_size: 1,
      page: randomPage,
    })) as RandomGame[];
    if (randomGame.length > 0) {
      setRandomGameSlug(randomGame[0].slug);
      router.push(`/catalog/${randomGame[0].slug}`);
    }
  };

  return (
    <Box p="40px 0 20px 0" bg={COLORS.dark}>
      <Header />

      <Flex
        py={"60px"}
        justifyContent={"center"}
        alignItems={"center"}
        columnGap={"10px"}
      >
        <Link href="/catalog">
          <FooterBtn
            pathToIcon="../../icons/store-icon.svg"
            clue=""
            alt="Магазин"
          />
        </Link>
        <FooterBtn
          pathToIcon="../../icons/arrow-top-icon.svg"
          clue=""
          alt="Наверх"
          onClick={handleScrollTop}
        />

        <FooterBtn
          pathToIcon="../../icons/triangle-icon.svg"
          clue=""
          alt="Случайно"
          onClick={getRandomGame}
        />
        {}
      </Flex>
    </Box>
  );
};

export default Footer;
