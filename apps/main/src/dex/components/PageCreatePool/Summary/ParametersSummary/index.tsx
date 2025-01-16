import { t } from '@lingui/macro'

import useStore from '@/dex/store/useStore'

import { STABLESWAP } from '@/dex/components/PageCreatePool/constants'

import Box from '@ui/Box'
import { CategoryColumn, SummaryCategoryTitle, StyledCheckmark } from '@/dex/components/PageCreatePool/Summary/styles'
import StableswapParameters from '@/dex/components/PageCreatePool/Summary/ParametersSummary/StableswapParameters'
import CryptoswapParameters from '@/dex/components/PageCreatePool/Summary/ParametersSummary/CryptoswapParameters'
import PoolPresetSummary from '@/dex/components/PageCreatePool/Summary/PoolPresetSummary'

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
