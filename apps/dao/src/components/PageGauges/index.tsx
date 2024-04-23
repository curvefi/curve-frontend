import useStore from '@/store/useStore'
import { useEffect } from 'react'

const Gauges = () => {
  const getGauges = useStore((state) => state.gauges.getGauges)
  const curve = useStore((state) => state.curve)

  useEffect(() => {
    if (curve) {
      getGauges(curve)
    }
  }, [curve, getGauges])
  return <div>Gauges</div>
}

export default Gauges
