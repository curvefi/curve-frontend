import { type HeaderContext } from '@tanstack/table-core'
import { t } from '@ui-kit/lib/i18n'
import { LegacyPoolColumnId } from '../columns'
import type { LegacyPoolListItem } from '../legacy-pools.types'

export const LegacyRewardsBaseHeader = ({ table }: HeaderContext<LegacyPoolListItem, number | null>) =>
  table.getColumn(LegacyPoolColumnId.RewardsOther)?.getIsVisible() ? t`Base vAPY` : t`Rewards tAPR`
