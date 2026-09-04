import type { ReactNode } from 'react'
import { useCopyToClipboard } from '@evm-ui/hooks/useCopyToClipboard'
import { CLICKABLE_IN_ROW_CLASS } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { shortenAddress } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import { ExternalLink } from '@ui/components/ExternalLink'
import { TokenInfo, type TokenInfoProps } from '@ui/components/TokenInfo'
import { Tooltip } from '@ui/components/Tooltip'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

type TokenCellProps = {
  source: TokenInfoProps
  /** Used when a custom source icon does not include a token address. */
  address?: string
  /** Optional explorer URL for the displayed address. */
  explorerUrl?: string
  /** Optional content rendered after the token information, such as a badge. */
  endAdornment?: ReactNode
}

/** Displays token information with copy-address and optional explorer interactions. */
export const TokenCell = ({ source, address, explorerUrl, endAdornment }: TokenCellProps) => {
  address = address ?? ('address' in source ? source.address : undefined)
  const copyAddress = useCopyToClipboard({ copyText: address })

  return (
    <InlineTableCell>
      <Tooltip
        title={explorerUrl && <ExternalLink href={explorerUrl} label={t`View on explorer`} />}
        placement="top"
        clickable={!!explorerUrl}
      >
        {/** Needed for the tooltip to work with the cell contents. */}
        <Box sx={endAdornment ? { display: 'flex', alignItems: 'center', gap: Spacing.xs } : undefined}>
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
          {endAdornment}
        </Box>
      </Tooltip>
    </InlineTableCell>
  )
}
