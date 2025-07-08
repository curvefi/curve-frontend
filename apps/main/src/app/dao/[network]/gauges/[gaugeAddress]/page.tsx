import { PageGauge } from '@/dao/components/PageGauge/Page'
import type { GaugeUrlParams } from '@/dao/types/dao.types'
import { useParams } from 'react-router'

export default function Component() {
  const params = useParams() as GaugeUrlParams
  return <PageGauge {...params} />
}
