import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useChainId } from 'wagmi'
import { type DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { useFormContext } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'
import { useTokenUsdRate } from '@evm-ui/lib/model/entities/token-usd-rate'
import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import { amount as toAmount, formatNumber } from '@evm-ui/utils'

export const HelperFields = () => {
  const { watchValue } = useFormContext<DepositRewardFormValues>()
  const rewardTokenId = watchValue('rewardTokenId')
  const amount = watchValue('amount')

  const chainId = useChainId()
  const { data: tokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: rewardTokenId }, !!rewardTokenId)
  const usdTotal = useMemo(
    () =>
      tokenUsdRate != null && +tokenUsdRate > 0 && +(amount ?? 0) > 0
        ? BigNumber(tokenUsdRate)
            .multipliedBy(amount ?? 0)
            .toFixed()
        : undefined,
    [amount, tokenUsdRate],
  )

  return (
    <ActionInfo
      label={t`Reward value`}
      value={formatNumber(toAmount(usdTotal), 'usd.amount')}
      valueTooltip={tokenUsdRate && `${t`Token price`}: ${formatNumber(tokenUsdRate, 'usd.amount')}`}
      size="small"
    />
  )
}
