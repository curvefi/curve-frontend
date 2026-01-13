import { useState } from 'react'
import { styled } from 'styled-components'
import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { useBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { getBandsChartToken } from '@/llamalend/features/bands-chart/utils'
import { useOhlcChartState } from '@/loan/hooks/useOhlcChartState'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { AlertBox } from '@ui/AlertBox'
import { TextCaption } from '@ui/TextCaption'
import { ChartWrapper } from '@ui-kit/features/candle-chart/ChartWrapper'
import { TIME_OPTIONS, SOFT_LIQUIDATION_DESCRIPTION } from '@ui-kit/features/candle-chart/constants'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useNewBandsChart } from '@ui-kit/hooks/useFeatureFlags'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ChartFooter } from '@ui-kit/shared/ui/ChartFooter'
import { ChartHeader } from '@ui-kit/shared/ui/ChartHeader'
import { SubTabsSwitcher } from '@ui-kit/shared/ui/SubTabsSwitcher'
import { type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'
import { ToggleBandsChartButton } from '@ui-kit/shared/ui/ToggleBandsChartButton'
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
  llamma: Llamma | null
  llammaId: string
}

const EMPTY_ARRAY: never[] = []

export const ChartAndActivityComp = ({ rChainId, llamma, llammaId }: ChartAndActivityCompProps) => {
  const { llamaApi: api = null } = useCurve()
  const theme = useTheme()
  const [isBandsVisible, , , toggleBandsVisible] = useSwitch(true)
  const newBandsChartEnabled = useNewBandsChart()
  const collateralTokenAddress = llamma?.coinAddresses[1]
  const borrowedTokenAddress = llamma?.coinAddresses[0]
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
    llamma,
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
  const collateralToken = getBandsChartToken(collateralTokenAddress, llamma?.collateralSymbol)
  const borrowToken = getBandsChartToken(borrowedTokenAddress, llamma?.coins[0])

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
              <StyledAlertBox alertType="">
                <TextCaption isCaps isBold>
                  {t`Ohlc chart data is unavailable for this market.`}
                </TextCaption>
              </StyledAlertBox>
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

const StyledAlertBox = styled(AlertBox)`
  align-items: center;
  display: flex;
  justify-content: center;
  margin: auto;
`
