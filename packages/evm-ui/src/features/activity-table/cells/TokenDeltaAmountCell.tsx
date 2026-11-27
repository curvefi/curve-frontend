import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { IconStack } from '@ui/components/IconStack'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { TokenIcon } from '@ui/components/TokenIcon'
import { TokenInfo } from '@ui/components/TokenInfo'
import type { ActivityRow } from '../types'
import { getActivityDeltaKey } from '../utils'

const ICON_STACK_MIN_DELTAS = 3

export const TokenDeltaAmountCell = ({ blockchainId, deltas }: Pick<ActivityRow, 'blockchainId' | 'deltas'>) => (
  <InlineTableCell sx={{ alignItems: 'end', height: 'auto' }}>
    {deltas.length >= ICON_STACK_MIN_DELTAS ? (
      <IconStack iconSize="md">
        {deltas.map(({ label, token }, index) => (
          <TokenIcon
            key={getActivityDeltaKey(label, token?.address, index)}
            blockchainId={blockchainId}
            address={token?.address}
            tooltip={token?.symbol}
            size="mui-md"
          />
        ))}
      </IconStack>
    ) : (
      deltas.map(({ label, token, amount }, index) => {
        const formattedAmount = formatNumber(amount, 'token.delta')
        return (
          <TokenInfo
            key={getActivityDeltaKey(label, token?.address, index)}
            icon={token && <TokenIcon address={token.address} blockchainId={blockchainId} size="mui-md" />}
            iconPosition="right"
            primary={token?.symbol ? `${formattedAmount} ${token.symbol}` : formattedAmount}
          />
        )
      })
    )}
    {!deltas.length && UNAVAILABLE_NOTATION}
  </InlineTableCell>
)
