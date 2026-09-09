import type { HeaderContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import { LegacyPoolColumnId } from '../columns'
import type { LegacyPoolRow } from '../types'

export const LegacyRewardsBaseHeader = ({ table }: HeaderContext<CurveTableFeatures, LegacyPoolRow, number | null>) =>
  table.getColumn(LegacyPoolColumnId.RewardsOther)?.getIsVisible() ? t`Base vAPY` : t`Rewards tAPR`
