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
  /** Content of the modal dialog */
  children: ReactNode

  /** Title of the modal dialog */
  title: string

  /** Color of the title text */
  titleColor?: string

  /** Whether the modal dialog is open */
  open: boolean

  /**
   * Callback function when the modal dialog is closed
   * If this is not provided, the modal cannot be closed by clicking outside or pressing Escape. No close button will be shown.
   **/
  onClose?: () => void

  /**
   * Callback function when the modal dialog has finished its close transition.
   * This is a good moment to stop rendering the modal to improve performance.
   * If the modal stops being rendered as soon as it is closed, the transition cannot be seen.
   **/
  onTransitionExited?: () => void

  /**
   * Optional action element to display before the title.
   * Usually an icon button to perform an action related to the modal, like going back.
   **/
  titleAction?: ReactNode

  /**
   * Optional footer element to display at the bottom of the modal.
   * Usually contains action buttons.
   **/
  footer?: ReactNode

  /** If true, the modal will have a compact height instead of filling most of the screen */
  compact?: boolean

  /** Custom styles for the modal dialog */
  sx?: SxProps
}

export const ModalDialog = ({
  children,
  open,
  onClose,
  onTransitionExited,
  title,
  titleAction,
  titleColor = 'textSecondary',
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
          onClose && (
            <IconButton onClick={onClose} size="extraSmall">
              <CloseIcon />
            </IconButton>
          )
        }
        avatar={titleAction}
        title={
          <Typography variant="headingXsBold" color={titleColor}>
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
