import type { MarketToken } from '@/llamalend/llama.utils'
import { aprToApy } from '@/llamalend/rates.utils'
import type { BorrowRate, SupplyRate } from '@/llamalend/widgets/page-header/hooks/usePageHeader'
import { getPointsCampaignRows, type PointsCampaignRow } from '@evm-ui/features/points-campaigns/points-campaigns.utils'
import { t } from '@evm-ui/lib/i18n'
import { RewardIcon } from '@evm-ui/shared/ui/RewardIcon'
import type { TokenInfoProps } from '@evm-ui/shared/ui/TokenInfo'
import { Chain, MAINNET_CRV_ADDRESS } from '@evm-ui/utils'
import { scanTokenPath } from '@legacy-ui/utils'
import { notFalsy } from '@primitives/objects.utils'

export type BreakdownSource = {
  tokenInfo: TokenInfoProps
  address?: string
  explorerUrl?: string
  yieldBearing?: boolean
}

export type RateBreakdownRow = {
  source: BreakdownSource
  price?: number
  rate?: number | null
  maxBoostRate?: number | null
}

export type RateBreakdownData = {
  rows: RateBreakdownRow[]
  points: PointsCampaignRow[]
  total: number | null
  maxBoostTotal?: number | null
  hasAdjustments: boolean
}

type TokenPrices = Record<string, number> | undefined

const tokenPrice = (prices: TokenPrices, address: string, fallback?: number) => prices?.[address] ?? fallback

export const buildBorrowRateBreakdown = ({
  rate,
  chainId,
  blockchainId,
  collateralToken,
  prices,
}: {
  rate: BorrowRate
  chainId: number
  blockchainId: string
  collateralToken: MarketToken | undefined
  prices?: Record<string, number>
}): RateBreakdownData => {
  const incentives = notFalsy(
    ...rate.extraRewards.map(campaign => campaign.reward?.type === 'apr' && { ...campaign, reward: campaign.reward }),
  )
  const rebasingRow = notFalsy(
    rate.rebasingYield != null && collateralToken
      ? {
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
          price: tokenPrice(prices, collateralToken.address),
          rate: -rate.rebasingYield,
        }
      : false,
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
        price: tokenPrice(prices, reward.address, reward.price),
        rate: -reward.value,
      })),
      ...rebasingRow,
      {
        source: { tokenInfo: { icon: null, iconPosition: 'left', primary: t`Borrow APR` } },
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
  prices?: Record<string, number>
  crvPrice?: number
}): RateBreakdownData => {
  const crvRates = [rate.supplyApyCrvMinBoost, rate.supplyApyCrvMaxBoost]
  const crvRow: RateBreakdownRow[] = notFalsy(
    crvRates.some(Boolean) && {
      source: {
        tokenInfo: {
          address: MAINNET_CRV_ADDRESS,
          blockchainId: 'ethereum',
          iconPosition: 'left',
          primary: 'CRV',
        },
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
    rate.rebasingYield != null && borrowToken
      ? {
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
          price: tokenPrice(prices, borrowToken.address),
          rate: rate.rebasingYield,
        }
      : false,
  )

  return {
    rows: [
      ...crvRow,
      ...directIncentives.map(({ address, blockchainId, percentage, title }) => ({
        source: {
          tokenInfo: { address, blockchainId, iconPosition: 'left' as const, primary: title },
          address,
          explorerUrl: scanTokenPath(chainId, address),
        },
        price: tokenPrice(prices, address),
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
        price: tokenPrice(prices, reward.address, reward.price),
        rate: aprToApy(reward.value),
      })),
      ...rebasingRow,
      {
        source: { tokenInfo: { icon: null, iconPosition: 'left', primary: t`Supply APY` } },
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
