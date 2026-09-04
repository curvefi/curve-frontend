import type { ReactNode } from 'react'
import type { MarketToken } from '@/llamalend/llama.utils'
import { TokenAmount } from '@/llamalend/widgets/TokenAmount'
import { UNAVAILABLE_NOTATION } from '@/llamalend/widgets/tooltips/tooltip.utils'
import type { Chain } from '@curvefi/prices-api'
import type { MarketBorrower, VaultDepositor } from '@curvefi/prices-api/llamalend'
import { t } from '@evm-ui/lib/i18n'
import { ExpandedPanelActions } from '@evm-ui/shared/ui/DataTable/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@evm-ui/shared/ui/DataTable/ExpansionRow'
import { TokenIcon } from '@evm-ui/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { formatNumber } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { notFalsy } from '@primitives/objects.utils'

const { Spacing } = SizesAndSpaces

type ParticipantRow = {
  explorerUrl?: string
  blockchainId: Chain
}

export type BorrowerRow = MarketBorrower &
  ParticipantRow & {
    borrowToken: MarketToken | undefined
    collateralToken: MarketToken | undefined
  }

export type SupplierRow = VaultDepositor &
  ParticipantRow & {
    assetsUsd: number | undefined
    borrowToken: MarketToken | undefined
  }

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

export const Percentage = ({ value }: { value: number | null | undefined }) => (
  <Typography variant="tableCellMBold">
    {value == null ? UNAVAILABLE_NOTATION : formatNumber(value, 'percent.value')}
  </Typography>
)

export const Health = ({ health }: Pick<BorrowerRow, 'health'>) => (
  <Typography variant="tableCellMRegular">{formatNumber(health, 'percent.value')}</Typography>
)

const ExpandedMetric = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
    <Typography variant="bodyMRegular" color="textSecondary">
      {label}
    </Typography>
    {children}
  </Stack>
)

export const BorrowerExpandedPanel: ExpandedPanelComponent<BorrowerRow> = ({ row: { original: borrower } }) => (
  <Stack sx={{ gap: Spacing.xs }}>
    <ExpandedMetric label={t`Collateral`}>
      <TokenAmount
        amount={borrower.collateral}
        amountUsd={borrower.collateralUsd}
        blockchainId={borrower.blockchainId}
        tokenAddress={borrower.collateralToken?.address}
        abbreviate={false}
        iconSize="mui-sm"
      />
    </ExpandedMetric>
    <ExpandedMetric label={t`Loan`}>
      <TokenAmount
        amount={borrower.debt}
        amountUsd={borrower.debtUsd}
        blockchainId={borrower.blockchainId}
        tokenAddress={borrower.borrowToken?.address}
        abbreviate={false}
        iconSize="mui-sm"
      />
    </ExpandedMetric>
    <ExpandedMetric label={t`Health`}>
      <Health health={borrower.health} />
    </ExpandedMetric>
  </Stack>
)

export const SupplierExpandedPanel: ExpandedPanelComponent<SupplierRow> = ({ row: { original: supplier } }) => (
  <ExpandedMetric label={t`Supplied`}>
    <TokenAmount
      amount={supplier.assets}
      amountUsd={supplier.assetsUsd}
      blockchainId={supplier.blockchainId}
      tokenAddress={supplier.borrowToken?.address}
      abbreviate={false}
      iconSize="mui-sm"
    />
  </ExpandedMetric>
)

const ParticipantActions = ({ explorerUrl }: ParticipantRow) => (
  <ExpandedPanelActions
    actions={notFalsy(
      explorerUrl && {
        id: 'view-on-explorer',
        label: t`View on explorer`,
        href: explorerUrl,
        size: 'extraSmall',
        color: 'ghost',
      },
    )}
  />
)

export const BorrowerExpandedPanelActions: ExpandedPanelComponent<BorrowerRow> = ({ row: { original } }) => (
  <ParticipantActions {...original} />
)

export const SupplierExpandedPanelActions: ExpandedPanelComponent<SupplierRow> = ({ row: { original } }) => (
  <ParticipantActions {...original} />
)
