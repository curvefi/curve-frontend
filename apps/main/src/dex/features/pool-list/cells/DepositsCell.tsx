import { formatNumber } from '@primitives/number.utils'
import { TokenInfo } from '@ui/components/TokenInfo'
import type { PoolRow } from '../types'

export const DepositsCell = ({ pool }: { pool: PoolRow }) => (
  <TokenInfo
    icon={null}
    iconPosition="right"
    primary={formatNumber(pool.userPosition.depositsUsd, 'usd.precise')}
    secondary={`${formatNumber(pool.userPosition.lpBalance, 'token.balance')} LP`}
    boldPrimary
    sx={{ justifyContent: 'end' }}
  />
)
