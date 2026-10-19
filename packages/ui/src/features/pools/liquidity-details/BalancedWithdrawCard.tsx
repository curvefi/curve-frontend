import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { formatNumber } from '@primitives/number.utils'
import { ErrorIconButton } from '@ui/components/ErrorIconButton'
import { TokenIcon } from '@ui/components/TokenIcon'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { amount } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import type { BalancedWithdrawRow } from './types'

const { Spacing } = SizesAndSpaces

export const BalancedWithdrawCard = ({
  blockchainId,
  rows,
}: {
  blockchainId: string
  rows: QueryProp<BalancedWithdrawRow[]>
}) => (
  <Card size="extraSmall" variant="inline">
    <CardHeader title={t`Balanced withdraw amount`} />
    <CardContent component={Stack} sx={{ gap: Spacing.xs, marginBlockStart: Spacing.xs }}>
      {rows.data?.map(({ address, symbol, amount: tokenAmount }) => (
        <ActionInfo
          key={address}
          label={
            <Stack component="span" direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
              <TokenIcon size="mui-md" blockchainId={blockchainId} tooltip={symbol.data} address={address} />
              <WithSkeleton loading={symbol.isLoading}>
                {symbol.error ? <ErrorIconButton error={symbol.error} size="small" /> : symbol.data}
              </WithSkeleton>
            </Stack>
          }
          value={mapQuery(tokenAmount, value => formatNumber(amount(value), 'token.balance'))}
        />
      ))}
    </CardContent>
  </Card>
)
