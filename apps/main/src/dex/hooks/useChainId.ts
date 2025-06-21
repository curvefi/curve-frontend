import useStore from '@/dex/store/useStore'
import { type ChainId, NetworkEnum } from '@/dex/types/main.types'

export const useChainId = (networkId: NetworkEnum): ChainId =>
  useStore((state) => state.networks.networksIdMapper[networkId])
