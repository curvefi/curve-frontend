import { useFormContext } from 'react-hook-form'
import { useChainId } from 'wagmi'
import { FieldHelperUsdRate } from '@/dex/components/FieldHelperUsdRate'
import { type DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { FlexContainer } from '@ui/styled-containers'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

export const HelperFields = () => {
  const { watch } = useFormContext<DepositRewardFormValues>()
  const rewardTokenId = watch('rewardTokenId')
  const amount = watch('amount')

  const chainId = useChainId()
  const { data: tokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: rewardTokenId }, !!rewardTokenId)

  return (
    <FlexContainer>
      <FieldHelperUsdRate amount={amount ?? '0'} usdRate={tokenUsdRate} />
    </FlexContainer>
  )
}
