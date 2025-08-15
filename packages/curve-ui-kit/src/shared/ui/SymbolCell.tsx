import { Stack, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { MetricSize } from '@ui-kit/shared/ui/Metric'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { Tooltip, type TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'

type SymbolCellProps = {
  label: string
  symbol: string | undefined | null
  tokenAddress: string | undefined | null
  loading: boolean
  size?: keyof Pick<typeof MetricSize, 'small' | 'medium'>
  blockchainId: string
  valueTooltip?: Omit<TooltipProps, 'children'>
}

/** Mimics the style of Metric but is used for cells that only have a symbol and a token icon. */
export const SymbolCell = ({
  label,
  symbol,
  tokenAddress,
  loading,
  size = 'medium',
  blockchainId,
  valueTooltip,
}: SymbolCellProps) => (
  <Stack alignItems={'start'}>
    <Typography variant="bodyXsRegular" color="textTertiary">
      {label}
    </Typography>
    <WithSkeleton loading={loading}>
      <Tooltip
        arrow
        placement="bottom"
        {...valueTooltip}
        title={valueTooltip?.title ?? (symbol == null ? t`N/A` : symbol)}
      >
        <Stack direction="row" alignItems="baseline" gap={1}>
          <Typography variant={MetricSize[size]}>{symbol == null ? t`N/A` : symbol}</Typography>
          <TokenIcon blockchainId={blockchainId} address={tokenAddress} size={'mui-sm'} />
        </Stack>
      </Tooltip>
    </WithSkeleton>
  </Stack>
)
