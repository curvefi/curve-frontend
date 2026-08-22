import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { shortenString } from '@primitives/string.utils'
import { useCopyToClipboard } from '@ui-kit/hooks/useCopyToClipboard'
import { t } from '@ui-kit/lib/i18n'
import { TABLE_SECONDARY_TEXT_CLASS } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type AddressCellProps = {
  /** The address to display */
  address: string
  /** Optional label to display above the address */
  label?: string
  /** Optional explorer URL for the address. */
  explorerUrl?: string
}

/**
 * Cell component for displaying blockchain addresses with truncation.
 */
export const AddressCell = ({ address, label, explorerUrl }: AddressCellProps) => (
  <InlineTableCell>
    {label && (
      <Typography variant="bodyXsRegular" className={TABLE_SECONDARY_TEXT_CLASS}>
        {label}
      </Typography>
    )}
    <Tooltip
      title={explorerUrl && <ExternalLink href={explorerUrl} label={t`View on explorer`} />}
      placement="top"
      clickable={!!explorerUrl}
    >
      <Stack direction="row" sx={{ gap: Spacing.xs }}>
        <Typography
          variant="tableCellMBold"
          onClick={useCopyToClipboard({ copyText: address })}
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          {shortenString(address)}
        </Typography>
      </Stack>
    </Tooltip>
  </InlineTableCell>
)
