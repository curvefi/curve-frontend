import Box from '@mui/material/Box'
import { TokenBadge } from '@ui/components/TokenBadge'
import { TokenIcon } from '@ui/components/TokenIcon'
import { TokenIcons, type TokenIconsProps } from '@ui/components/TokenIcons'
import { PROTOCOL_LOGO_TOKENS, type MigrationProtocol } from '../migration.utils'

const PROTOCOL_NAMES = { balancer: 'Balancer', curve: 'Curve' } satisfies Record<MigrationProtocol, string>

/** Pool tokens with the protocol logo where the chain icon usually sits, so source and target LP are told apart. */
export const ProtocolPoolIcons = ({
  blockchainId,
  tokens,
  protocol,
}: Pick<TokenIconsProps, 'blockchainId' | 'tokens'> & { protocol: MigrationProtocol }) => (
  // flexShrink keeps the fixed-size icon group intact inside shrinking rows
  <Box sx={{ position: 'relative', flexShrink: 0 }}>
    <TokenIcons blockchainId={blockchainId} tokens={tokens} showTooltips={false} />
    <TokenBadge tooltipTitle={PROTOCOL_NAMES[protocol]} position="br">
      <TokenIcon blockchainId="ethereum" address={PROTOCOL_LOGO_TOKENS[protocol]} size="xs" />
    </TokenBadge>
  </Box>
)
