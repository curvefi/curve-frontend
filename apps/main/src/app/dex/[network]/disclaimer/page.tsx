import type { NetworkUrlParams } from '@/dex/types/main.types'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'
import { useParams } from 'react-router-dom'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <Disclaimer currentApp="dex" {...params} />
}
