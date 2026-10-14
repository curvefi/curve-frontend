import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import LinkMui from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { LlamaBox } from '@ui/components/LlamaBox'
import { RouterLink } from '@ui/components/RouterLink'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { MaxWidth, Spacing } = SizesAndSpaces

export const PageBlacklist = ({
  title,
  description,
  navUrl,
  navTitle,
  contactUrl,
  contactTitle,
}: {
  title: string
  description: string[]
  navUrl: string
  navTitle: string
  contactUrl: string
  contactTitle: string
}) => (
  <LlamaBox>
    <Stack sx={{ gap: Spacing.xs, maxWidth: MaxWidth.blacklistContent }}>
      <Alert variant="filled" severity="error">
        <AlertTitle>{title}</AlertTitle>
        <Stack sx={{ gap: Spacing.sm }}>
          {description.map(paragraph => (
            <Typography key={paragraph} component="p" variant="inherit">
              {paragraph}
            </Typography>
          ))}
        </Stack>
      </Alert>
      <Stack direction="row" sx={{ gap: Spacing.xs }}>
        <Button component={RouterLink} href={navUrl} variant="contained" color="secondary" sx={{ flex: 1 }}>
          {navTitle}
        </Button>
        <Button
          component={LinkMui}
          href={contactUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          color="primary"
          sx={{ flex: 1 }}
        >
          {contactTitle}
        </Button>
      </Stack>
    </Stack>
  </LlamaBox>
)
