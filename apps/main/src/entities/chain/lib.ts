import { useCurve } from '@/entities/curve'
import networks from '@/networks'

export const useChainId = () => {
  const { data: curve } = useCurve()
  const chainId = (curve?.chainId ?? 0) as ChainId
  return { data: chainId }
}

export const useImageBaseUrl = (chainId?: ChainId) => {
  const { data: defaultChainId } = useChainId()
  const finalChainId = chainId ?? defaultChainId
  const imageBaseUrl = networks[finalChainId].imageBaseUrl
  return { data: imageBaseUrl }
}
