import { ReactNode } from 'react'
import { zeroAddress } from 'viem'
import { USER_NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import { useMarketContext } from '@/llamalend/features/market-context'
import { useMarketRates, useMarketVaultOnChainRewards, useMarketVaultPricePerShare } from '@/llamalend/queries/market'
import { useUserBalances, useUserSupplyBoost } from '@/llamalend/queries/user'
import {
  aprToApy,
  formatSupplyExtraIncentives,
  getLatestSnapshotValue,
  getSupplyApyAverageMetrics,
  getSupplyApyMetrics,
  sumCampaignsApy,
  sumOnChainExtraIncentivesApy,
  toNumberOrNull,
} from '@/llamalend/rates.utils'
import { BoostTooltipContent } from '@/llamalend/widgets/tooltips/BoostTooltipContent'
import { MarketSupplyRateTooltipContent } from '@/llamalend/widgets/tooltips/MarketSupplyRateTooltipContent'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { Grid, Stack } from '@mui/material'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { assert } from '@primitives/objects.utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { LlamaChainId } from '@ui-kit/features/connect-wallet/lib/types'
import { combineQueries } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { TabsSwitcher } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery, q } from '@ui-kit/types/util'
import { AVERAGE_CATEGORIES, type AverageCategory, decimalMultiply, formatNumber } from '@ui-kit/utils'
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

export const SupplyPositionDetails = ({ positionLabel }: { positionLabel: string }) => {
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
    snapshots => ({
      rebasingYield: getLatestSnapshotValue(snapshots, snapshot => snapshot.borrowedToken.rebasingYield),
      supplyAverageMetrics: getSupplyApyAverageMetrics({ snapshots, daysBack: rateWindow }),
    }),
  )

  const supplyMetrics = combineQueries(
    [snapshots, useMarketRates(params), onChainRewards, userSupplyBoost],
    ({ rebasingYield }, marketRatesData, { crvRates, rewardsApr }, userSupplyBoost) =>
      getSupplyApyMetrics({
        supplyApy: toNumberOrNull(marketRatesData?.lendApy),
        rebasingYieldApy: rebasingYield,
        crvBoostApr: crvRates,
        extraIncentivesApy: sumOnChainExtraIncentivesApy(rewardsApr),
        campaignsApy: sumCampaignsApy(campaigns),
        userSupplyBoost,
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
    ({ userBoostApy }, userBoost, { rewardsApr }) =>
      formatSupplyExtraIncentives({
        incentives: rewardsApr.map(r => ({
          title: r.symbol,
          percentage: aprToApy(r.apy)!,
          blockchainId,
          address: r.tokenAddress,
        })),
        userRate: userBoostApy,
        userBoost,
      }),
  )

  return (
    <Stack>
      <TabsSwitcher
        variant="contained"
        value={SUPPLY_POSITION_TAB}
        options={[{ value: SUPPLY_POSITION_TAB, label: positionLabel }]}
      />
      <Grid container spacing={Spacing.md} sx={{ padding: Spacing.sm, backgroundColor: t => t.design.Layer[1].Fill }}>
        <MetricGrid>
          <Metric
            category={METRIC_CATEGORY}
            label={USER_NET_SUPPLY_RATE_TITLE}
            value={mapQuery(supplyMetrics, ({ totalUserBoost }) => totalUserBoost)}
            valueOptions={{ unit: 'percentage', ...(noGauge && { fallback: `No Gauge` }) }}
            notional={mapQuery(userSupplyBoost, data => t`your boost ${formatNumber(data, 'multiplier')}`)}
            valueTooltip={{
              title: USER_NET_SUPPLY_RATE_TITLE,
              body: (
                <MarketSupplyRateTooltipContent
                  supplyApy={supplyMetrics.data?.supplyApy}
                  averageSupplyApy={snapshots.data?.supplyAverageMetrics.averageLendApy}
                  periodLabel={AVERAGE_CATEGORIES[RATE_CATEGORY].period}
                  extraRewards={campaigns}
                  extraIncentives={extraIncentives.data ?? []}
                  totalApy={supplyMetrics.data?.totalUserBoost}
                  totalAverageApy={snapshots.data?.supplyAverageMetrics.totalAverageUserBoost}
                  boost={{
                    type: 'user',
                    apy: supplyMetrics.data?.userBoostApy,
                    totalApy: supplyMetrics.data?.totalUserBoost,
                    totalAverageApy: snapshots.data?.supplyAverageMetrics.totalAverageUserBoost,
                  }}
                  rebasingYieldApy={snapshots.data?.rebasingYield}
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
    </Stack>
  )
}
