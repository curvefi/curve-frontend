import { SubTabsSwitcher } from 'curve-ui-kit/src/shared/ui/Tabs/SubTabsSwitcher'
import { useState } from 'react'
import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { getBandsChartToken } from '@/llamalend/features/bands-chart/utils'
import { useOhlcChartState } from '@/loan/hooks/useOhlcChartState'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { ChartWrapper } from '@ui-kit/features/candle-chart/ChartWrapper'
import { TIME_OPTIONS, SOFT_LIQUIDATION_DESCRIPTION } from '@ui-kit/features/candle-chart/constants'
import { ErrorMessage } from '@ui-kit/features/candle-chart/ErrorMessage'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useNewBandsChart } from '@ui-kit/hooks/useFeatureFlags'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ChartFooter } from '@ui-kit/shared/ui/Chart/ChartFooter'
import { ChartHeader } from '@ui-kit/shared/ui/Chart/ChartHeader'
import { ToggleBandsChartButton } from '@ui-kit/shared/ui/Chart/ToggleBandsChartButton'
import { type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PoolActivity } from './PoolActivity'

const { Spacing } = SizesAndSpaces

type Tab = 'chart' | 'marketActivity'
const tabs: TabOption<Tab>[] = [
  { value: 'chart', label: t`Chart` },
  { value: 'marketActivity', label: t`LLAMMA` },
]

type ChartAndActivityCompProps = {
  rChainId: ChainId
  market: Llamma | null
  llammaId: string
}

const EMPTY_ARRAY: never[] = []

export const ChartAndActivityComp = ({ rChainId, market, llammaId }: ChartAndActivityCompProps) => {
  const { llamaApi: api = null } = useCurve()
  const theme = useTheme()
  const [isBandsVisible, , , toggleBandsVisible] = useSwitch(true)
  const newBandsChartEnabled = useNewBandsChart()
  const collateralTokenAddress = market?.coinAddresses[1]
  const borrowedTokenAddress = market?.coinAddresses[0]
  const {
    poolAddress,
    coins,
    ohlcDataUnavailable,
    isLoading: isChartLoading,
    selectedChartKey,
    setSelectedChart,
    setTimeOption,
    legendSets,
    ohlcChartProps,
  } = useOhlcChartState({
    rChainId,
    market: market,
    llammaId,
  })
  const {
    chartData,
    userBandsBalances,
    oraclePrice,
    isLoading: isBandsLoading,
    isError: isBandsError,
  } = useBandsData({
    chainId: rChainId,
    marketId: llammaId,
    api,
    collateralTokenAddress,
    borrowedTokenAddress,
  })
  const collateralToken = getBandsChartToken(collateralTokenAddress, market?.collateralSymbol)
  const borrowToken = getBandsChartToken(borrowedTokenAddress, market?.coins[0])

  const [tab, setTab] = useState<Tab>('chart')

  return (
    <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.sm, padding: Spacing.md }}>
      <SubTabsSwitcher tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'marketActivity' && <PoolActivity poolAddress={poolAddress} chainId={rChainId} coins={coins} />}
      {tab === 'chart' && (
        <Stack sx={{ gap: Spacing.sm }}>
          <ChartHeader
            chartOptionVariant="select"
            chartSelections={{
              selections: ohlcChartProps.selectChartList,
              activeSelection: selectedChartKey,
              setActiveSelection: setSelectedChart,
            }}
            timeOption={{
              options: TIME_OPTIONS,
              activeOption: ohlcChartProps.timeOption,
              setActiveOption: setTimeOption,
            }}
            isLoading={isChartLoading}
            customButton={
              newBandsChartEnabled && (
                <ToggleBandsChartButton label="Bands" isVisible={isBandsVisible} onClick={toggleBandsVisible} />
              )
            }
          />
          <Stack
            display={{ mobile: 'block', tablet: newBandsChartEnabled && isBandsVisible ? 'grid' : undefined }}
            gridTemplateColumns={{ tablet: newBandsChartEnabled && isBandsVisible ? '1fr 0.3fr' : undefined }}
          >
            {ohlcDataUnavailable ? (
              <ErrorMessage
                errorMessage={t`Chart data is not available for this market.`}
                sx={{ alignSelf: 'center' }}
              />
            ) : (
              <ChartWrapper {...ohlcChartProps} betaBackgroundColor={theme.design.Layer[1].Fill} />
            )}
            {newBandsChartEnabled && isBandsVisible && (
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
          <ChartFooter legendSets={legendSets} description={SOFT_LIQUIDATION_DESCRIPTION} />
        </Stack>
      )}
    </Stack>
  )
}
