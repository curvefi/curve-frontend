import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

import { POOL_PRESETS } from '@/components/PageCreatePool/constants'
import {
  CategoryDataRow,
  SummaryDataTitle,
  SummaryData,
  SummaryDataPlaceholder,
} from '@/components/PageCreatePool/Summary/styles'
import useStore from '@/store/useStore'


const PoolPresetSummary = () => {
  const { i18n } = useLingui()
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
          <SummaryData>{i18n._(POOL_PRESETS[poolPresetIndex].descriptionName)}</SummaryData>
        </CategoryDataRow>
      )}
    </>
  )
}

export default PoolPresetSummary
