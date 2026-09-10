import type { MarketToken } from '@/llamalend/llama.utils'
import type { BorrowRate, SupplyRate } from '@/llamalend/widgets/page-header/hooks/usePageHeader'
import { getPointsCampaignRows, type PointsCampaignRow } from '@evm-ui/features/points-campaigns/points-campaigns.utils'
import { RewardIcon } from '@evm-ui/shared/ui/RewardIcon'
import { MAINNET_CRV_ADDRESS } from '@evm-ui/utils'
import { scanTokenPath } from '@legacy-ui/utils'
import type { Address } from '@primitives/address.utils'
import { Chain } from '@primitives/network.utils'
import { maybes, notFalsy } from '@primitives/objects.utils'
import type { TokenInfoProps } from '@ui/components/TokenInfo'
import { constQ, mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { aprToApy } from '@ui/lib/rates.utils'

export type BreakdownSource = {
  tokenInfo: TokenInfoProps
  address?: Address
  explorerUrl?: string
  yieldBearing?: boolean
}

export type RateBreakdownRow = {
  source: BreakdownSource
  price: QueryProp<number | undefined>
  rate: number | null | undefined
  maxBoostRate?: number | null
}

export type RateBreakdownData = {
  rows: RateBreakdownRow[]
  points: PointsCampaignRow[]
  total: number | null
  maxBoostTotal?: number | null
  hasAdjustments: boolean
}

export const buildBorrowRateBreakdown = ({
  rate,
  chainId,
  blockchainId,
  collateralToken,
  collateralPrice,
}: {
  rate: BorrowRate
  chainId: number
  blockchainId: string
  collateralToken: MarketToken | undefined
  collateralPrice: QueryProp<number>
}): RateBreakdownData => {
  const incentives = notFalsy(
    ...rate.extraRewards.map(campaign => campaign.reward?.type === 'apr' && { ...campaign, reward: campaign.reward }),
  )
  const rebasingRow = notFalsy(
    maybes([rate.rebasingYield, collateralToken], (rebasingYield, collateralToken) => ({
      source: {
        tokenInfo: {
          address: collateralToken.address,
          blockchainId,
          iconPosition: 'left' as const,
          primary: collateralToken.symbol,
        },
        address: collateralToken.address,
        explorerUrl: scanTokenPath(chainId, collateralToken.address),
        yieldBearing: true,
      },
      price: collateralPrice,
      rate: -rebasingYield,
    })),
  )

  return {
    rows: [
      ...incentives.map(({ platform, platformImageId, reward, symbol }) => ({
        source: {
          tokenInfo: {
            icon: <RewardIcon src={platformImageId} alt={platform} size="lg" />,
            iconPosition: 'left' as const,
            primary: symbol ?? platform,
          },
          address: reward.address,
          explorerUrl: scanTokenPath(chainId, reward.address),
        },
        price: constQ(reward.price),
        rate: -reward.value,
      })),
      ...rebasingRow,
      {
        source: { tokenInfo: { icon: null, iconPosition: 'left', primary: t`Borrow APR` } },
        price: constQ(undefined), // Base APR/APY rows have no token price.
        rate: rate.rate,
      },
    ],
    points: getPointsCampaignRows(rate.extraRewards),
    total: rate.totalBorrowRate,
    hasAdjustments: incentives.length > 0 || rate.rebasingYield != null,
  }
}

export const buildSupplyRateBreakdown = ({
  rate,
  chainId,
  blockchainId,
  borrowToken,
  prices,
  crvPrice,
}: {
  rate: SupplyRate
  chainId: number
  blockchainId: string
  borrowToken: MarketToken | undefined
  prices: QueryProp<Record<string, number>>
  crvPrice: QueryProp<number>
}): RateBreakdownData => {
  const crvRates = [rate.supplyApyCrvMinBoost, rate.supplyApyCrvMaxBoost]
  const crvRow: RateBreakdownRow[] = notFalsy(
    crvRates.some(Boolean) && {
      source: {
        tokenInfo: { address: MAINNET_CRV_ADDRESS, blockchainId: 'ethereum', iconPosition: 'left', primary: 'CRV' },
        address: MAINNET_CRV_ADDRESS,
        explorerUrl: scanTokenPath(Chain.Ethereum, MAINNET_CRV_ADDRESS),
      },
      price: crvPrice,
      rate: rate.supplyApyCrvMinBoost,
      maxBoostRate: rate.supplyApyCrvMaxBoost,
    },
  )
  const directIncentives = rate.extraIncentives.filter(({ address }) => address.toLowerCase() !== MAINNET_CRV_ADDRESS)
  const campaigns = notFalsy(
    ...rate.extraRewards.map(campaign => campaign.reward?.type === 'apr' && { ...campaign, reward: campaign.reward }),
  )
  const rebasingRow = notFalsy(
    maybes([rate.rebasingYield, borrowToken], (rebasingYield, borrowToken) => ({
      source: {
        tokenInfo: {
          address: borrowToken.address,
          blockchainId,
          iconPosition: 'left' as const,
          primary: borrowToken.symbol,
        },
        address: borrowToken.address,
        explorerUrl: scanTokenPath(chainId, borrowToken.address),
        yieldBearing: true,
      },
      price: mapQuery(prices, prices => prices[borrowToken.address]),
      rate: rebasingYield,
    })),
  )

  return {
    rows: [
      ...crvRow,
      ...directIncentives.map(({ address, blockchainId, percentage, title }) => ({
        source: {
          tokenInfo: { address, blockchainId, iconPosition: 'left' as const, primary: title },
          address: address as Address,
          explorerUrl: scanTokenPath(chainId, address),
        },
        price: mapQuery(prices, prices => prices[address]),
        rate: percentage,
      })),
      ...campaigns.map(({ platform, platformImageId, reward, symbol }) => ({
        source: {
          tokenInfo: {
            icon: <RewardIcon src={platformImageId} alt={platform} size="lg" />,
            iconPosition: 'left' as const,
            primary: symbol ?? platform,
          },
          address: reward.address,
          explorerUrl: scanTokenPath(chainId, reward.address),
        },
        price: constQ(reward.price),
        rate: aprToApy(reward.value, 'llamalend.rewards'),
      })),
      ...rebasingRow,
      {
        source: { tokenInfo: { icon: null, iconPosition: 'left', primary: t`Supply APY` } },
        price: constQ(undefined),
        rate: rate.supplyApy,
      },
    ],
    points: getPointsCampaignRows(rate.extraRewards),
    total: rate.totalMinBoost,
    maxBoostTotal: rate.totalMaxBoost,
    hasAdjustments:
      crvRow.length > 0 || directIncentives.length > 0 || campaigns.length > 0 || rate.rebasingYield != null,
  }
}
