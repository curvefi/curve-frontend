import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { formatNumber } from '@primitives/number.utils'
import { TokenIcon } from '@ui/components/TokenIcon'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { amount } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import type { LiquidityDetailsData } from '../hooks/useLiquidityDetails'

const { Spacing } = SizesAndSpaces

export const BalancedWithdrawCard = ({
  blockchainId,
  rows,
}: {
  blockchainId: string
  rows: LiquidityDetailsData['rows']
}) => (
  <Card size="inline">
    <CardHeader title={t`Balanced withdraw amount`} />
    <CardContent component={Stack} sx={{ gap: Spacing.xs, marginBlockStart: Spacing.xs }}>
      {rows.data?.map(row => (
        <ActionInfo
          key={row.address}
          label={
            <Stack component="span" direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
              <TokenIcon size="mui-md" blockchainId={blockchainId} tooltip={row.symbol} address={row.address} />
              {row.symbol}
            </Stack>
          }
          value={mapQuery(rows, () => formatNumber(amount(row.amount), 'token.balance'))}
        />
      ))}
    </CardContent>
  </Card>
)
