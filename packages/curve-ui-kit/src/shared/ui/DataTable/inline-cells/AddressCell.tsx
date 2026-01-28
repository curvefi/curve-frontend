import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { shortenString } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type AddressCellProps = {
  /** The address to display */
  address: string
  /** Number of characters to show on each side (default: 4) */
  digits?: number
  /** Optional label to display above the address */
  label?: string
  /** Horizontal alignment of the content */
  align?: 'left' | 'right'
}

/**
 * Cell component for displaying blockchain addresses with truncation.
 */
export const AddressCell = ({ address, digits = 4, label, align = 'left' }: AddressCellProps) => (
  <InlineTableCell>
    {label && (
      <Typography variant="bodyXsRegular" sx={(t) => ({ color: t.design.Text.TextColors.Secondary })}>
        {label}
      </Typography>
    )}
    <Stack
      direction="row"
      alignItems="center"
      justifyContent={align === 'right' ? 'flex-end' : 'flex-start'}
      gap={Spacing.xs}
    >
      <Typography variant="tableCellMBold">{shortenString(address, { digits })}</Typography>
    </Stack>
  </InlineTableCell>
)
