import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { CrossCircleIcon } from '@evm-ui/shared/icons/CrossCircleIcon'
import { DownloadIcon } from '@evm-ui/shared/icons/DownloadIcon'
import { ExclamationTriangleIcon } from '@evm-ui/shared/icons/ExclamationTriangleIcon'
import { MinusCircleIcon } from '@evm-ui/shared/icons/MinusCircleIcon'
import { PlusCircleIcon } from '@evm-ui/shared/icons/PlusCircleIcon'
import { RewardsIcon } from '@evm-ui/shared/icons/RewardsIcon'
import { UploadIcon } from '@evm-ui/shared/icons/UploadIcon'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import type { ParsedUserCollateralEvent, UserCollateralEventType } from '../hooks/useUserCollateralEvents'

const { Spacing } = SizesAndSpaces

const icons: Record<UserCollateralEventType, ReactNode> = {
  'Open Position': <RewardsIcon color="primary" />,
  Borrow: <UploadIcon />,
  'Borrow More': <UploadIcon />,
  'Add Collateral': <PlusCircleIcon />,
  Liquidate: <ExclamationTriangleIcon color="error" />,
  'Hard Liquidation': <ExclamationTriangleIcon color="error" />,
  'Partial Liquidation': <ExclamationTriangleIcon color="error" />,
  Repay: <DownloadIcon />,
  'Repay and Close': <CrossCircleIcon color="primary" />,
  'Self Liquidation': <CrossCircleIcon color="primary" />,
  'Remove Collateral': <MinusCircleIcon />,
}

export const EventTypeCell = ({
  row: {
    original: { type },
  },
}: CellContext<ParsedUserCollateralEvent, unknown>) => (
  <InlineTableCell>
    <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
      {icons[type]}
      <Typography variant="tableCellMBold">{type}</Typography>
    </Stack>
  </InlineTableCell>
)
