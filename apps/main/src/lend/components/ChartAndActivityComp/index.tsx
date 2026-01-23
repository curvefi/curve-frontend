import { SubTabsSwitcher } from 'curve-ui-kit/src/shared/ui/Tabs/SubTabsSwitcher'
import { useState } from 'react'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useOhlcChartState } from '@/lend/hooks/useOhlcChartState'
import { Api, ChainId } from '@/lend/types/lend.types'
import { getBandsChartToken } from '@/llamalend/features/bands-chart/bands-chart.utils'
import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { ChartWrapper } from '@ui-kit/features/candle-chart/ChartWrapper'
import { TIME_OPTIONS, SOFT_LIQUIDATION_DESCRIPTION } from '@ui-kit/features/candle-chart/constants'
import { useNewBandsChart } from '@ui-kit/hooks/useFeatureFlags'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ChartFooter } from '@ui-kit/shared/ui/Chart/ChartFooter'
import { ChartHeader } from '@ui-kit/shared/ui/Chart/ChartHeader'
import { ToggleBandsChartButton } from '@ui-kit/shared/ui/Chart/ToggleBandsChartButton'
import { ErrorMessage } from '@ui-kit/shared/ui/ErrorMessage'
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
  rOwmId: string
  api: Api | undefined
}

const EMPTY_ARRAY: never[] = []

export const ChartAndActivityComp = ({ rChainId, rOwmId, api }: ChartAndActivityCompProps) => {
  const [isBandsVisible, , , toggleBandsVisible] = useSwitch(true)
  const theme = useTheme()
  const market = useOneWayMarket(rChainId, rOwmId).data
  const collateralTokenAddress = market?.collateral_token.address
  const borrowedTokenAddress = market?.borrowed_token.address
  const newBandsChartEnabled = useNewBandsChart()
  const {
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

  return (
    <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.sm, padding: Spacing.md }}>
      <SubTabsSwitcher tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'marketActivity' && market && coins && (
        <PoolActivity poolAddress={market.addresses.amm} chainId={rChainId} coins={coins} />
      )}
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
                title="An error ocurred"
                subtitle={t`Chart data is not yet available for this market.`}
                errorMessage={t`Chart data is not yet available for this market.`}
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
