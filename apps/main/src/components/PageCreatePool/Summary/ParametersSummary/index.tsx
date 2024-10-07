


import Box from '@/ui/Box'
import { t } from '@lingui/macro'
import { STABLESWAP } from '@/components/PageCreatePool/constants'
import CryptoswapParameters from '@/components/PageCreatePool/Summary/ParametersSummary/CryptoswapParameters'
import StableswapParameters from '@/components/PageCreatePool/Summary/ParametersSummary/StableswapParameters'
import PoolPresetSummary from '@/components/PageCreatePool/Summary/PoolPresetSummary'
import { CategoryColumn, SummaryCategoryTitle, StyledCheckmark } from '@/components/PageCreatePool/Summary/styles'
import useStore from '@/store/useStore'

type Props = {
  chainId: ChainId
}

const ParametersSummary = ({ chainId }: Props) => {
  const { swapType, validation } = useStore((state) => state.createPool)

  return (
    <CategoryColumn>
      <Box flex>
        {validation.poolType && validation.tokensInPool && validation.parameters && (
          <StyledCheckmark name={'CheckmarkFilled'} size={16} aria-label={t`Checkmark filled`} />
        )}
        <SummaryCategoryTitle>{t`Parameters:`}</SummaryCategoryTitle>
      </Box>
      <PoolPresetSummary />
      {swapType === STABLESWAP ? (
        <StableswapParameters chainId={chainId} />
      ) : (
        <CryptoswapParameters chainId={chainId} />
      )}
    </CategoryColumn>
  )
}

export default ParametersSummary
