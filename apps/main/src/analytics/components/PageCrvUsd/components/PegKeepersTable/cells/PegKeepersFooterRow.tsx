import Stack from '@mui/material/Stack'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatUsd } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const formatUsdOrFallback = (value: string | undefined) => (value == null ? t`N/A` : formatUsd(Number(value)))

export const PegKeepersFooterRow = ({
  totalDebt,
  totalCeiling,
  loadingDebt,
  loadingCeiling,
  keeperCount,
}: {
  totalDebt: string | undefined
  totalCeiling: string | undefined
  loadingDebt: boolean
  loadingCeiling: boolean
  keeperCount: number
}) => (
  <TableCell sx={{ borderBottom: 'none', padding: Spacing.md }}>
    <Stack direction="row" justifyContent="space-between" gap={Spacing.md} flexWrap="wrap">
      <WithSkeleton loading={loadingDebt}>
        <Typography variant="bodyXsRegular" color="textSecondary">
          {t`Total`}: {formatUsdOrFallback(totalDebt)}
        </Typography>
      </WithSkeleton>
      <WithSkeleton loading={loadingCeiling}>
        <Typography variant="bodyXsRegular" color="textSecondary">
          {t`Ceiling`}: {formatUsdOrFallback(totalCeiling)}
        </Typography>
      </WithSkeleton>
      <Typography variant="bodyXsRegular" color="textSecondary">
        {keeperCount} {t`keepers`}
      </Typography>
    </Stack>
  </TableCell>
)
