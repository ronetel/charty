"use client";

import GamePreviewCard from "@/components/cards/GamePreviewCard";
import { GameCardHome } from "@/interface";
import { TRANSITIONS } from "@/theme";
import getRandomItems from "@/utils/getRandomItem";
import { loadGames } from "@/utils/loadGames";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Loading from "./loading";
import Error from "./error";

export default function Home() {
  const [games, setGames] = useState<GameCardHome[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const homeGames = (await loadGames({
          page_size: 20,
          page: 1,
        })) as GameCardHome[];

        if (!isMounted) return;

        if (!homeGames || homeGames.length === 0) {
          setError("No games available in database.");
          setIsLoading(false);
          return;
        }

        const games = getRandomItems(
          homeGames,
          Math.min(4, homeGames.length),
        ) as GameCardHome[];
        setGames(games);
        setIsLoading(false);
      } catch (error: unknown) {
        if (!isMounted) return;

        console.error("Failed to fetch games:", error);
        let errorMessage = "Unknown error";
        if (error instanceof Error) {
          errorMessage = (error as Error).message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        setError(`Failed to load games: ${errorMessage}`);
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <Box className="wrapper" h="100%">
      <Flex
        h={{ base: "calc(100% - 115px)", "840px": "calc(100% - 65px)" }}
        alignItems="center"
        flex="1 1"
      >
        <Grid
          display="grid"
          columnGap={{ base: "20px", md: "30px" }}
          rowGap={{ base: "20px", md: "25px" }}
          h="calc(100% - 60px)"
          gridTemplateColumns={{
            base: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gridTemplateRows={{
            base: "auto auto auto",
            lg: "repeat(3, 1fr)",
          }}
          flex="1 1"
          _last={{ alignItems: "end" }}
        >
          {games &&
            games.map(
              (
                { id, name, background_image, platforms, price, slug },
                index,
              ) => (
                <GamePreviewCard
                  key={id}
                  name={name}
                  src={background_image}
                  price={price}
                  platforms={platforms}
                  isCustom={true}
                  isFirst={index === 0 && true}
                  href={`/catalog/${slug}`}
                />
              ),
            )}

          <Flex
            as={Link}
            href="/catalog"
            pt={{ base: "0", lg: "15px" }}
            alignItems="center"
            justifyContent={{ base: "center", lg: "flex-start" }}
            columnGap="20px"
            cursor="pointer"
            gridColumn={{ base: "1 / 4", lg: "1 / 5" }}
            transition={TRANSITIONS.mainTransition}
            _hover={{
              columnGap: "30px",
              transition: TRANSITIONS.mainTransition,
            }}
          >
            <Text fontSize="24px" fontWeight={700}>
              Перейти в магазин
            </Text>

            <Image
              src="/icons/arrow-right-icon.svg"
              width={34}
              height={34}
              alt="Arrow"
            />
          </Flex>
        </Grid>
      </Flex>
    </Box>
  );
}
