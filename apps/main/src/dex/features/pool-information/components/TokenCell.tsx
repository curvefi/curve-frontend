import Box from '@mui/material/Box'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useCopyToClipboard } from '@ui-kit/hooks/useCopyToClipboard'
import { t } from '@ui-kit/lib/i18n'
import { ClickableInRowClass } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { TokenInfo, type TokenInfoProps } from '@ui-kit/shared/ui/TokenInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { shortenAddress } from '@ui-kit/utils'

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
  const copyAddress = useCopyToClipboard({
    copyText: address,
    confirmationText: t`Address has been copied to clipboard`,
  })

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
                  className={ClickableInRowClass}
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
