import { useCopyToClipboard } from '@evm-ui/hooks/useCopyToClipboard'
import { CLICKABLE_IN_ROW_CLASS } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { shortenAddress } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import { ExternalLink } from '@ui/components/ExternalLink'
import { TokenInfo, type TokenInfoProps } from '@ui/components/TokenInfo'
import { Tooltip } from '@ui/components/Tooltip'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'

export const TokenCell = ({
  source,
  address,
  explorerUrl,
}: {
  source: TokenInfoProps
  /** Used when the source uses a custom icon and therefore doesn't include a token address itself. */
  address?: string
  /** Optional explorer URL for the displayed address. */
  explorerUrl?: string
}) => {
  address = address ?? ('address' in source ? source.address : undefined)
  const copyAddress = useCopyToClipboard({ copyText: address })

  return (
    <InlineTableCell>
      <Tooltip
        title={explorerUrl && <ExternalLink href={explorerUrl} label={t`View on explorer`} />}
        placement="top"
        clickable={!!explorerUrl}
      >
        {/** Needed for tooltip to work for whatever reason */}
        <Box>
          <TokenInfo
            {...source}
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
        </Box>
      </Tooltip>
    </InlineTableCell>
  )
}
