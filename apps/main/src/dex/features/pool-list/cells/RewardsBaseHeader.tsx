import { type HeaderContext } from '@tanstack/table-core'
import { t } from '@ui-kit/lib/i18n'
import { PoolColumnId } from '../columns'
import type { PoolListItem } from '../types'

export const RewardsBaseHeader = ({ table }: HeaderContext<PoolListItem, number | null>) =>
  table.getColumn(PoolColumnId.RewardsOther)?.getIsVisible() ? t`Base vAPY` : t`Rewards tAPR`
