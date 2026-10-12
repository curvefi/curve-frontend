import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { TokenInfo } from '@ui/components/TokenInfo'
import { mapQuery } from '@ui/features/queries/util'
import type { PoolRow } from '../types'

export const DepositsCell = ({ pool: { userPosition } }: { pool: PoolRow }) => (
  <TokenInfo
    icon={null}
    iconPosition="right"
    primary={maybe(userPosition, p => mapQuery(p.depositsUsd, value => formatNumber(value, 'usd.precise')))}
    secondary={maybe(userPosition, p => `${formatNumber(p.lpBalance, 'token.balance')} LP`)}
    sx={{ justifyContent: 'end' }}
  />
)
