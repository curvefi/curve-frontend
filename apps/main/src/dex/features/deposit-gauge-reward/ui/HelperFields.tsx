import { useFormContext } from 'react-hook-form'
import FieldHelperUsdRate from '@/dex/components/FieldHelperUsdRate'
import { type DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { useTokensUSDRates } from '@/dex/entities/token'
import { FlexContainer } from '@ui/styled-containers'
import { ChainId } from '@/dex/types/main.types'

export const HelperFields = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
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
