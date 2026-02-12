import { GameCardHome } from '@/interface';
import React from 'react'

function getRandomPrice(game: any) {
    const { released } = game;
    const isIndie = !!game.genres?.find((g: any) => g.name === 'Indie');

    let releaseYear = 2020;
    if (released) {
      try {
        releaseYear = new Date(released).getFullYear();
      } catch (e) {
        console.warn('Invalid release date:', released);
      }
    }

    const currentYear = new Date().getFullYear();
    const yearsDifference = currentYear - releaseYear;
    const minPrice = 1;
    let discountPerYear = 0.35;
    let newPrice = isIndie ? 30 : 70;
    for (let i = 0; i < yearsDifference; i++) {
      newPrice *= 1 - discountPerYear;
      if (discountPerYear > 0.1) {
        discountPerYear -= 0.08;
      } else {
        discountPerYear = 0.1;
      }
    }
    newPrice = Math.ceil(newPrice);
    newPrice = newPrice < minPrice ? minPrice : newPrice;
    return (newPrice - Math.random()).toFixed(2);
}

export default getRandomPrice;