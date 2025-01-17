import { t } from '@lingui/macro'
import styled from 'styled-components'

import useStore from '@main/store/useStore'

import { CRYPTOSWAP } from '@main/components/PageCreatePool/constants'

import Box from '@ui/Box'
import {
  CategoryColumn,
  SummaryData,
  SummaryDataPlaceholder,
  SummaryCategoryTitle,
  StyledCheckmark,
} from '@main/components/PageCreatePool/Summary/styles'

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
