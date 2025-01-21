import { useCurve } from '@main/entities/curve'
import useStore from '@main/store/useStore'
import { ChainId } from '@main/types/main.types'

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
