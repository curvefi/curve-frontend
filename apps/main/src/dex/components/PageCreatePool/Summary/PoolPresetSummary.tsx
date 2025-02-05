import { t } from '@lingui/macro'
import useStore from '@/dex/store/useStore'

import {
  CategoryDataRow,
  SummaryDataTitle,
  SummaryData,
  SummaryDataPlaceholder,
} from '@/dex/components/PageCreatePool/Summary/styles'
import { POOL_PRESETS } from '@/dex/components/PageCreatePool/constants'

const PoolPresetSummary = () => {
  const { poolPresetIndex } = useStore((state) => state.createPool)

  return (
    <>
      {poolPresetIndex === null ? (
        <CategoryDataRow>
          <SummaryDataTitle>{t`Preset:`}</SummaryDataTitle>
          <SummaryDataPlaceholder>{t`No preset set`}</SummaryDataPlaceholder>
        </CategoryDataRow>
      ) : (
        <CategoryDataRow>
          <SummaryDataTitle>{t`Preset:`}</SummaryDataTitle>
          <SummaryData>{t(POOL_PRESETS[poolPresetIndex].descriptionName)}</SummaryData>
        </CategoryDataRow>
      )}
    </>
  )
}

export default PoolPresetSummary
