import useStore from '@/store/useStore'

export const useCurve = () => {
  const curve = useStore((state) => state.curve)
  return { data: curve }
}

export const useLendApi = () => {
  const lendApi = useStore((state) => state.lendApi)
  return { data: lendApi }
}
