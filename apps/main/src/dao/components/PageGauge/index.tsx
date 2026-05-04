import { GaugeWeightHistoryChart } from '@/dao/components/Charts/GaugeWeightHistoryChart'
import { useGauges } from '@/dao/queries/gauges.query'
import type { GaugeUrlParams } from '@/dao/types/dao.types'
import { getEthPath } from '@/dao/utils'
import Stack from '@mui/material/Stack'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { PAGE_SPACING } from '@ui-kit/widgets/DetailPageLayout/constants'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { BackButton } from '../BackButton'
import { GaugeHeader } from './GaugeHeader'
import { GaugeMetrics } from './GaugeMetrics'
import { GaugeVotesTable } from './GaugeVotesTable'

export const Gauge = () => {
  const { gaugeAddress: rGaugeAddress } = useParams<GaugeUrlParams>()
  const gaugeAddress = rGaugeAddress.toLowerCase()
  const { data: gauges, isLoading: gaugesIsLoading } = useGauges({})
  const gaugeData = gauges?.[gaugeAddress]

  const tableMinWidth = 21.875

  return (
    <DetailPageLayout formTabs={null}>
      <BackButton path={getEthPath(DAO_ROUTES.PAGE_GAUGES)} label={t`Back to gauges`} />
      <Stack gap={PAGE_SPACING} sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>
        <GaugeHeader gaugeData={gaugeData} dataLoading={gaugesIsLoading} />
        <GaugeMetrics gaugeData={gaugeData} dataLoading={gaugesIsLoading} />
        <Stack>{gaugeData && <GaugeWeightHistoryChart gaugeAddress={gaugeData.address} minHeight={25} />}</Stack>
        {gaugeData && <GaugeVotesTable gaugeAddress={gaugeData.address} tableMinWidth={tableMinWidth} />}
      </Stack>
    </DetailPageLayout>
  )
}
