"use client";

import GamePreviewCard from "@/components/cards/GamePreviewCard";
import { GameCardHome } from "@/interface";
import { loadGames } from "@/utils/loadGames";
import { Box, Flex, Grid, Heading, Link, Image } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Loading from "./loading";
import Error from "./error";

export default function Popular() {
  const [data, setData] = useState<GameCardHome[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const anotherGames = (await loadGames({
          page_size: 9,
          page: 1,
          sortBy: 'added',
          sortOrder: 'desc',
        })) as GameCardHome[];

        if (!isMounted) return;
        setData(anotherGames);
        setIsLoading(false);
      } catch (error: unknown) {
        if (!isMounted) return;

        console.error("Failed to fetch games:", error);
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = (error as Error).message;
        } else if (typeof error === 'string') {
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
    <Box mb="140px">
      <Box className="wrapper">
        <Flex
          mb="30px"
          justifyContent="space-between"
          alignItems="center"
          columnGap="20px"
        >
          <Heading
            as="h2"
            fontWeight={800}
            fontSize={{ base: "28px", md: "32px", lg: "40px" }}
          >
            Популярные
          </Heading>
          <Box as={Link} href="/catalog" cursor="pointer">
            <Image
              src="../../icons/arrow-right-icon.svg"
              width='40px'
              height='40px'
              alt="Ещё"
            />
          </Box>
        </Flex>

        <Grid
          gridTemplateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap="25px 40px"
        >
          {data &&
            data.map(
                (
                  { id, name, background_image, platforms, price, slug },
                  index
                ) => (
                  <GamePreviewCard
                    key={id}
                    name={name}
                    src={background_image}
                    price={price}
                    platforms={platforms}
                    width="100%"
                    href={`/catalog/${slug}`}
                  />
                )
              )}
        </Grid>
      </Box>
    </Box>
  );
}
