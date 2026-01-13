import { styled } from 'styled-components'
import {
  CategoryColumn,
  CategoryDataRow,
  SummaryCategoryTitle,
  SummaryDataTitle,
  SummaryData,
  SummaryDataPlaceholder,
  StyledCheckmark,
} from '@/dex/components/PageCreatePool/Summary/styles'
import { useStore } from '@/dex/store/useStore'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'

export const PoolInfoSummary = () => {
  const poolSymbol = useStore((state) => state.createPool.poolSymbol)
  const poolName = useStore((state) => state.createPool.poolName)
  const validation = useStore((state) => state.createPool.validation)

  return (
    <StyledCategoryColumn>
      <Box flex>
        {validation.poolType && validation.tokensInPool && validation.parameters && validation.poolInfo && (
          <StyledCheckmark name={'CheckmarkFilled'} size={16} aria-label={t`Checkmark filled`} />
        )}
        <SummaryCategoryTitle>{t`Pool Info:`}</SummaryCategoryTitle>
      </Box>
      <CategoryDataRow>
        <SummaryDataTitle>{t`Name:`}</SummaryDataTitle>
        {poolName === '' ? (
          <SummaryDataPlaceholder>{t`No name set`}</SummaryDataPlaceholder>
        ) : (
          <SummaryData>{poolName}</SummaryData>
        )}
      </CategoryDataRow>
      <CategoryDataRow>
        <SummaryDataTitle>{t`Symbol:`}</SummaryDataTitle>
        {poolSymbol === '' ? (
          <SummaryDataPlaceholder>{t`No symbol set`}</SummaryDataPlaceholder>
        ) : (
          <SummaryData>{poolSymbol}</SummaryData>
        )}
      </CategoryDataRow>
    </StyledCategoryColumn>
  )
}

const StyledCategoryColumn = styled(CategoryColumn)`
  border-bottom: none;
`
