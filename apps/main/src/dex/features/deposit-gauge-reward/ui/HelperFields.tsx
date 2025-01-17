import { useFormContext } from 'react-hook-form'
import FieldHelperUsdRate from '@main/components/FieldHelperUsdRate'
import { type DepositRewardFormValues } from '@main/features/deposit-gauge-reward/types'
import { useTokensUSDRates } from '@main/entities/token'
import { FlexContainer } from '@ui/styled-containers'
import { ChainId } from '@main/types/main.types'

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
