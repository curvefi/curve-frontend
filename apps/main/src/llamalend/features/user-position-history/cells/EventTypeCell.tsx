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
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ParsedUserCollateralEvent, UserCollateralEventType } from '../hooks/useUserCollateralEvents'

const { Spacing } = SizesAndSpaces

const icons: Record<UserCollateralEventType, ReactNode> = {
  'Open Position': <RewardsIcon sx={(t) => ({ color: t.design.Text.TextColors.Highlight })} />,
  Borrow: <UploadIcon />,
  'Borrow More': <UploadIcon />,
  'Add Collateral': <PlusCircleIcon />,
  Liquidate: <ExclamationTriangleIcon sx={(t) => ({ color: t.design.Text.TextColors.Feedback.Error })} />,
  'Hard Liquidation': <ExclamationTriangleIcon sx={(t) => ({ color: t.design.Text.TextColors.Feedback.Error })} />,
  Repay: <DownloadIcon />,
  'Repay and Close': <CrossCircleIcon sx={(t) => ({ color: t.design.Text.TextColors.Highlight })} />,
  'Self Liquidation': <CrossCircleIcon sx={(t) => ({ color: t.design.Text.TextColors.Highlight })} />,
  'Remove Collateral': <MinusCircleIcon />,
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
    <Typography variant="tableCellMBold">{type}</Typography>
  </Stack>
)
