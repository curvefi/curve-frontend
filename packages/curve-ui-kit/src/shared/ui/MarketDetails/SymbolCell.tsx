import { Stack, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'

type SymbolCellProps = {
  label: string
  symbol: string | undefined | null
  tokenAddress: string | undefined | null
  loading: boolean
}

/** Mimics the style of Metric in size 'medium'. */
export const SymbolCell = ({ label, symbol, tokenAddress, loading }: SymbolCellProps) => (
  <Stack alignItems={'start'}>
    <Typography variant="bodyXsRegular" color="textTertiary">
      {label}
    </Typography>
    <WithSkeleton loading={loading}>
      <Stack direction="row" alignItems="baseline" gap={1}>
        <Typography variant="highlightL">{symbol == null ? t`N/A` : symbol}</Typography>
        <TokenIcon address={tokenAddress} size="mui-sm" />
      </Stack>
    </WithSkeleton>
  </Stack>
)
