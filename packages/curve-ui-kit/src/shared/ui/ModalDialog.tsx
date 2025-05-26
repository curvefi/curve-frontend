import { ReactNode } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import type { SxProps } from '@ui-kit/utils'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'

export type ModalDialogProps = {
  children: ReactNode
  title: string
  open: boolean
  onClose: () => void
  onTransitionExited?: () => void
  titleAction?: ReactNode
  footer?: ReactNode
  compact?: boolean
  sx?: SxProps
}

export const ModalDialog = ({
  children,
  open,
  onClose,
  onTransitionExited,
  title,
  titleAction,
  footer,
  compact,
  sx,
}: ModalDialogProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    onTransitionExited={onTransitionExited}
    disableRestoreFocus
    sx={{
      ...sx,
      ...(compact && {
        '& .MuiPaper-root': {
          height: 'auto',
          minHeight: 'auto',
          ...(sx as Record<string, Record<string, string>>)?.['& .MuiPaper-root'],
        },
      }),
    }}
  >
    <Card
      sx={{
        ...SizesAndSpaces.Height.modal.sm,
        width: SizesAndSpaces.Width.modal.sm,
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',

        [`@media (min-width: ${SizesAndSpaces.Width.modal.md})`]: {
          ...SizesAndSpaces.Height.modal.md,
          width: SizesAndSpaces.Width.modal.md,
        },
      }}
    >
      <CardHeader
        action={
          <IconButton onClick={onClose} size="extraSmall">
            <CloseIcon />
          </IconButton>
        }
        avatar={titleAction}
        title={
          <Typography variant="headingXsBold" color="textSecondary">
            {title}
          </Typography>
        }
      />
      <CardContent sx={{ flexGrow: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </CardContent>
      {footer && <CardActions>{footer}</CardActions>}
    </Card>
  </Dialog>
)
