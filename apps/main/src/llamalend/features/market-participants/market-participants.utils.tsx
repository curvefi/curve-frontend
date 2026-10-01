import type { MarketToken } from '@/llamalend/llama.utils'
import type { Chain } from '@curvefi/prices-api'
import type { MarketBorrower, VaultDepositor } from '@curvefi/prices-api/llamalend'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { type Nullish, maybe, notFalsy } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { TokenIcon } from '@ui/components/TokenIcon'
import { constQ } from '@ui/features/queries/util'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces
const EXPANDED_METRIC_CATEGORY = 'llamalend.marketParticipantsExpanded'

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
  <Typography variant="tableCellMBold">{formatNumber(value, 'percent.value')}</Typography>
)

export const Health = ({ health }: Pick<BorrowerRow, 'health'>) => (
  <Typography variant="tableCellMRegular">{formatNumber(health, 'percent.value')}</Typography>
)

export const BorrowerExpandedPanel: ExpandedPanelComponent<BorrowerRow> = ({ row: { original: borrower } }) => (
  <MetricsGrid variant="mobileRows">
    <Metric
      category={EXPANDED_METRIC_CATEGORY}
      label={notFalsy(t`Collateral`, borrower.collateralToken?.symbol && `(${borrower.collateralToken.symbol})`).join(
        ' ',
      )}
      value={borrower.collateral}
      valueOptions={{ abbreviate: false, fallback: UNAVAILABLE_NOTATION }}
      notional={constQ({ value: borrower.collateralUsd, unit: 'dollar' })}
      icon={
        borrower.collateralToken && (
          <TokenIcon blockchainId={borrower.blockchainId} address={borrower.collateralToken.address} size="mui-sm" />
        )
      }
    />
    <Metric
      category={EXPANDED_METRIC_CATEGORY}
      label={notFalsy(t`Loan`, borrower.borrowToken?.symbol && `(${borrower.borrowToken.symbol})`).join(' ')}
      value={borrower.debt}
      valueOptions={{ abbreviate: false, fallback: UNAVAILABLE_NOTATION }}
      notional={constQ({ value: borrower.debtUsd, unit: 'dollar' })}
      icon={
        borrower.borrowToken && (
          <TokenIcon blockchainId={borrower.blockchainId} address={borrower.borrowToken.address} size="mui-sm" />
        )
      }
    />
    <Metric
      category={EXPANDED_METRIC_CATEGORY}
      label={t`Health`}
      value={borrower.health}
      valueOptions={{ unit: 'percentage', abbreviate: false, fallback: UNAVAILABLE_NOTATION }}
    />
  </MetricsGrid>
)

export const SupplierExpandedPanel: ExpandedPanelComponent<SupplierRow> = ({ row: { original: supplier } }) => (
  <MetricsGrid variant="mobileRows">
    <Metric
      category={EXPANDED_METRIC_CATEGORY}
      label={notFalsy(t`Supplied`, supplier.borrowToken?.symbol && `(${supplier.borrowToken.symbol})`).join(' ')}
      value={supplier.assets}
      valueOptions={{ abbreviate: false, fallback: UNAVAILABLE_NOTATION }}
      notional={maybe(supplier.assetsUsd, value => constQ({ value, unit: 'dollar' as const }))}
      icon={
        supplier.borrowToken && (
          <TokenIcon blockchainId={supplier.blockchainId} address={supplier.borrowToken.address} size="mui-sm" />
        )
      }
    />
  </MetricsGrid>
)
