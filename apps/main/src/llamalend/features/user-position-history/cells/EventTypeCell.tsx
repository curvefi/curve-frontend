import type { ReactNode } from 'react'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { CrossCircleIcon } from '@ui/icons/CrossCircleIcon'
import { DownloadIcon } from '@ui/icons/DownloadIcon'
import { ExclamationTriangleIcon } from '@ui/icons/ExclamationTriangleIcon'
import { MinusCircleIcon } from '@ui/icons/MinusCircleIcon'
import { PlusCircleIcon } from '@ui/icons/PlusCircleIcon'
import { RewardsIcon } from '@ui/icons/RewardsIcon'
import { UploadIcon } from '@ui/icons/UploadIcon'
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
}: CellContext<CurveTableFeatures, ParsedUserCollateralEvent, ParsedUserCollateralEvent['type']>) => (
  <InlineTableCell>
    <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
      {icons[type]}
      <Typography variant="tableCellMBold">{type}</Typography>
    </Stack>
  </InlineTableCell>
)
