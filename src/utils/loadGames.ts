
import { gameList } from "@/api/gameList";

export async function loadGames(params: {
  page: number;
  page_size: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const response = await gameList({
    page: params.page,
    page_size: params.page_size,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  return response.results;
}