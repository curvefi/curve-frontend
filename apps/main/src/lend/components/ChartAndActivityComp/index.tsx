import { useState } from 'react'
import { styled } from 'styled-components'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useOhlcChartState } from '@/lend/hooks/useOhlcChartState'
import { Api, ChainId } from '@/lend/types/lend.types'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import Stack from '@mui/material/Stack'
import AlertBox from '@ui/AlertBox'
import TextCaption from '@ui/TextCaption'
import ChartWrapper from '@ui-kit/features/candle-chart/ChartWrapper'
import { t } from '@ui-kit/lib/i18n'
import { SubTabsSwitcher } from '@ui-kit/shared/ui/SubTabsSwitcher'
import { type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'
import PoolActivity from './PoolActivity'

type Tab = 'chart' | 'marketActivity'
const tabs: TabOption<Tab>[] = [
  { value: 'chart', label: t`Chart` },
  { value: 'marketActivity', label: t`LLAMMA` },
]

type ChartAndActivityCompProps = {
  rChainId: ChainId
  userActiveKey: string
  rOwmId: string
  api: Api | undefined
}

export const ChartAndActivityComp = ({ rChainId, userActiveKey, rOwmId, api }: ChartAndActivityCompProps) => {
  const market = useOneWayMarket(rChainId, rOwmId).data
  const collateralTokenAddress = market?.collateral_token.address
  const borrowedTokenAddress = market?.borrowed_token.address
  const { coins, ohlcDataUnavailable, ohlcChartProps } = useOhlcChartState({
    rChainId,
    userActiveKey,
    rOwmId,
  })
  const {
    chartData,
    userBandsBalances,
    oraclePrice,
    isLoading: isBandsLoading,
    isError: isBandsError,
  } = useBandsData({
    chainId: rChainId,
    marketId: rOwmId,
    api,
    collateralTokenAddress,
    borrowedTokenAddress,
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
