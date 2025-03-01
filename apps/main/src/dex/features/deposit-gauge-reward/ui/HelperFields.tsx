import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import FieldHelperUsdRate from '@/dex/components/FieldHelperUsdRate'
import { type DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { FlexContainer } from '@ui/styled-containers'
import { ChainId } from '@/dex/types/main.types'
import useStore from '@/dex/store/useStore'

export const HelperFields = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
  const { watch } = useFormContext<DepositRewardFormValues>()
  const rewardTokenId = watch('rewardTokenId')
  const amount = watch('amount')

  const usdRatesMapper = useStore((state) => state.usdRates.usdRatesMapper)
  const tokens = [rewardTokenId]
  const tokensKey = JSON.stringify(tokens)

  const [tokenUsdRate] = useMemo(
    () => tokens.map((token) => (token ? usdRatesMapper[token] : undefined)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokensKey, usdRatesMapper],
  )

  return (
    <FlexContainer>
      <FieldHelperUsdRate amount={amount ?? '0'} usdRate={tokenUsdRate} />
    </FlexContainer>
  )
}
