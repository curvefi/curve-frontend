import type { ReactNode } from 'react'
import AddCircleIcon from '@mui/icons-material/AddCircleOutlined'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CancelIcon from '@mui/icons-material/CancelOutlined'
import DownloadIcon from '@mui/icons-material/DownloadOutlined'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircleOutlined'
import UploadIcon from '@mui/icons-material/UploadOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmberOutlined'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ParsedUserCollateralEvent, UserCollateralEventType } from '../hooks/useUserCollateralEvents'

const { Spacing } = SizesAndSpaces

const icons: Record<UserCollateralEventType, ReactNode> = {
  'Open Position': <AutoAwesomeIcon sx={(t) => ({ color: t.design.Text.TextColors.Highlight })} />,
  Borrow: <UploadIcon />,
  'Borrow More': <UploadIcon />,
  'Add Collateral': <AddCircleIcon />,
  Liquidate: <WarningAmberIcon sx={(t) => ({ color: t.design.Text.TextColors.Feedback.Error })} />,
  'Hard Liquidation': <WarningAmberIcon sx={(t) => ({ color: t.design.Text.TextColors.Feedback.Error })} />,
  Repay: <DownloadIcon />,
  'Repay and Close': <CancelIcon sx={(t) => ({ color: t.design.Text.TextColors.Highlight })} />,
  'Self Liquidation': <CancelIcon sx={(t) => ({ color: t.design.Text.TextColors.Highlight })} />,
  'Remove Collateral': <RemoveCircleIcon />,
}

export const EventTypeCell = ({
  row: {
    original: { type },
  },
}: CellContext<ParsedUserCollateralEvent, any>) => (
  <Stack
    flexDirection="row"
    alignItems="center"
    gap={Spacing.xs}
    paddingTop={Spacing.sm}
    paddingBottom={Spacing.sm}
    paddingRight={Spacing.sm}
  >
    {icons[type]}
    <Typography variant="tableCellSBold">{type}</Typography>
  </Stack>
)
