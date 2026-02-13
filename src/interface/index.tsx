export interface GamePreviewCardProps {
  name: string;
  src: string;
  price: number | string;
  platforms: any[];
  width?: string;
  height?: string;
  isCustom?: boolean;
  isFirst?: boolean;
  href: string;
}

export interface RandomGame {
  slug: string;
}

export interface GameCardHome {
  id: number;
  name: string;
  background_image: string;
  price: number | string;
  released: string | null;
  rating: number;
  slug: string;
  genres: {
    name: string;
  }[];
  platforms: {
    platform: {
      name: string;
      slug: string;
    };
  }[];
}

export interface GameDetails extends GameCardHome {
  description_raw: string;
  website?: string;
  metacritic?: number;
  developers: {
    name: string;
  }[];
  publishers: {
    name: string;
  }[];
  ratings: {
    id: number;
    count: number;
    percent: number;
    title: string;
  }[];
  stores: {
    store: {
      domain: string;
      name: string;
      slug: string;
    };
  }[];
  short_screenshots: {
    id: number;
    image: string;
  }[];
}

export interface Game extends GameDetails {
  added: number;
}

export interface User {
  id: string;
  login: string;
  email: string;
  password?: string;
  games: {
    id: number;
    name: string;
    price: number | string;
    slug: string;
  }[];
  wishlist: {
    id: number;
    name: string;
    price: number | string;
    slug: string;
  }[];
  paymentMethods?: {
    id: string;
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    isDefault: boolean;
  }[];
}

export interface AddToCart {
  isLoggedIn: boolean;
  user: User;
  id: number;
  name: string;
  price: number | string;
  slug: string;
}
