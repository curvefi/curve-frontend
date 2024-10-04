import { createQueryHook } from '@/shared/lib/queries'
import { getOneWayMarketNames } from '@/entities/chain'

export const useOneWayMarketNames = createQueryHook(getOneWayMarketNames);
