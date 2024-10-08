import { createQueryHook } from '@/shared/lib/queries'
import { getOneWayMarketNames } from '@/entities/chain/model'

export const useOneWayMarketNames = createQueryHook(getOneWayMarketNames);
