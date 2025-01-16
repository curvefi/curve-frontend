import { useCurve } from '@/dex/entities/curve'
import useStore from '@/dex/store/useStore'

export const useChainId = () => {
  const { data: curve } = useCurve()
  const chainId = (curve?.chainId ?? 0) as ChainId
  return { data: chainId }
}

export const useImageBaseUrl = (chainId?: ChainId) => {
  const networks = useStore((state) => state.networks.networks)
  const { data: defaultChainId } = useChainId()
  const finalChainId = chainId ?? defaultChainId
  const imageBaseUrl = networks[finalChainId].imageBaseUrl
  return { data: imageBaseUrl }
}
