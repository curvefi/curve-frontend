import useStore from '@/store/useStore'

export const useCurve = () => {
  const curve = useStore((state) => state.curve)
  return { data: curve }
}
