import CloseIcon from '@mui/icons-material/Close'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

export const BetaDialog = ({
  isBeta,
  setIsBeta,
  open,
  openBetaSnackbar,
  onClose,
}: {
  open: boolean
  onClose: () => void
  isBeta: boolean
  setIsBeta: (value: boolean) => void
  openBetaSnackbar: () => void
}) => (
  <Dialog open={open} onClose={onClose}>
    <Card sx={{ width: SizesAndSpaces.ModalWidth.md, maxWidth: '100vw', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        action={
          <IconButton onClick={onClose} size="extraSmall">
            <CloseIcon />
          </IconButton>
        }
        title={
          <Typography variant="headingXsBold" color="textSecondary">
            {isBeta ? t`Enable Beta Features` : t`Disable Beta Features`}
          </Typography>
        }
      />
      <CardContent sx={{ flexGrow: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          t`Get early access to upcoming features and UI experiments before they go live.`,
          t`These are work-in-progress tools meant for testing, feedback, and iteration. You might experience minor bugs or visual inconsistencies — but your funds remain safe, and core functionality is unaffected.`,
          t`By enabling beta mode, you help shape the future of the Curve interface.`,
          t`You can turn this off at any time.`,
        ].map((p) => (
          <Typography color="textSecondary" key={p}>
            {p}
          </Typography>
        ))}
      </CardContent>
      <CardActions>
        <Button
          color={isBeta ? 'secondary' : 'primary'}
          onClick={() => {
            setIsBeta(!isBeta)
            onClose()
            openBetaSnackbar()
          }}
          sx={{ width: '100%' }}
        >
          {isBeta ? t`Disable Beta Features` : t`Enable Beta Features`}
        </Button>
      </CardActions>
    </Card>
  </Dialog>
)
