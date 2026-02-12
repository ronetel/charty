"use client";

import Header from "../../components/nav/Header";
import { Box, Heading, Text, Flex, Grid } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { GameCardHome, User } from "../../interface";
import { loadGames } from "../../utils/loadGames";
import Loading from "./loading";
import GameCatalogCard from "../../components/cards/GameCatalogCard";

const Catalog = () => {
  const pageNumRef = useRef<number>(1);
  const hasMoreRef = useRef<boolean>(true);
  const isLoadingRef = useRef<boolean>(false);
  const loadedIdsRef = useRef<Set<number>>(new Set());

  const [refreshHeader, setRefreshHeader] = useState<boolean>(false);
  const [user, setUser] = useState<User>({
    id: '',
    login: '',
    email: '',
    password: '',
    games: [],
    wishlist: [],
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [data, setData] = useState<GameCardHome[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchGames = async (page: number) => {

    if (isLoadingRef.current || !hasMoreRef.current) return;

    isLoadingRef.current = true;
    try {
      const games = (await loadGames({
        page_size: 12,
        page: page,
        sortBy: 'added',
        sortOrder: 'desc',
      })) as GameCardHome[];

      if (!games || games.length === 0) {
        hasMoreRef.current = false;
      } else {

        const newGames = games.filter((game) => {
          if (loadedIdsRef.current.has(game.id)) {
            return false;
          }
          loadedIdsRef.current.add(game.id);
          return true;
        });

        if (newGames.length === 0) {
          hasMoreRef.current = false;
        } else {
          setData((prevData) => [...prevData, ...newGames]);
        }
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      hasMoreRef.current = false;
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialGames = async () => {
      setLoading(true);
      try {
        const games = (await loadGames({
          page_size: 12,
          page: 1,
          sortBy: 'added',
          sortOrder: 'desc',
        })) as GameCardHome[];

        if (games && games.length > 0) {
          setData(games);

          games.forEach((game) => loadedIdsRef.current.add(game.id));
          pageNumRef.current = 2;
        } else {
          hasMoreRef.current = false;
        }
      } catch (error) {
        console.error("Error fetching initial games:", error);
        hasMoreRef.current = false;
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    if (initialLoad) {
      loadInitialGames();
    }
  }, [initialLoad]);

  useEffect(() => {
    if (initialLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingRef.current && hasMoreRef.current) {
          fetchGames(pageNumRef.current);
          pageNumRef.current++;
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [initialLoad]);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const currentUser = JSON.parse(storedUser);
        setUser(currentUser);
        setIsLoggedIn(true);
      } catch (e) {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleAddToCart = (id: number, name: string, price: string, slug: string) => {
    if (!isLoggedIn) return alert("Please sign in to add or remove from cart");

    if (user) {
      const isGameAlreadyInCart = user.games.some((game) => game.id === id);

      if (isGameAlreadyInCart) {

        const updatedGames = user.games.filter((game) => game.id !== id);
        const updatedUser = { ...user, games: updatedGames };

        setUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setRefreshHeader(!refreshHeader);
      } else {

        const updatedUser = { ...user, games: [...user.games, { id, name, price, slug }] };

        setUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setRefreshHeader(!refreshHeader);
      }
    }
  };

  if(loading && initialLoad) return <Loading />;

  return (
    <>
      <Header refreshHeader={refreshHeader} />

      <Box className="wrapper" mt="60px">
        <Box mb="50px">
          <Heading as="h1" mb="5px" fontSize="40px" fontWeight="800">
            Новинки и тренды
          </Heading>

          <Text mb="30px" fontSize="16px">
            Исходя из количества игроков и даты выхода игры
          </Text>
        </Box>

        <Grid
          gap="30px"
          gridTemplateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gridAutoFlow="row"
          mb="50px"
        >
          {data?.map(
            ({
              id,
              name,
              background_image,
              platforms,
              price,
              genres,
              released,
              rating,
              slug,
            }) => (
              <GameCatalogCard
                key={id}
                id={id}
                name={name}
                src={background_image}
                price={price}
                platforms={platforms}
                genres={genres}
                released={released || ''}
                rating={rating}
                href={`/catalog/${slug}`}
                handleAddToCart={() => handleAddToCart(id, name, price, slug)}
                isInCart={user?.games?.some((game) => game.id === id)}
              />
            )
          )}
        </Grid>

        {}
        <Box ref={loadMoreRef} h="50px" />
      </Box>
    </>
  );
};

export default Catalog;
