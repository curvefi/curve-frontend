import styled from 'styled-components'
import { CRYPTOSWAP } from '@/dex/components/PageCreatePool/constants'
import {
  CategoryColumn,
  SummaryData,
  SummaryDataPlaceholder,
  SummaryCategoryTitle,
  StyledCheckmark,
} from '@/dex/components/PageCreatePool/Summary/styles'
import useStore from '@/dex/store/useStore'
import Box from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'

const PoolTypeSummary = () => {
  const {
    swapType,
    validation,
    tokensInPool: { metaPoolToken },
  } = useStore((state) => state.createPool)

  return (
    <StyledCategoryColumn>
      <Box flex padding={'0 var(--spacing-2) var(--spacing-2) 0'}>
        {validation.poolType && <StyledCheckmark name={'CheckmarkFilled'} size={16} aria-label={t`Checkmark filled`} />}
        <Box flex>
          <StyledSummaryCategoryTitle>{t`Pool Type:`}</StyledSummaryCategoryTitle>
        </Box>
        {swapType === '' ? (
          <SummaryDataPlaceholder>{t`No pool type selected`}</SummaryDataPlaceholder>
        ) : (
          <SummaryData>
            {swapType === CRYPTOSWAP ? t`Cryptoswap` : t`Stableswap${metaPoolToken ? '-Meta' : ''}`}
          </SummaryData>
        )}
      </Box>
    </StyledCategoryColumn>
  )
}

const StyledCategoryColumn = styled(CategoryColumn)`
  margin-top: var(--spacing-1);
`

const StyledSummaryCategoryTitle = styled(SummaryCategoryTitle)`
  margin-bottom: 0;
`

export default PoolTypeSummary
