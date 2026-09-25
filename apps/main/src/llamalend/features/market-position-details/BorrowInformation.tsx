import { BigNumber } from 'bignumber.js'
import { useMarketContext } from '@/llamalend/features/market-context'
import { useUserCrvUsdCollateralEventsQuery } from '@/llamalend/features/user-position-history/queries/user-crvusd-collateral-events'
import { useUserLendCollateralEventsQuery } from '@/llamalend/features/user-position-history/queries/user-lend-collateral-events'
import { formatCollateralNotional, isPositionLeveraged, tokenMetric, type MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import { useMarketOraclePrice, useMarketRates, useMarketSnapshots } from '@/llamalend/queries/market'
import { useUserCurrentLeverage, useUserState } from '@/llamalend/queries/user'
import { useUserBands } from '@/llamalend/queries/user/user-bands.query'
import { useRangeToLiquidation, useUserPrices } from '@/llamalend/queries/user/user-prices.query'
import { CollateralMetricTooltipContent } from '@/llamalend/widgets/tooltips/CollateralMetricTooltipContent'
import { TotalDebtTooltipContent } from '@/llamalend/widgets/tooltips/TotalDebtTooltipContent'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import type { UserMarketParams } from '@evm-ui/queries/root-keys'
import { useTokenUsdRate } from '@evm-ui/queries/token-usd-rate.query'
import { MarketType } from '@evm-ui/types/market'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q, type Query } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimal, decimalDiv, decimalEqual, decimalGreaterThan, decimalMultiply, decimalSum, ZERO } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { getTokenPairUnit, UNAVAILABLE_TOKEN_SYMBOL } from '@ui/lib/tokens'
import { currentLoanLeverageEligibility } from './leverage-eligibility.utils'
import { collateralTokenValue, compositionShares, equity, formatDistancePercent, leverage, priceDistance } from './position-metrics.utils'
import { formatYieldMultiplier, positionReturnOnEquity } from './position-roe.utils'
import { collateralTooltip, debtTooltip, leverageTooltip, rangeTooltip, roeTooltip } from './PositionMetricTooltip'
import { LiquidationThresholdTooltipContent } from './'

const METRIC_CATEGORY = 'llamalend.positionBorrowDetails'

/** A failed refetch keeps the previous payload. Show that payload instead of replacing it with an error icon. */
const keepDisplayedValue = <T,>(query: Query<T>) =>
  q(query.data != null && query.error != null ? { data: query.data, isLoading: query.isLoading, error: null } : query)
const { Spacing } = SizesAndSpaces

type BorrowInformationProps = { params: UserMarketParams; tokens: MarketTokensOrEmpty }

export const BorrowInformation = (props: BorrowInformationProps) =>
  useNewLlamalendHealth() ? <BetaBorrowInformation {...props} /> : <CurrentBorrowInformation {...props} />

const CurrentBorrowInformation = ({ params, tokens: { collateralToken, borrowToken } }: BorrowInformationProps) => {
  const userState = useUserState(params)
  const { data: userStateValue } = userState
  const leverage = useUserCurrentLeverage(params)
  const oraclePrice = useMarketOraclePrice(params)
  const borrowUsdRate = useTokenUsdRate({ chainId: params.chainId, tokenAddress: borrowToken?.address })

  const { collateral, stablecoin: borrowed } = userStateValue ?? {}
  const collateralValue = combineQueries([oraclePrice, userState], (oraclePrice, userState) =>
    decimalSum(decimalMultiply(userState.collateral, oraclePrice), userState.stablecoin),
  )
  const { rangeToLiquidation, userPrices } = useRangeToLiquidation({ params })
  const borrowSymbol = borrowToken?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL
  const priceUnit = getTokenPairUnit([collateralToken?.symbol, borrowToken?.symbol])

  return (
    <MetricsGrid variant="mobileRows">
      <Metric
        category={METRIC_CATEGORY}
        label={t`Collateral value`}
        value={collateralValue}
        valueOptions={{ unit: { symbol: borrowSymbol, position: 'suffix' } }}
        notional={mapQuery(userState, ({ collateral, stablecoin }) =>
          formatCollateralNotional(
            { value: collateral, symbol: collateralToken?.symbol },
            { value: stablecoin, symbol: borrowToken?.symbol },
          ),
        )}
        valueTooltip={{
          title: t`Collateral value`,
          body: (
            <CollateralMetricTooltipContent
              borrow={{ value: borrowed, symbol: borrowToken?.symbol }}
              collateral={{ value: collateral, conversionRate: oraclePrice.data, symbol: collateralToken?.symbol }}
              totalValue={collateralValue.data}
              totalValueUsd={combineQueries([collateralValue, borrowUsdRate], (totalValue, borrowUsdRate) =>
                decimalMultiply(totalValue, borrowUsdRate),
              )}
            />
          ),
          placement: 'top',
          arrow: false,
          clickable: true,
        }}
      />
      <Metric
        category={METRIC_CATEGORY}
        label={t`Total debt`}
        {...tokenMetric({
          value: mapQuery(userState, ({ debt }) => debt),
          symbol: borrowToken?.symbol,
          usdRate: q(borrowUsdRate),
        })}
        valueTooltip={{
          title: t`Total Debt`,
          body: <TotalDebtTooltipContent />,
          placement: 'top',
          arrow: false,
          clickable: true,
        }}
      />
      <Metric
        category={METRIC_CATEGORY}
        label={t`Liquidation threshold`}
        value={mapQuery(userPrices, p => p?.[1])}
        valueOptions={{ abbreviate: false, unit: { symbol: priceUnit, position: 'suffix' } }}
        valueTooltip={{
          title: t`Liquidation Threshold (LT)`,
          body: (
            <LiquidationThresholdTooltipContent
              userPrices={q(userPrices)}
              rangeToLiquidation={rangeToLiquidation}
              params={params}
              priceUnit={priceUnit}
            />
          ),
          placement: 'top',
          arrow: false,
          clickable: true,
        }}
        notional={mapQuery(rangeToLiquidation, v =>
          maybe(v, value => ({ value, unit: { symbol: `% distance to LT`, position: 'suffix' as const } })),
        )}
      />
      {isPositionLeveraged(leverage.data) && (
        <Metric
          category={METRIC_CATEGORY}
          label={t`Leverage`}
          value={q(leverage)}
          valueOptions={{ unit: 'multiplier' }}
        />
      )}
    </MetricsGrid>
  )
}

const BetaBorrowInformation = ({ params, tokens: { collateralToken, borrowToken } }: BorrowInformationProps) => {
  const { marketType, blockchainId, controllerAddress, userAddress } = useMarketContext()
  const userState = useUserState(params)
  const collateralHistory = useUserLendCollateralEventsQuery(
    { blockchainId, contractAddress: controllerAddress, userAddress },
    marketType === MarketType.Lend && userAddress != null && controllerAddress != null,
  )
  const mintHistory = useUserCrvUsdCollateralEventsQuery(
    { blockchainId, contractAddress: controllerAddress, userAddress },
    marketType === MarketType.Mint && userAddress != null && controllerAddress != null,
  )
  const oraclePrice = useMarketOraclePrice(params)
  const userPrices = useUserPrices(params)
  const userBands = useUserBands(params)
  const marketRates = useMarketRates({ chainId: params.chainId, marketId: params.marketId })
  const rateSnapshots = useMarketSnapshots({
    blockchainId,
    controllerAddress,
    marketType,
    range: { kind: 'limit', limit: 1 },
  })
  const borrowUsdRate = useTokenUsdRate({ chainId: params.chainId, tokenAddress: borrowToken?.address })
  const borrowSymbol = borrowToken?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL
  const collateralValue = combineQueries([oraclePrice, userState], (price, state) =>
    decimalSum(decimalMultiply(state.collateral, price), state.stablecoin),
  )
  const collateralAssets = combineQueries([oraclePrice, userState], (price, state) =>
    collateralTokenValue(state.collateral, price),
  )
  const equityValue = combineQueries([collateralValue, userState], (assets, state) => equity(assets, state.debt))
  const leverageValue = combineQueries([collateralAssets, equityValue], (assets, equityAmount) =>
    leverage(assets, equityAmount),
  )
  const composition = combineQueries([collateralAssets, userState, collateralValue], (assets, state, total) =>
    compositionShares(assets, state.stablecoin, total),
  )
  const distance = combineQueries([oraclePrice, userPrices], (price, prices) =>
    prices ? priceDistance(price, prices[1], prices[0]) : undefined,
  )
  const aprFraction = (percentagePoints: number) => {
    const points = decimal(percentagePoints)
    const hundred = decimal('100')
    if (points == undefined || hundred == undefined) return { unavailable: true as const }
    const fraction = decimalDiv(points, hundred)
    return fraction == undefined ? { unavailable: true as const } : { aprFraction: fraction }
  }
  const roe = combineQueries(
    [collateralAssets, userState, equityValue, marketRates, rateSnapshots],
    (assets, state, equityAmount, rates, snapshots) => {
      const latest = snapshots.at(-1)
      if (!latest || rates.borrowApr == null || !equityAmount) return { kind: 'unavailable' as const }
      const collateralApr = latest.collateralToken.rebasingYieldApr
      const borrowedToken = 'borrowedToken' in latest ? latest.borrowedToken : latest.stablecoinToken
      const borrowedApr = borrowedToken.rebasingYieldApr
      if (collateralApr == null && decimalGreaterThan(assets, ZERO)) return { kind: 'hidden' as const }
      const result = positionReturnOnEquity({
        collateralValue: assets,
        borrowedValue: state.stablecoin,
        debt: state.debt,
        equity: equityAmount,
        collateralYield: decimalEqual(assets, ZERO) || collateralApr == null ? { unnecessary: true } : aprFraction(collateralApr),
        borrowedYield:
          decimalEqual(state.stablecoin, ZERO) || borrowedApr == null ? { unnecessary: true } : aprFraction(borrowedApr),
        borrowCost: decimalEqual(state.debt, ZERO) ? { unnecessary: true } : aprFraction(rates.borrowApr),
        rewards: { unnecessary: true },
      })
      return result.status === 'value' ? { kind: 'value' as const, result } : { kind: 'unavailable' as const }
    },
  )
  const priceUnit = getTokenPairUnit([collateralToken?.symbol, borrowToken?.symbol])
  const historyPage = marketType === MarketType.Mint ? mintHistory.data : collateralHistory.data
  const leverageEligibility = maybe(historyPage, page =>
    currentLoanLeverageEligibility({
          events: page.events.map(event => ({
            timestamp: event.timestamp,
            isPositionClosed: event.isPositionClosed,
            leverage: 'leverage' in event && event.leverage ? { eventType: event.leverage.eventType } : null,
          })),
          count: page.count,
          page: page.page,
          pagination: page.pagination,
          nullMeansOrdinaryBorrow: false,
        }),
  )
  const compositionLabels = composition.data
    ? {
        collateral: BigNumber(composition.data.collateralLabel).toFixed(2),
        borrowed: BigNumber(100).minus(BigNumber(composition.data.collateralLabel).toFixed(2)).toFixed(2),
      }
    : undefined
  return (
    <>
      <Box sx={{ gridArea: 'range' }} data-testid="beta-borrow-information">
        <Metric
          category={METRIC_CATEGORY}
          label={t`Liquidation range`}
          testId="liquidation-range"
          value={keepDisplayedValue(mapQuery(userPrices, prices => prices?.[1]))}
          valueOptions={{
            abbreviate: true,
            unit: { symbol: priceUnit, position: 'suffix' },
            formatter: () => {
              const prices = userPrices.data
              if (!prices) return ''
              return `${formatNumber(prices[1], { abbreviate: true })}–${formatNumber(prices[0], { abbreviate: true })}`
            },
          }}
          sx={{ whiteSpace: 'nowrap' }}
          notional={mapQuery(distance, value => {
            if (!value || value.location === 'unavailable') return value?.location === 'unavailable' ? t`Unavailable` : undefined
            if (value.location === 'inside') return t`In range`
            return `${formatDistancePercent(value.percent)} ${value.label}`
          })}
          valueTooltip={rangeTooltip({
            pair: priceUnit,
            upper: userPrices.data ? formatNumber(userPrices.data[1], { abbreviate: true }) : undefined,
            lower: userPrices.data ? formatNumber(userPrices.data[0], { abbreviate: true }) : undefined,
            bandCount: userBands.data ? Math.abs(userBands.data[0] - userBands.data[1]) + 1 : undefined,
            bandRange: userBands.data
              ? `${Math.min(userBands.data[0], userBands.data[1])} to ${Math.max(userBands.data[0], userBands.data[1])}`
              : undefined,
          })}
        />
      </Box>
      <Stack sx={{ gridArea: 'collateral', gap: Spacing.xxs }}>
        <Metric
          category={METRIC_CATEGORY}
          label={t`Collateral value`}
          value={keepDisplayedValue(collateralValue)}
          valueOptions={{ unit: { symbol: borrowSymbol, position: 'suffix' } }}
          valueTooltip={collateralTooltip()}
        />
        {compositionLabels && (
          <Stack data-testid="collateral-composition" sx={{ gap: Spacing.xxs }}>
            <Stack direction="row" sx={{ height: 4 }}>
              <Box sx={theme => ({ width: `${compositionLabels.collateral}%`, bgcolor: theme.design.Layer.Feedback.Success })} />
              <Box sx={theme => ({ width: `${compositionLabels.borrowed}%`, bgcolor: theme.design.Layer.Feedback.Warning })} />
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="bodyXsRegular" color="textSecondary">
                {`${compositionLabels.collateral}% ${collateralToken?.symbol ?? ''}`}
              </Typography>
              <Typography variant="bodyXsRegular" color="textSecondary">
                {`${compositionLabels.borrowed}% ${borrowSymbol}`}
              </Typography>
            </Stack>
          </Stack>
        )}
      </Stack>
      <Box sx={{ gridArea: 'debt' }}>
        <Metric
          category={METRIC_CATEGORY}
          label={t`Total debt`}
          {...tokenMetric({
            value: keepDisplayedValue(mapQuery(userState, ({ debt }) => debt)),
            symbol: borrowToken?.symbol,
            usdRate: q(borrowUsdRate),
          })}
          valueTooltip={debtTooltip()}
        />
      </Box>
      <Box sx={{ gridArea: 'leverage' }}>
        {leverageEligibility?.eligibility === 'yes' && (
          <Metric
            category={METRIC_CATEGORY}
            label={t`Leverage`}
            value={keepDisplayedValue(leverageValue)}
            valueOptions={{ unit: 'multiplier' }}
            valueTooltip={leverageTooltip()}
          />
        )}
        {leverageEligibility?.eligibility === 'unknown' && (
          <Metric
            category={METRIC_CATEGORY}
            label={t`Leverage`}
            value={q({ data: undefined, isLoading: false, error: new Error(leverageEligibility.reason) })}
            valueTooltip={leverageTooltip()}
          />
        )}
      </Box>
      {roe.data?.kind !== 'hidden' && (
      <Box sx={{ gridArea: 'roe' }}>
        <Metric
          category={METRIC_CATEGORY}
          label={t`Return on equity`}
          testId="position-roe"
          value={keepDisplayedValue(
            q({
              data: roe.data?.kind === 'value' ? roe.data.result.aprPercent : undefined,
              isLoading: roe.isLoading,
              error:
                roe.data?.kind === 'unavailable'
                  ? new Error('A required yield or borrow rate is unavailable.')
                  : roe.error,
            }),
          )}
          notional={
            roe.data?.kind === 'value' ? formatYieldMultiplier(roe.data.result.multiplier) : undefined
          }
          valueOptions={{ unit: { symbol: '% APR', position: 'suffix' } }}
          valueTooltip={roeTooltip()}
        />
      </Box>
      )}
    </>
  )
}
