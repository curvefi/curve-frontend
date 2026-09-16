import type { ReactNode } from 'react'
import type { MarketToken } from '@/llamalend/llama.utils'
import type { Chain } from '@curvefi/prices-api'
import type { MarketBorrower, VaultDepositor } from '@curvefi/prices-api/llamalend'
import { TokenAmount } from '@evm-ui/shared/ui/TokenAmount'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { TokenIcon } from '@ui/components/TokenIcon'
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

export const Percentage = ({ value }: { value: number | null | undefined }) => (
  <Typography variant="tableCellMBold">{formatNumber(value, 'percent.value')}</Typography>
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
