import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { CrossCircleIcon } from '@ui-kit/shared/icons/CrossCircleIcon'
import { DownloadIcon } from '@ui-kit/shared/icons/DownloadIcon'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { MinusCircleIcon } from '@ui-kit/shared/icons/MinusCircleIcon'
import { PlusCircleIcon } from '@ui-kit/shared/icons/PlusCircleIcon'
import { RewardsIcon } from '@ui-kit/shared/icons/RewardsIcon'
import { UploadIcon } from '@ui-kit/shared/icons/UploadIcon'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
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
    <Stack direction="row" alignItems="center" gap={Spacing.sm}>
      {icons[type]}
      <Typography variant="tableCellMBold">{type}</Typography>
    </Stack>
  </InlineTableCell>
)
