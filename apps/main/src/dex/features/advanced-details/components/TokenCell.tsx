import Box from '@mui/material/Box'
import { useCopyToClipboard } from '@ui-kit/hooks/useCopyToClipboard'
import { t } from '@ui-kit/lib/i18n'
import { ClickableInRowClass } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo, type TokenInfoProps } from '@ui-kit/shared/ui/TokenInfo'
import { shortenAddress } from '@ui-kit/utils'

export const TokenCell = ({
  source,
  address,
}: {
  source: TokenInfoProps
  /** Used when the source uses a custom icon and therefore doesn't include a token address itself. */
  address?: string
}) => {
  address = address ?? ('address' in source ? source.address : undefined)
  const copyAddress = useCopyToClipboard({
    copyText: address ?? '',
    confirmationText: t`Address has been copied to clipboard`,
  })

  return (
    <InlineTableCell>
      <TokenInfo
        {...source}
        secondary={
          address ? (
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
          ) : (
            source.secondary
          )
        }
      />
    </InlineTableCell>
  )
}
