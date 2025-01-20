import useStore from '@main/store/useStore'

export const useCurve = () => {
  const curve = useStore((state) => state.curve)
  return { data: curve }
}
