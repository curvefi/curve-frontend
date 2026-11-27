import { getAddress, isAddressEqual } from 'viem'
import { sumCollateralYields } from '@/llamalend/collateral-yields'
import { BORROW_RATE_TITLE, SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import { hasEstimatedNetBorrowApr, type MarketToken } from '@/llamalend/llama.utils'
import type { BorrowRate, SupplyRate } from '@/llamalend/widgets/page-header/hooks/usePageHeader'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import type { TokenUsdRates } from '@evm-ui/queries/token-usd-rate.query'
import { MAINNET_CRV_ADDRESS } from '@evm-ui/utils'
import { scanTokenPath } from '@legacy-ui/utils'
import type { Address } from '@primitives/address.utils'
import { Chain } from '@primitives/network.utils'
import { type Nullish, maybe, maybes, notFalsy } from '@primitives/objects.utils'
import { RewardIcon } from '@ui/components/RewardIcon'
import type { TokenInfoProps } from '@ui/components/TokenInfo'
import { getPointsCampaignRows, type PointsCampaignRow } from '@ui/features/points-campaigns/points-campaigns.utils'
import { constQ, type QueryProp } from '@ui/features/queries/util'
import { aprToApy } from '@ui/lib/rates.utils'

export type BreakdownBadge = 'yieldBearing' | 'lpToken'

type BreakdownSource = { tokenInfo: TokenInfoProps; address?: Address; explorerUrl?: string; badge?: BreakdownBadge }

const CRV_SOURCE: BreakdownSource = {
  tokenInfo: {
    token: { address: MAINNET_CRV_ADDRESS },
    blockchainId: 'ethereum',
    iconPosition: 'left',
    primary: 'CRV',
  },
  address: MAINNET_CRV_ADDRESS,
  explorerUrl: scanTokenPath(Chain.Ethereum, MAINNET_CRV_ADDRESS),
}

export type RateBreakdownRow = {
  source: BreakdownSource
  price: QueryProp<number | undefined>
  rate: number | Nullish
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
  crvPrice,
}: {
  rate: BorrowRate
  chainId: number
  blockchainId: BlockchainId
  collateralToken: MarketToken | undefined
  collateralPrice: QueryProp<number>
  crvPrice: QueryProp<number>
}): RateBreakdownData => {
  const incentives = notFalsy(
    ...rate.extraRewards.map(campaign => campaign.reward?.type === 'apr' && { ...campaign, reward: campaign.reward }),
  )
  const collateralRow = notFalsy(
    maybes(
      [sumCollateralYields(rate.collateralYields, 'collateral'), collateralToken],
      (collateralYieldApr, collateralToken): RateBreakdownRow => ({
        source: {
          tokenInfo: {
            token: collateralToken,
            blockchainId,
            iconPosition: 'left' as const,
            primary: collateralToken.symbol,
          },
          address: collateralToken.address,
          explorerUrl: scanTokenPath(chainId, collateralToken.address),
          badge:
            (rate.collateralYields.rebasingApr != null && 'yieldBearing') ||
            (rate.collateralYields.baseApr != null && 'lpToken') ||
            undefined,
        },
        price: collateralPrice,
        rate: -collateralYieldApr,
      }),
    ),
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
      ...notFalsy(
        maybe(rate.collateralYields.crvApr, crvApr => ({ source: CRV_SOURCE, price: crvPrice, rate: -crvApr })),
      ),
      ...collateralRow,
      {
        source: { tokenInfo: { icon: null, iconPosition: 'left', primary: BORROW_RATE_TITLE } },
        price: constQ(undefined), // Base APR/APY rows have no token price.
        rate: rate.rate,
      },
    ],
    points: getPointsCampaignRows(rate.extraRewards),
    total: rate.totalBorrowRate,
    hasAdjustments: hasEstimatedNetBorrowApr({ extraRewards: incentives, collateralYields: rate.collateralYields }),
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
  blockchainId: BlockchainId
  borrowToken: MarketToken | undefined
  prices: TokenUsdRates
  crvPrice: QueryProp<number>
}): RateBreakdownData => {
  const crvRates = [rate.supplyApyCrvMinBoost, rate.supplyApyCrvMaxBoost]
  const crvRow: RateBreakdownRow[] = notFalsy(
    crvRates.some(Boolean) && {
      source: CRV_SOURCE,
      price: crvPrice,
      rate: rate.supplyApyCrvMinBoost,
      maxBoostRate: rate.supplyApyCrvMaxBoost,
    },
  )
  const directIncentives = rate.extraIncentives.filter(({ address }) => !isAddressEqual(address, MAINNET_CRV_ADDRESS))
  const campaigns = notFalsy(
    ...rate.extraRewards.map(campaign => campaign.reward?.type === 'apr' && { ...campaign, reward: campaign.reward }),
  )
  const rebasingRow = notFalsy(
    maybes([rate.rebasingYield, borrowToken], (rebasingYield, borrowToken): RateBreakdownRow => ({
      source: {
        tokenInfo: { token: borrowToken, blockchainId, iconPosition: 'left' as const, primary: borrowToken.symbol },
        address: getAddress(borrowToken.address),
        explorerUrl: scanTokenPath(chainId, borrowToken.address),
        badge: 'yieldBearing',
      },
      price: prices[borrowToken.address],
      rate: rebasingYield,
    })),
  )

  return {
    rows: [
      ...crvRow,
      ...directIncentives.map(({ address, blockchainId, percentage, title }) => ({
        source: {
          tokenInfo: {
            token: { address: getAddress(address) },
            blockchainId,
            iconPosition: 'left' as const,
            primary: title,
          },
          address: getAddress(address),
          explorerUrl: scanTokenPath(chainId, address),
        },
        price: prices[address],
        rate: percentage,
      })),
      ...campaigns.map(({ platform, platformImageId, reward, symbol }) => ({
        source: {
          tokenInfo: {
            icon: <RewardIcon src={platformImageId} alt={platform} size="lg" />,
            iconPosition: 'left' as const,
            primary: symbol ?? platform,
          },
          address: getAddress(reward.address),
          explorerUrl: scanTokenPath(chainId, reward.address),
        },
        price: constQ(reward.price),
        rate: aprToApy(reward.value, 'llamalend.rewards'),
      })),
      ...rebasingRow,
      {
        source: { tokenInfo: { icon: null, iconPosition: 'left', primary: SUPPLY_RATE_TITLE } },
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
