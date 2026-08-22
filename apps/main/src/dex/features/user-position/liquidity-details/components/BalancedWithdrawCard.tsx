import { t } from '@evm-ui/lib/i18n'
import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import { TokenIcon } from '@evm-ui/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { mapQuery } from '@evm-ui/types/util'
import { amount, formatNumber } from '@evm-ui/utils'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
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
