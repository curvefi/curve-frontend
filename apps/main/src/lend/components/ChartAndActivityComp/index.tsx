import { SubTabsSwitcher } from 'curve-ui-kit/src/shared/ui/Tabs/SubTabsSwitcher'
import { useState } from 'react'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useOhlcChartState } from '@/lend/hooks/useOhlcChartState'
import { networks } from '@/lend/networks'
import { Api, ChainId } from '@/lend/types/lend.types'
import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { getBandsChartToken } from '@/llamalend/features/bands-chart/utils'
import { useLlammaActivity, TradesExpandedPanel, EventsExpandedPanel } from '@/llamalend/features/llamma-activity'
import type { Token } from '@/llamalend/features/llamma-activity/hooks/useLlammaActivity'
import type { Chain, Address } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { ActivityTable } from '@ui-kit/features/activity-table'
import { ChartWrapper } from '@ui-kit/features/candle-chart/ChartWrapper'
import { TIME_OPTIONS, SOFT_LIQUIDATION_DESCRIPTION } from '@ui-kit/features/candle-chart/constants'
import { ErrorMessage } from '@ui-kit/features/candle-chart/ErrorMessage'
import { useNewBandsChart } from '@ui-kit/hooks/useFeatureFlags'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ChartFooter } from '@ui-kit/shared/ui/Chart/ChartFooter'
import { ChartHeader } from '@ui-kit/shared/ui/Chart/ChartHeader'
import { ToggleBandsChartButton } from '@ui-kit/shared/ui/Chart/ToggleBandsChartButton'
import { type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

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

  // Derive network info from chainId
  const networkConfig = networks[rChainId]
  const network = networkConfig?.id.toLowerCase() as Chain
  const ammAddress = market?.addresses.amm as Address | undefined
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
  const collateralToken = getBandsChartToken(collateralTokenAddress, market?.collateral_token.symbol) as Token | undefined
  const borrowToken = getBandsChartToken(borrowedTokenAddress, market?.borrowed_token.symbol) as Token | undefined

  const [tab, setTab] = useState<Tab>('marketActivity')

  // Use the llamma activity hook
  const {
    activeSelection,
    setActiveSelection,
    selections,
    tradesTableConfig,
    eventsTableConfig,
  } = useLlammaActivity({
    network,
    collateralToken,
    borrowToken,
    ammAddress,
    endpoint: 'lending',
    networkConfig,
  })

  return (
    <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.sm, padding: Spacing.md }}>
      <SubTabsSwitcher tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'marketActivity' && market && coins && activeSelection === 'trades' && (
        <ActivityTable
          selections={selections}
          activeSelection={activeSelection}
          onSelectionChange={setActiveSelection}
          tableConfig={tradesTableConfig}
          expandedPanel={TradesExpandedPanel}
        />
      )}
      {tab === 'marketActivity' && market && coins && activeSelection === 'events' && (
        <ActivityTable
          selections={selections}
          activeSelection={activeSelection}
          onSelectionChange={setActiveSelection}
          tableConfig={eventsTableConfig}
          expandedPanel={EventsExpandedPanel}
        />
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
