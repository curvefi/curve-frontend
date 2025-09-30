import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { usePhishingWarningDismissed } from '@ui-kit/hooks/useSessionStorage'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const urls = [
  'https://www.curve.finance',
  'https://resources.curve.finance',
  'https://gov.curve.finance',
  'https://docs.curve.finance',
  'https://news.curve.finance',
]

/**
 * Displays a modal warning users about phishing risks and encourages them to verify they are on the official Curve domains.
 * The modal lists official domains, provides security tips, and can be dismissed by the user. Its visibility is managed via session storage.
 */
export const PhishingWarningModal = () => {
  const [dismissed, setDismissed] = usePhishingWarningDismissed()
  const onClick = () => setDismissed(true)
  return (
    <ModalDialog
      open={!dismissed}
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
          {t`Leading DeFi apps are currently being targeted by phishing and clone sites, and Curve is a high-value target. Please double-check that you are on the official domain, one of:`}
        </Typography>
        <List
          sx={{
            li: {
              '&::before': {
                content: '"•"',
                color: (t) => t.design.Text.TextColors.Primary,
                paddingInlineEnd: Spacing.sm,
              },
            },
            a: { textDecoration: 'none' },
          }}
        >
          {urls.map((url) => (
            <ListItem key={url}>
              <Link target="_blank" href={url}>
                {url.replace(/https?:\/\/(www\.)?/, '')}
              </Link>
            </ListItem>
          ))}
        </List>
        <Typography>
          Never trust links from DMs or unofficial sources. Fake sites may try to steal your funds.
        </Typography>
        <Typography>Stay vigilant. If in doubt, always navigate directly to the official domain.</Typography>
      </Stack>
    </ModalDialog>
  )
}
