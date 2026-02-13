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
    <Box className="wrapper" h="10%">
      <Flex
        h={{ base: "calc(100% - 115px)", "840px": "calc(100% - 65px)" }}
        alignItems="flex-start"
        flex="1 1"
        mt={{ base: 8, md: 12, lg: 16 }} // явный отступ сверху
      >
        <Box w="100%" display="flex" flexDirection="row" gap={{ base: "20px", md: "30px" }}>
          
          {games && games[0] && (
            <Box flex="0 0 75%" maxW="80%" h={{ base: "600px", md: "700px", lg: "800px" }}>
              <GamePreviewCard
                key={games[0].id}
                name={games[0].name}
                src={games[0].background_image}
                price={games[0].price}
                platforms={games[0].platforms}
                isCustom={true}
                isFirst={true}
                href={`/catalog/${games[0].slug}`}
                width="100%"
                height="100%"
              />
            </Box>
          )}
          
          <Box flex="1" display="flex" flexDirection="column" gap="20px" h={{ base: "600px", md: "700px", lg: "800px" }}>
            {games && games.slice(1, 4).map((game, idx) => (
              <Box key={game.id} flex="1" minH="0">
                <GamePreviewCard
                  name={game.name}
                  src={game.background_image}
                  price={game.price}
                  platforms={game.platforms}
                  isCustom={true}
                  isFirst={false}
                  href={`/catalog/${game.slug}`}
                  width="100%"
                  height="100%"
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
