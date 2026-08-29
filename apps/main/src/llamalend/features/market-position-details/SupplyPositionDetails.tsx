import { ReactNode } from 'react'
import { zeroAddress } from 'viem'
import { useMarketContext } from '@/llamalend/features/market-context'
import { useMarketRates, useMarketVaultOnChainRewards, useMarketVaultPricePerShare } from '@/llamalend/queries/market'
import { useUserBalances, useUserSupplyBoost } from '@/llamalend/queries/user'
import {
  formatSupplyExtraIncentives,
  getCampaignAprs,
  getLatestSnapshotValue,
  getOnChainExtraIncentiveAprs,
  getSupplyRateAverageMetrics,
  getSupplyRateMetrics,
  toNumberOrNull,
} from '@/llamalend/rates.utils'
import { BoostTooltipContent } from '@/llamalend/widgets/tooltips/BoostTooltipContent'
import { MarketSupplyRateTooltipContent } from '@/llamalend/widgets/tooltips/MarketSupplyRateTooltipContent'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { useCampaignsByAddress } from '@evm-ui/entities/campaigns'
import { useLendingSnapshots } from '@evm-ui/entities/lending-snapshots'
import { LlamaChainId } from '@evm-ui/features/connect-wallet/lib/types'
import { useAprToApy, useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { combineQueries } from '@evm-ui/lib'
import { t } from '@evm-ui/lib/i18n'
import { useTokenUsdRate } from '@evm-ui/lib/model/entities/token-usd-rate'
import { Metric } from '@evm-ui/shared/ui/Metric'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { mapQuery, q } from '@evm-ui/types/util'
import {
  AVERAGE_CATEGORIES,
  type AverageCategory,
  decimalMultiply,
  formatCappedRateValue,
  formatNumber,
} from '@evm-ui/utils'
import { Grid, Stack } from '@mui/material'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { assert } from '@primitives/objects.utils'
import { AmountSuppliedTooltipContent, VaultSharesTooltipContent } from './'

const { Spacing } = SizesAndSpaces

export type SupplyAsset = {
  symbol: string
  address: Address
  usdRate: number
  depositedAmount: Decimal
  depositedUsdValue: Decimal
}

const SUPPLY_POSITION_TAB = 'supplyPosition'

const RATE_CATEGORY: AverageCategory = 'llamalend.market.rate'
const METRIC_CATEGORY = 'llamalend.positionSupplyDetails'

const MetricGrid = ({ children }: { children: ReactNode }) => <Grid size={{ mobile: 12, tablet: 3 }}>{children}</Grid>

// TODO: use the same PositionDetailsComposite component as the borrow tab once the supply events are ready
export const SupplyPositionDetailsCard = ({ children }: { children: ReactNode }) => (
  <Stack>
    <TabsSwitcher
      variant="contained"
      value={SUPPLY_POSITION_TAB}
      options={[{ value: SUPPLY_POSITION_TAB, label: t`Your position` }]}
    />
    <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>{children}</Stack>
  </Stack>
)

export const SupplyPositionDetails = () => {
  const convertRate = useAprToApy()
  const rateDisplay = useRateDisplay()
  const netSupplyRateTitle = rateDisplay === 'apy' ? t`Your net supply APY` : t`Your net supply APR`
  const {
    chainId,
    blockchainId,
    market: contextMarket,
    userAddress,
    controllerAddress,
  } = useMarketContext<LlamaChainId>()
  const market = assert(
    contextMarket instanceof LendMarketTemplate ? contextMarket : undefined,
    'SupplyPositionDetails requires a lend market',
  )

  const params = { chainId, marketId: market.id, userAddress }
  const { window: rateWindow } = AVERAGE_CATEGORIES[RATE_CATEGORY]
  const { data: campaigns } = useCampaignsByAddress({ blockchainId, address: market.addresses.vault as Address })
  const noGauge = market.addresses.gauge === zeroAddress

  const userSupplyBoost = useUserSupplyBoost(params)
  const onChainRewards = useMarketVaultOnChainRewards(params)
  const snapshots = mapQuery(
    useLendingSnapshots({ blockchainId, contractAddress: controllerAddress, limit: rateWindow }),
    snapshots => {
      const rebasingYieldApr = getLatestSnapshotValue(
        snapshots,
        snapshot => snapshot.borrowedToken.rebasingYieldApr,
      )
      return {
        rebasingYieldApr,
        rebasingYieldRate: convertRate(rebasingYieldApr),
        supplyAverageMetrics: getSupplyRateAverageMetrics({ snapshots, daysBack: rateWindow, convertRate }),
      }
    },
  )

  const supplyMetrics = combineQueries(
    [snapshots, useMarketRates(params), onChainRewards, userSupplyBoost],
    ({ rebasingYieldApr }, marketRatesData, { crvRates, rewardsApr }, userSupplyBoost) =>
      getSupplyRateMetrics({
        supplyApr: toNumberOrNull(marketRatesData?.lendApr),
        rebasingYieldApr,
        crvBoostApr: crvRates,
        extraIncentivesApr: getOnChainExtraIncentiveAprs(rewardsApr),
        campaignsApr: getCampaignAprs(campaigns),
        userSupplyBoost,
        convertRate,
      }),
  )

  const balances = useUserBalances(params)
  const supplyAsset = combineQueries(
    [
      useTokenUsdRate({ chainId, tokenAddress: market.addresses?.borrowed_token }),
      useMarketVaultPricePerShare(params),
      balances,
    ],
    (usdRate, perShare, { totalShares: totalShares = '0' }): SupplyAsset => ({
      symbol: market.borrowed_token.symbol,
      address: market.borrowed_token.address as Address,
      usdRate,
      depositedAmount: decimalMultiply(perShare, totalShares),
      depositedUsdValue: decimalMultiply(perShare, totalShares, usdRate),
    }),
  )

  const extraIncentives = combineQueries(
    [supplyMetrics, userSupplyBoost, onChainRewards],
    ({ userBoostRate }, userBoost, { rewardsApr }) =>
      formatSupplyExtraIncentives({
        incentives: rewardsApr.map(r => ({
          title: r.symbol,
          percentage: convertRate(r.apr),
          blockchainId,
          address: r.tokenAddress,
        })),
        userRate: userBoostRate,
        userBoost,
      }),
  )

  return (
    <SupplyPositionDetailsCard>
      <Grid container spacing={Spacing.md} sx={{ padding: Spacing.sm }}>
        <MetricGrid>
          <Metric
            category={METRIC_CATEGORY}
            label={netSupplyRateTitle}
            value={mapQuery(supplyMetrics, ({ totalUserBoost }) => totalUserBoost)}
            valueOptions={{
              unit: 'percentage',
              abbreviate: false,
              formatter: formatCappedRateValue,
              ...(noGauge && { fallback: `No Gauge` }),
            }}
            notional={mapQuery(userSupplyBoost, data => t`your boost ${formatNumber(data, 'multiplier')}`)}
            valueTooltip={{
              title: netSupplyRateTitle,
              body: (
                <MarketSupplyRateTooltipContent
                  supplyRate={supplyMetrics.data?.supplyRate}
                  averageSupplyRate={snapshots.data?.supplyAverageMetrics.averageLendRate}
                  periodLabel={AVERAGE_CATEGORIES[RATE_CATEGORY].period}
                  extraRewards={campaigns}
                  extraIncentives={extraIncentives.data ?? []}
                  totalRate={supplyMetrics.data?.totalUserBoost}
                  totalAverageRate={snapshots.data?.supplyAverageMetrics.totalAverageUserBoost}
                  boost={{
                    type: 'user',
                    rate: supplyMetrics.data?.userBoostRate,
                    totalRate: supplyMetrics.data?.totalUserBoost,
                    totalAverageRate: snapshots.data?.supplyAverageMetrics.totalAverageUserBoost,
                  }}
                  rebasingYieldRate={snapshots.data?.rebasingYieldRate}
                  rebasingSymbol={supplyAsset.data?.symbol}
                  isLoading={extraIncentives.isLoading} // todo: implement Query<> states in tooltip
                />
              ),
              placement: 'top',
              arrow: false,
              clickable: true,
            }}
          />
        </MetricGrid>
        <MetricGrid>
          <Metric
            category={METRIC_CATEGORY}
            label={t`Amount supplied`}
            value={mapQuery(supplyAsset, ({ depositedUsdValue }) => depositedUsdValue)}
            valueOptions={{ unit: 'dollar' }}
            notional={mapQuery(supplyAsset, ({ depositedAmount, symbol }) => ({
              value: depositedAmount,
              unit: { symbol: ` ${symbol}`, position: 'suffix' as const },
            }))}
            valueTooltip={{
              title: t`Amount Supplied`,
              body: <AmountSuppliedTooltipContent balances={q(balances)} supplyAsset={supplyAsset} />,
              placement: 'top',
              arrow: false,
              clickable: true,
            }}
          />
        </MetricGrid>
        <MetricGrid>
          <Metric
            category={METRIC_CATEGORY}
            label={t`Vault shares`}
            value={mapQuery(balances, ({ totalShares }) => totalShares)}
            valueOptions={{}}
            notional={mapQuery(balances, ({ stakedPercentage = '0' }) => ({
              value: stakedPercentage,
              unit: { symbol: t`% staked`, position: 'suffix' as const },
            }))}
            valueTooltip={{
              title: t`Vault Shares`,
              body: <VaultSharesTooltipContent />,
              placement: 'top',
              arrow: false,
              clickable: true,
            }}
          />
        </MetricGrid>
        <MetricGrid>
          <Metric
            category={METRIC_CATEGORY}
            label={t`veCRV Boost`}
            value={q(userSupplyBoost)}
            valueOptions={{ unit: 'multiplier', ...(noGauge && { fallback: `No Gauge` }) }}
            valueTooltip={{
              title: t`veCRV Boost`,
              body: <BoostTooltipContent />,
              placement: 'top',
              arrow: false,
              clickable: true,
            }}
          />
        </MetricGrid>
      </Grid>
    </SupplyPositionDetailsCard>
  )
}
