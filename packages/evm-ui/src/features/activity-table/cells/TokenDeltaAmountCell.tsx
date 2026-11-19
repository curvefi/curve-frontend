import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { IconStack } from '@ui/components/IconStack'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { TokenIcon } from '@ui/components/TokenIcon'
import { TokenInfo } from '@ui/components/TokenInfo'
import type { ActivityRow } from '../types'
import { DEFAULT_BREAKDOWN_CUTOFF, getActivityDeltaKey } from '../utils'

export const TokenDeltaAmountCell = ({
  blockchainId,
  deltas,
  breakdownCutoff = DEFAULT_BREAKDOWN_CUTOFF,
}: Pick<ActivityRow, 'blockchainId' | 'deltas' | 'breakdownCutoff'>) => (
  <InlineTableCell sx={{ alignItems: 'end', height: 'auto' }}>
    {deltas.length >= breakdownCutoff ? (
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
