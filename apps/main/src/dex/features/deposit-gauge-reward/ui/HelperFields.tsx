import { useChainId } from 'wagmi'
import { FieldHelperUsdRate } from '@/dex/components/FieldHelperUsdRate'
import { type DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { FlexContainer } from '@ui/styled-containers'
import { useFormContext } from '@ui-kit/features/forms'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

export const HelperFields = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method -- Existing violation before enabling this rule.
  const { watchValue } = useFormContext<DepositRewardFormValues>()
  const rewardTokenId = watchValue('rewardTokenId')
  const amount = watchValue('amount')

  const chainId = useChainId()
  const { data: tokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: rewardTokenId }, !!rewardTokenId)

  return (
    <FlexContainer>
      <FieldHelperUsdRate amount={amount ?? '0'} usdRate={tokenUsdRate} />
    </FlexContainer>
  )
}
