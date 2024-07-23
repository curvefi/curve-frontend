import { useCurve } from '@/entities/curve'

export const useChainId = () => {
  const curve = useCurve()
  return curve?.chainId ?? 0
}
