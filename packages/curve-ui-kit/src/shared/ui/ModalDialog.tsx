import { ReactNode } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import { SxProps, Theme } from '@mui/material'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'

export type ModalDialogProps = {
  children: ReactNode
  title: string
  open: boolean
  onClose: () => void
  onTransitionExited?: () => void
  titleAction?: ReactNode
  footer?: ReactNode
  sx?: SxProps<Theme>
}

export const ModalDialog = ({
  children,
  open,
  onClose,
  onTransitionExited,
  title,
  titleAction,
  footer,
  sx,
}: ModalDialogProps) => (
  <Dialog open={open} onClose={onClose} onTransitionExited={onTransitionExited} sx={sx} disableRestoreFocus>
    <Card
      sx={{
        ...SizesAndSpaces.ModalHeight.sm,
        width: SizesAndSpaces.ModalWidth.sm,
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',

        [`@media (min-width: ${SizesAndSpaces.ModalWidth.md})`]: {
          ...SizesAndSpaces.ModalHeight.md,
          width: SizesAndSpaces.ModalWidth.md,
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
