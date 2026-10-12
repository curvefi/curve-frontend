import type { MarketToken } from '@/llamalend/llama.utils'
import type { Chain } from '@curvefi/prices-api'
import type { MarketBorrower, VaultDepositor } from '@curvefi/prices-api/llamalend'
import { MetricExpandedPanel } from '@evm-ui/shared/ui/MetricExpandedPanel'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { type Nullish, maybe, notFalsy } from '@primitives/objects.utils'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { TokenIcon } from '@ui/components/TokenIcon'
import { constQ } from '@ui/features/queries/util'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export type ParticipantRow = { explorerUrl?: string; blockchainId: Chain }

export type BorrowerRow = MarketBorrower &
  ParticipantRow & { borrowToken: MarketToken | undefined; collateralToken: MarketToken | undefined }

export type SupplierRow = VaultDepositor &
  ParticipantRow & { assetsUsd: number | undefined; borrowToken: MarketToken | undefined }

export const TokenHeader = ({
  label,
  blockchainId,
  tokenAddress,
}: {
  label: string
  blockchainId: Chain
  tokenAddress: string | undefined
}) => (
  <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
    {label}
    <TokenIcon blockchainId={blockchainId} address={tokenAddress} size="mui-md" />
  </Stack>
)

export const Percentage = ({ value }: { value: number | Nullish }) => (
  <Typography variant="tableCellValueStrong">{formatNumber(value, 'percent.value')}</Typography>
)

export const Health = ({ health }: Pick<BorrowerRow, 'health'>) => (
  <Typography variant="tableCellValue">{formatNumber(health, 'percent.value')}</Typography>
)

export const BorrowerExpandedPanel: ExpandedPanelComponent<BorrowerRow> = ({ row: { original: borrower } }) => (
  <MetricsGrid variant="mobileRows">
    <MetricExpandedPanel
      label={notFalsy(t`Collateral`, borrower.collateralToken?.symbol && `(${borrower.collateralToken.symbol})`).join(
        ' ',
      )}
      value={borrower.collateral}
      notional={constQ({ value: borrower.collateralUsd, unit: 'dollar' })}
      icon={{ blockchainId: borrower.blockchainId, token: borrower.collateralToken }}
    />
    <MetricExpandedPanel
      label={notFalsy(t`Loan`, borrower.borrowToken?.symbol && `(${borrower.borrowToken.symbol})`).join(' ')}
      value={borrower.debt}
      notional={constQ({ value: borrower.debtUsd, unit: 'dollar' })}
      icon={{ blockchainId: borrower.blockchainId, token: borrower.borrowToken }}
    />
    <MetricExpandedPanel label={t`Health`} value={borrower.health} valueOptions={{ unit: 'percentage' }} />
  </MetricsGrid>
)

export const SupplierExpandedPanel: ExpandedPanelComponent<SupplierRow> = ({ row: { original: supplier } }) => (
  <MetricsGrid variant="mobileRows">
    <MetricExpandedPanel
      label={notFalsy(t`Supplied`, supplier.borrowToken?.symbol && `(${supplier.borrowToken.symbol})`).join(' ')}
      value={supplier.assets}
      notional={maybe(supplier.assetsUsd, value => constQ({ value, unit: 'dollar' as const }))}
      icon={{ blockchainId: supplier.blockchainId, token: supplier.borrowToken }}
    />
  </MetricsGrid>
)
