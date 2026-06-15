import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import { LARGE_APY } from '@/dex/constants'
import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber } from '@ui-kit/utils'
import type { PoolListItem } from '../poolList.types'
import { Placeholder } from './Placeholder'

const BaseApyTooltip = ({ day, week }: { day: number; week: number | null | undefined }) => (
  <Stack component="span">
    <strong>{t`Pool APY`}</strong>
    <span>{t`Daily`}: {formatNumber(day, 'percent.value')}</span>
    {week != null && <span>{t`Weekly`}: {formatNumber(week, 'percent.value')}</span>}
  </Stack>
)

export const PoolListBaseApyCell = ({
  row: { original: pool },
  getValue,
}: CellContext<PoolListItem, number | null>) => {
  const day = getValue()

  return day == null ? (
    <Placeholder />
  ) : day > LARGE_APY ? (
    <ChipVolatileBaseApy />
  ) : (
    <Tooltip title={<BaseApyTooltip day={day} week={pool.baseWeeklyApr} />}>
      <Stack>{formatNumber(day, 'percent.rate')}</Stack>
    </Tooltip>
  )
}
