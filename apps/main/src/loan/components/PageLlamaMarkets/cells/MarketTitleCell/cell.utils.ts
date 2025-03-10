import { PoolRewards } from '@/loan/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'

export const getRewardsDescription = ({ action, description, multiplier }: PoolRewards) =>
  `${multiplier}x: ${
    {
      lp: description ?? t`Earn points by providing liquidity.`,
      supply: t`Earn points by supplying liquidity.`,
      borrow: t`Earn points by borrowing.`,
    }[action]
  }`
