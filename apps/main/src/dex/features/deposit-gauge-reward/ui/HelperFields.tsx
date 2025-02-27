import { useFormContext } from 'react-hook-form'
import FieldHelperUsdRate from '@/dex/components/FieldHelperUsdRate'
import { type DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { FlexContainer } from '@ui/styled-containers'
import useStore from '@/dex/store/useStore'
import { useUsdRate } from '@ui-kit/lib/entities/usd-rates'

export const HelperFields = () => {
  const { watch } = useFormContext<DepositRewardFormValues>()
  const rewardTokenId = watch('rewardTokenId')
  const amount = watch('amount')

  const curve = useStore((state) => state.curve)
  const { data: tokenUsdRate } = useUsdRate(curve?.getUsdRate, rewardTokenId ?? '')

  return (
    <FlexContainer>
      <FieldHelperUsdRate amount={amount ?? '0'} usdRate={tokenUsdRate} />
    </FlexContainer>
  )
}
