import useStore from '@/store/useStore'

export const useCurve = () => {
  return useStore((state) => state.curve)
}
