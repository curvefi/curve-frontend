import { useState } from 'react'
import { styled } from 'styled-components'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useOhlcChartState } from '@/lend/hooks/useOhlcChartState'
import { Api, ChainId } from '@/lend/types/lend.types'
import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { getBandsChartToken } from '@/llamalend/features/bands-chart/utils'
import { Box } from '@mui/material'
import Stack from '@mui/material/Stack'
import AlertBox from '@ui/AlertBox'
import TextCaption from '@ui/TextCaption'
import ChartWrapper from '@ui-kit/features/candle-chart/ChartWrapper'
import { useNewBandsChart } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import ChartHeader from '@ui-kit/shared/ui/ChartHeader'
import { SubTabsSwitcher } from '@ui-kit/shared/ui/SubTabsSwitcher'
import { type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import PoolActivity from './PoolActivity'

const { Spacing } = SizesAndSpaces

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

const EMPTY_ARRAY: never[] = []

export const ChartAndActivityComp = ({ rChainId, userActiveKey, rOwmId, api }: ChartAndActivityCompProps) => {
  const market = useOneWayMarket(rChainId, rOwmId).data
  const collateralTokenAddress = market?.collateral_token.address
  const borrowedTokenAddress = market?.borrowed_token.address
  const newBandsChartEnabled = useNewBandsChart()
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
  const collateralToken = getBandsChartToken(collateralTokenAddress, market?.collateral_token.symbol)
  const borrowToken = getBandsChartToken(borrowedTokenAddress, market?.borrowed_token.symbol)

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
    <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.sm, padding: Spacing.md }}>
      <SubTabsSwitcher tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'marketActivity' && market && coins && (
        <PoolActivity poolAddress={market.addresses.amm} chainId={rChainId} coins={coins} />
      )}
      {tab === 'chart' && (
        <Box>
          <ChartHeader
            chartOptionVariant="select"
            chartSelections={{
              selections: ohlcChartProps.selectChartList,
              activeSelection: ohlcChartProps.selectChartList[ohlcChartProps.selectedChartIndex ?? 0]?.key ?? '',
              setActiveSelection: ohlcChartProps.setSelectedChart ?? (() => {}),
            }}
          />
          <Stack
            display={{ mobile: 'block', tablet: newBandsChartEnabled ? 'grid' : undefined }}
            gridTemplateColumns={{ tablet: newBandsChartEnabled ? '1fr 0.3fr' : undefined }}
          >
            <ChartWrapper {...ohlcChartProps} />
            {newBandsChartEnabled && (
              <BandsChart
                isLoading={isBandsLoading}
                isError={isBandsError}
                collateralToken={collateralToken}
                borrowToken={borrowToken}
                chartData={chartData}
                userBandsBalances={userBandsBalances ?? EMPTY_ARRAY}
                oraclePrice={oraclePrice}
              />
            )}
          </Stack>
        </Box>
      )}
    </Stack>
  )
}

const StyledAlertBox = styled(AlertBox)`
  align-items: center;
  display: flex;
  justify-content: center;
  margin: var(--spacing-narrow) 0;
`
