import { t } from '@lingui/macro'
import styled from 'styled-components'
import useStore from '@/dex/store/useStore'
import { STABLESWAP } from '@/dex/components/PageCreatePool/constants'
import Box from '@ui/Box'
import {
  CategoryColumn,
  CategoryDataRow,
  SummaryCategoryTitle,
  SummaryDataTitle,
  SummaryData,
  SummaryDataPlaceholder,
  StyledCheckmark,
} from '@/dex/components/PageCreatePool/Summary/styles'

type Props = {
  chainId: ChainId
}

const PoolInfoSummary = ({ chainId }: Props) => {
  const { poolSymbol, swapType, poolName, assetType, validation } = useStore((state) => state.createPool)
  const { stableswapFactory } = useStore((state) => state.networks.networks[chainId])

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
      {swapType === STABLESWAP && stableswapFactory && (
        <CategoryDataRow>
          <SummaryDataTitle>{t`Asset Type:`}</SummaryDataTitle>
          {assetType === null ? (
            <SummaryDataPlaceholder>{t`No asset type set`}</SummaryDataPlaceholder>
          ) : (
            <SummaryData>{assetType}</SummaryData>
          )}
        </CategoryDataRow>
      )}
    </StyledCategoryColumn>
  )
}

const StyledCategoryColumn = styled(CategoryColumn)`
  border-bottom: none;
`

export default PoolInfoSummary
