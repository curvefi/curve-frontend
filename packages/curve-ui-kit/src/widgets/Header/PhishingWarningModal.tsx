import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { usePhishingWarningDismissed } from '@ui-kit/hooks/useSessionStorage'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'

/**
 * Display a list of wallets to choose from, connecting to the selected one.
 * Use global state retrieved from the useWallet hook to determine if the modal is open.
 */
export const PhishingWarningModal = () => {
  const [dismissed, setDismissed] = usePhishingWarningDismissed()
  const [isOpen, , close] = useSwitch(!dismissed)
  const onClick = () => {
    close()
    setDismissed(true)
  }
  return (
    <ModalDialog
      open={isOpen}
      onClose={close}
      title={t`Warning`}
      titleAction={
        <ExclamationTriangleIcon
          data-testid={'what'}
          sx={{ color: (t) => t.design.Text.TextColors.Feedback.Warning }}
        />
      }
      titleColor="warning"
      footer={<Button sx={{ width: '100%' }} onClick={onClick}>{t`I get it, let me in`}</Button>}
      compact
    >
      <Stack gap={2}>
        <Typography variant="bodyMBold">{t`Make sure you’re on the right domain`}</Typography>
        <Typography>
          {t`Leading DeFi apps are currently being targeted by phishing and clone sites, and Curve is a high-value target. Please double-check that you are on the official domain, either:`}
        </Typography>
        <List sx={{ listStyleType: 'disc', a: { textDecoration: 'none' } }}>
          <ListItem>
            <Link target="_blank" href="https://curve.finance">
              curve.finance
            </Link>
          </ListItem>
          <ListItem>
            <Link target="_blank" href="https://resources.curve.finance">
              resources.curve.finance
            </Link>
          </ListItem>
          <ListItem>
            <Link target="_blank" href="https://gov.curve.finance">
              gov.curve.finance
            </Link>
          </ListItem>
        </List>
        <Typography>
          Never trust links from DMs or unofficial sources. Fake sites may try to steal your funds.
        </Typography>
        <Typography>Stay vigilant. If in doubt, always navigate directly to the official domain.</Typography>
      </Stack>
    </ModalDialog>
  )
}
