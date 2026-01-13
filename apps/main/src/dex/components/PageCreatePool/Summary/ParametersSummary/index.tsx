import { STABLESWAP } from '@/dex/components/PageCreatePool/constants'
import { StableswapParameters as CryptoswapParameters } from '@/dex/components/PageCreatePool/Summary/ParametersSummary/CryptoswapParameters'
import { StableswapParameters } from '@/dex/components/PageCreatePool/Summary/ParametersSummary/StableswapParameters'
import { PoolPresetSummary } from '@/dex/components/PageCreatePool/Summary/PoolPresetSummary'
import { CategoryColumn, SummaryCategoryTitle, StyledCheckmark } from '@/dex/components/PageCreatePool/Summary/styles'
import { useStore } from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  chainId: ChainId
}

export const ParametersSummary = ({ chainId }: Props) => {
  const swapType = useStore((state) => state.createPool.swapType)
  const validation = useStore((state) => state.createPool.validation)

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
