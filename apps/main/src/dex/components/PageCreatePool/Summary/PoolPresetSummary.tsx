import { POOL_PRESETS } from '@/dex/components/PageCreatePool/constants'
import {
  CategoryDataRow,
  SummaryDataTitle,
  SummaryData,
  SummaryDataPlaceholder,
} from '@/dex/components/PageCreatePool/Summary/styles'
import { useStore } from '@/dex/store/useStore'
import { t } from '@ui-kit/lib/i18n'

export const PoolPresetSummary = () => {
  const poolPresetIndex = useStore((state) => state.createPool.poolPresetIndex)

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
