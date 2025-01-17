import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import { STABLESWAP } from '@/components/PageCreatePool/constants'

import Box from '@/ui/Box'
import { CategoryColumn, SummaryCategoryTitle, StyledCheckmark } from '@/components/PageCreatePool/Summary/styles'
import StableswapParameters from '@/components/PageCreatePool/Summary/ParametersSummary/StableswapParameters'
import CryptoswapParameters from '@/components/PageCreatePool/Summary/ParametersSummary/CryptoswapParameters'
import PoolPresetSummary from '@/components/PageCreatePool/Summary/PoolPresetSummary'
import { ChainId } from '@/types/main.types'

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
