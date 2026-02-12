import { get, ResponseSchema } from './api';

interface Params {
  page?: number,
  page_size?: number,

  search?: string,
  dates?: string,
  ordering?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
}

function gameList(params?: Params): Promise<ResponseSchema<any>> {
  return get<ResponseSchema<any>>('games', params as Record<string, string>);
}

export { gameList };