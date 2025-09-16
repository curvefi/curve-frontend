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
import type { ParsedUserLendCollateralEvent, UserLendCollateralEventType } from '../hooks/useUserLendCollateralEvents'

const { Spacing } = SizesAndSpaces

const getIcon = (type: UserLendCollateralEventType) => {
  if (type === 'Open Position') {
    return <AutoAwesomeIcon sx={(t) => ({ color: t.design.Text.TextColors.Highlight })} />
  }
  if (type === 'Borrow' || type === 'Borrow More') {
    return <UploadIcon />
  }
  if (type === 'Add Collateral') {
    return <AddCircleIcon />
  }
  if (type === 'Liquidate' || type === 'Hard Liquidation') {
    return <WarningAmberIcon sx={(t) => ({ color: t.design.Text.TextColors.Feedback.Error })} />
  }
  if (type === 'Repay') {
    return <DownloadIcon />
  }
  if (type === 'Repay and Close' || type === 'Self Liquidation') {
    return <CancelIcon sx={(t) => ({ color: t.design.Text.TextColors.Highlight })} />
  }
  if (type === 'Remove Collateral') {
    return <RemoveCircleIcon />
  }
}

export const EventTypeCell = ({ row }: CellContext<ParsedUserLendCollateralEvent, any>) => (
  <Stack
    flexDirection="row"
    alignItems="center"
    gap={Spacing.xs}
    paddingTop={Spacing.sm}
    paddingBottom={Spacing.sm}
    paddingRight={Spacing.sm}
  >
    {getIcon(row.original.type)}
    <Typography variant="tableCellSBold">{row.original.type}</Typography>
  </Stack>
)
