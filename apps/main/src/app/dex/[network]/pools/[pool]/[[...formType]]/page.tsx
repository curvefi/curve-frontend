import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Pool from '@/dex/components/PagePool/Page'
import { type PoolUrlParams } from '@/dex/types/main.types'
import { t } from '@ui-kit/lib/i18n'
import { getPoolName } from '../../../pools.util'

type PoolPageProps = { params: Promise<PoolUrlParams> }

export const generateMetadata = async ({ params }: PoolPageProps): Promise<Metadata> => ({
  title: ['Curve', t`Pool`, await getPoolName(...(await Promise.all([params, headers()]))), 'Curve'].join(' - '),
})

const PoolPage = async ({ params }: PoolPageProps) => <Pool {...await params} />

export default PoolPage
