import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { useCopyToClipboard } from '@evm-ui/hooks/useCopyToClipboard'
import { t } from '@evm-ui/lib/i18n'
import { Badge } from '@evm-ui/shared/ui/Badge'
import { CLICKABLE_IN_ROW_CLASS } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { ExternalLink } from '@evm-ui/shared/ui/ExternalLink'
import { TokenInfo } from '@evm-ui/shared/ui/TokenInfo'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { shortenAddress } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import type { BreakdownSource } from './market-rate-breakdown.utils'

const { Spacing } = SizesAndSpaces

export const RateBreakdownSourceCell = ({
  source: { tokenInfo, address, explorerUrl, yieldBearing },
}: {
  source: BreakdownSource
}) => {
  address = address ?? ('address' in tokenInfo ? tokenInfo.address : undefined)
  const copyAddress = useCopyToClipboard({ copyText: address })

  return (
    <InlineTableCell>
      <Tooltip
        title={explorerUrl && <ExternalLink href={explorerUrl} label={t`View on explorer`} />}
        placement="top"
        clickable={!!explorerUrl}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: Spacing.xs }}>
          <TokenInfo
            {...tokenInfo}
            boldPrimary
            secondary={
              !useIsMobile() &&
              address && (
                <Box
                  component="span"
                  className={CLICKABLE_IN_ROW_CLASS}
                  onClick={event => {
                    event.stopPropagation()
                    copyAddress()
                  }}
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  {shortenAddress(address)}
                </Box>
              )
            }
          />
          {yieldBearing && <Badge size="extraSmall" label={t`Yield bearing`} sx={{ alignSelf: 'flex-end' }} />}
        </Box>
      </Tooltip>
    </InlineTableCell>
  )
}
