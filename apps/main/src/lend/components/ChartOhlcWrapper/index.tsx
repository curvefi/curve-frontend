import { useState } from 'react'
import { styled } from 'styled-components'
import PoolActivity from '@/lend/components/ChartOhlcWrapper/PoolActivity'
import { useOhlcChartState, type OhlcChartStateProps } from '@/lend/hooks/useOhlcChartState'
import { SubTabsSwitcher } from '@/llamalend/widgets/SubTabsSwicther'
import Stack from '@mui/material/Stack'
import AlertBox from '@ui/AlertBox'
import TextCaption from '@ui/TextCaption'
import ChartWrapper from '@ui-kit/features/candle-chart/ChartWrapper'
import { t } from '@ui-kit/lib/i18n'
import { type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'

type Tab = 'chart' | 'marketActivity'
const tabs: TabOption<Tab>[] = [
  { value: 'chart', label: t`Chart` },
  { value: 'marketActivity', label: t`LLAMMA` },
]

const ChartOhlcWrapper = ({ rChainId, userActiveKey, rOwmId }: OhlcChartStateProps) => {
  const { market, coins, ohlcDataUnavailable, ohlcChartProps } = useOhlcChartState({
    rChainId,
    userActiveKey,
    rOwmId,
  })

  const [tab, setTab] = useState<Tab>('chart')

  if (ohlcDataUnavailable) {
    return (
      <StyledAlertBox alertType="">
        <TextCaption isCaps isBold>
          {t`Ohlc chart data and pool activity is not yet available for this market.`}
        </TextCaption>
      </StyledAlertBox>
    )
  }

  return (
    <Stack>
      <SubTabsSwitcher tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'marketActivity' && market && coins && (
        <PoolActivity poolAddress={market.addresses.amm} chainId={rChainId} coins={coins} />
      )}
      {tab === 'chart' && <ChartWrapper {...ohlcChartProps} />}
    </Stack>
  )
}

const StyledAlertBox = styled(AlertBox)`
  align-items: center;
  display: flex;
  justify-content: center;
  margin: var(--spacing-narrow) 0;
`

export default ChartOhlcWrapper
