"use client";

import GamePreviewCard from "../../components/cards/GamePreviewCard";
import Header from "../../components/nav/Header";
import { GameCardHome } from "../../interface";
import { loadGames } from "../../utils/loadGames";
import { Box, Grid, Heading, Text } from "@chakra-ui/react";
import { usePathname, useSearchParams } from "next/navigation";
import React, { Suspense, useCallback, useEffect, useState } from "react";

const PageContent = () => {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const pathname = usePathname();
  console.log("🚀 ~ searchParams:", search);
  console.log("🚀 ~ Pathname:", pathname);

  const [data, setData] = useState<GameCardHome[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const fetchGames = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const games = (await loadGames({
          page_size: 50,
          page: page,
          search: (search || undefined) as unknown as string,
        })) as GameCardHome[];
        setData(games || []);
      } catch (error) {
        console.error("Failed to fetch games:", error);
        setLoading(false);
        setIsLoaded(true);
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    },
    [search],
  );

  useEffect(() => {
    fetchGames(1);
  }, [fetchGames]);

  return (
    <>
      <Header />

      <Box className="wrapper" h="100%" mt="60px">
        <Box mb="50px">
          <Heading as="h1" mb="5px" fontSize="40px" fontWeight="800">
            Результаты поиска
          </Heading>

          <Text mb="30px" fontSize="16px">
            {`По вашему запросу "${
              search === "" ? "ничего — попробуйте другой запрос" : search
            }"`}
          </Text>
        </Box>

        <Grid
          gridTemplateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap="25px 40px"
          pb="60px"
        >
          {data &&
            data.map(
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
                  width="100%"
                  href={`/catalog/${slug}`}
                />
              ),
            )}
        </Grid>

        {data.length === 0 && (
          <Text
            textAlign="center"
            w="100%"
            h="100%"
            fontSize="20px"
            fontWeight="500"
          >
            Игры не найдены.
          </Text>
        )}
      </Box>
    </>
  );
};

const Page = () => (
  <Suspense fallback={<div>Загрузка...</div>}>
    <PageContent />
  </Suspense>
);

export default Page;
