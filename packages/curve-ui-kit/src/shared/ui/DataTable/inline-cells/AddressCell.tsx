import type { Property } from 'csstype'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { shortenString } from '@primitives/string.utils'
import { TableSecondaryTextClass } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

interface AddressCellProps {
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
      <Typography variant="bodyXsRegular" className={TableSecondaryTextClass}>
        {label}
      </Typography>
    )}
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent, gap: Spacing.xs }}>
      <Typography variant="tableCellMBold">{shortenString(address)}</Typography>
    </Stack>
  </InlineTableCell>
)
