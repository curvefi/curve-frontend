import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import type { HeaderContext } from '@tanstack/react-table'
import { t } from '@ui/lib/i18n'
import { LegacyPoolColumnId } from '../columns'
import type { LegacyPoolRow } from '../types'

export const LegacyRewardsBaseHeader = ({ table }: HeaderContext<CurveTableFeatures, LegacyPoolRow, number | null>) =>
  table.getColumn(LegacyPoolColumnId.RewardsOther)?.getIsVisible() ? t`Base vAPY` : t`Rewards tAPR`
