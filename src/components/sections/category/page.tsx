"use client";

import GamePreviewCard from '@/components/cards/GamePreviewCard'
import { COLORS } from '@/theme'
import { Box, Heading, Flex, Grid, Divider } from '@chakra-ui/react'
import Option from '@/components/Option'
import React, { useEffect, useState } from 'react'
import { get } from '@/api/api'
import { GameCardHome } from '@/interface'
import { loadGames } from '@/utils/loadGames'
import Loading from './loading'
import Error from './error'

interface Category {
  id: number;
  name: string;
}

export default function Category() {
  const [data, setData] = useState<GameCardHome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // use cached get() helper to avoid duplicate requests
        const data = await get('categories', {} as any).catch(async () => {
          // fallback to direct fetch if helper fails
          const res = await fetch('/api/categories');
          return res.json();
        });

        setCategories(data.results || []);
        if (data.results && data.results.length > 0) {
          setSelectedCategoryId(data.results[0].id);
        }
      } catch (e) {
        console.error('Failed to fetch categories:', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    (async () => {
      try {
        const url = new URL('/api/games', window.location.origin);
        url.searchParams.set('page_size', '4');
        url.searchParams.set('page', '1');
        url.searchParams.set('categoryId', String(selectedCategoryId));

        const res = await fetch(url.toString());
        const gameData = await res.json();

        if (!isMounted) return;
        setData(gameData.results || []);
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
  }, [selectedCategoryId]);

  const categoryMapping: { [key: string]: string } = {
    'Action': 'Экшн',
    'Strategy': 'Стратегия',
    'RPG': 'РПГ',
    'Shooter': 'Шутер',
    'Adventure': 'Приключения',
    'Puzzle': 'Головоломки',
    'Sports': 'Спорт',
    'Racing': 'Гонки',
    'Indie': 'Инди',
    'Casual': 'Казуальные',
  };

  const displayCategories = categories.map(cat => ({
    ...cat,
    displayName: categoryMapping[cat.name] || cat.name,
  }));

  if(isLoading && data.length === 0) {
    return <Loading />
  }

  if(error) {
    return <Error message={error} />
  }

  return (
    <Box mb="140px">
      <Box className="wrapper">
        <Heading
          as="h2"
          fontWeight={800}
          fontSize={{ base: "28px", md: "32px", lg: "40px" }}
          mb="30px"
        >
          Поиск по категориям
        </Heading>

        <Flex
          w="100%"
          h="100%"
          justifyContent={{ base: "center", "1300px": "space-between" }}
          flexDirection={{ base: "column", "1300px": "row" }}
          gap="40px 20px"
        >
          <Grid
            gridTemplateColumns={{
              base: "auto",
              sm: "repeat(auto-fill, minmax(260px, 1fr))",
              "1300px": "auto",
            }}
            flexDirection="column"
            gap="5px 20px"
          >
            {displayCategories.map((category, index) => (
              <Option
                key={category.id}
                href="#"
                isSelected={selectedCategoryId === category.id}
                pathToIcon="../../icons/category/lightning-icon.svg"
                text={category.displayName}
                onClick={() => setSelectedCategoryId(category.id)}
              />
            ))}
          </Grid>

          <Divider
            w="1px"
            h="505px"
            display={{ base: "none", "1300px": "block" }}
            orientation="vertical"
            borderColor={COLORS.whiteTransparentLight}
          />

          <Grid
            gridTemplateColumns={{
              base: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
            }}
            maxW="961px"
            w='100%'
            justifyContent="space-around"
            flexWrap="wrap"
            gap="25px 40px"
            m={{ base: "0", sm: "0 auto", "1300px": "0" }}
          >
            {data &&
              data.map(
                (
                  { id, name, background_image, platforms, price, slug },
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
        </Flex>
      </Box>
    </Box>
  );
}
