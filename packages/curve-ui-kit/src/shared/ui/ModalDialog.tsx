import { ReactNode } from 'react'
import Dialog from '@mui/material/Dialog'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'

export type ModalDialogProps = {
  children: ReactNode
  title: string
  open: boolean
  onClose: () => void
  titleAction?: ReactNode
  footer?: ReactNode
}

export const ModalDialog = ({ children, open, onClose, title, titleAction, footer }: ModalDialogProps) => (
  <Dialog open={open} onClose={onClose}>
    <Card
      sx={{
        ...SizesAndSpaces.ModalHeight,
        width: SizesAndSpaces.ModalWidth.md,
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        action={
          <IconButton onClick={onClose}>
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
