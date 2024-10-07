import FieldHelperUsdRate from '@/components/FieldHelperUsdRate'
import { useTokensUSDRates } from '@/entities/token'
import { type DepositRewardFormValues } from '@/features/deposit-gauge-reward/types'
import { FlexContainer } from '@/shared/ui/styled-containers'
import { useFormContext } from 'react-hook-form'

export const HelperFields: React.FC<{ chainId: ChainId; poolId: string }> = ({ chainId, poolId }) => {
  const { watch } = useFormContext<DepositRewardFormValues>()
  const rewardTokenId = watch('rewardTokenId')
  const amount = watch('amount')

  const {
    data: [tokenUsdRate],
  } = useTokensUSDRates([rewardTokenId])

  return (
    <FlexContainer>
      <FieldHelperUsdRate amount={amount ?? '0'} usdRate={tokenUsdRate} />
    </FlexContainer>
  )
}
