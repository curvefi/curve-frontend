import type { Metadata } from 'next'
import { PageGauge } from '@/dao/components/PageGauge/Page'
import type { GaugeUrlParams } from '@/dao/types/dao.types'
import { t } from '@ui-kit/lib/i18n'

type GaugePageProps = { params: Promise<GaugeUrlParams> }

export async function generateMetadata({ params }: GaugePageProps): Promise<Metadata> {
  const { gaugeAddress } = await params
  return { title: [t`Gauge`, gaugeAddress, 'Curve'].join(' - ') }
}

const GaugePage = async ({ params }: GaugePageProps) => <PageGauge {...await params} />

export default GaugePage
