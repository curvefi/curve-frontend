import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { LlamaBox } from '@ui/components/LlamaBox'
import { RouterLink } from '@ui/components/RouterLink'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { MaxWidth, Spacing } = SizesAndSpaces

export const PageBlacklist = ({
  title,
  description,
  navUrl,
  navTitle,
}: {
  title: string
  description: string
  navUrl: string
  navTitle: string
}) => (
  <LlamaBox>
    <Stack sx={{ gap: Spacing.xs, maxWidth: MaxWidth.blacklistContent }}>
      <Alert variant="filled" severity="error">
        <AlertTitle>{title}</AlertTitle>
        {description}
      </Alert>
      <Button component={RouterLink} href={navUrl} variant="contained" color="secondary">
        {navTitle}
      </Button>
    </Stack>
  </LlamaBox>
)
