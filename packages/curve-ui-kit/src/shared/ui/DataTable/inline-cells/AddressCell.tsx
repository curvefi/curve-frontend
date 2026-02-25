import type { Property } from 'csstype'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { shortenString } from '@primitives/string.utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type AddressCellProps = {
  /** The address to display */
  address: string
  /** Optional label to display above the address */
  label?: string
  /** Horizontal alignment of the content */
  justifyContent?: Extract<Property.JustifyContent, 'flex-start' | 'flex-end'>
}

/**
 * Cell component for displaying blockchain addresses with truncation.
 */
export const AddressCell = ({ address, label, justifyContent = 'flex-start' }: AddressCellProps) => (
  <InlineTableCell>
    {label && (
      <Typography variant="bodyXsRegular" sx={(t) => ({ color: t.design.Text.TextColors.Secondary })}>
        {label}
      </Typography>
    )}
    <Stack direction="row" alignItems="center" justifyContent={justifyContent} gap={Spacing.xs}>
      <Typography variant="tableCellMBold">{shortenString(address)}</Typography>
    </Stack>
  </InlineTableCell>
)
