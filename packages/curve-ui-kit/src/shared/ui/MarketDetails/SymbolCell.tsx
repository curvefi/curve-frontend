import { Stack, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { MetricSize } from '@ui-kit/shared/ui/Metric'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'

type SymbolCellProps = {
  label: string
  symbol: string | undefined | null
  tokenAddress: string | undefined | null
  loading: boolean
  size?: keyof Pick<typeof MetricSize, 'small' | 'medium'>
}

/** Mimics the style of Metric but is used for cells that only have a symbol and a token icon. */
export const SymbolCell = ({ label, symbol, tokenAddress, loading, size = 'medium' }: SymbolCellProps) => (
  <Stack alignItems={'start'}>
    <Typography variant="bodyXsRegular" color="textTertiary">
      {label}
    </Typography>
    <WithSkeleton loading={loading}>
      <Stack direction="row" alignItems="baseline" gap={1}>
        <Typography variant={MetricSize[size]}>{symbol == null ? t`N/A` : symbol}</Typography>
        <TokenIcon address={tokenAddress} size={size === 'small' ? 'mui-sm' : 'sm'} />
      </Stack>
    </WithSkeleton>
  </Stack>
)
