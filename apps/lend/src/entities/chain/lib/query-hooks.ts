import { createQueryHook } from '@/shared/lib/queries'
import { getOneWayMarketNames } from '../model/query-options'

export const useOneWayMarketNames = createQueryHook(getOneWayMarketNames);
