import type { Metadata } from 'next'
import { getPoolName } from '@/app/dex/[network]/pools/[pool]/pool-name.util'
import Pool from '@/dex/components/PagePool/Page'
import { type PoolUrlParams } from '@/dex/types/main.types'
import { t } from '@ui-kit/lib/i18n'

type PoolPageProps = { params: Promise<PoolUrlParams> }

export const generateMetadata = async ({ params }: PoolPageProps): Promise<Metadata> => ({
  title: ['Curve', t`Pool`, await getPoolName(await params), 'Curve'].join(' - '),
})

const PoolPage = async ({ params }: PoolPageProps) => <Pool {...await params} />

export default PoolPage
