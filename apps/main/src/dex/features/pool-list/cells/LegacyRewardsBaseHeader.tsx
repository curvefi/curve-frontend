import { t } from '@evm-ui/lib/i18n'
import { type HeaderContext } from '@tanstack/table-core'
import { LegacyPoolColumnId } from '../columns'
import type { LegacyPoolRow } from '../types'

export const LegacyRewardsBaseHeader = ({ table }: HeaderContext<LegacyPoolRow, number | null>) =>
  table.getColumn(LegacyPoolColumnId.RewardsOther)?.getIsVisible() ? t`Base vAPY` : t`Rewards tAPR`
