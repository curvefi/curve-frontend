import useStore from '@/store/useStore'

export const useChainId = () => {
  const { chainId } = useStore((state) => state.curve)
  return chainId || 0
}
