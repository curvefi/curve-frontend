import Button from '@mui/material/Button'
import { useGoBack } from '@ui-kit/hooks/router'
import { ArrowLeft } from '@ui-kit/shared/icons/ArrowLeft'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

export const BackButton = ({ path, label }: { path: string; label: string }) => (
  <Button
    size="extraSmall"
    variant="text"
    color="outlined"
    component={RouterLink}
    href={path}
    onClick={useGoBack()}
    sx={{ alignSelf: 'start' }}
    startIcon={<ArrowLeft sx={{ width: IconSize.sm, height: IconSize.sm }} />}
  >
    {label}
  </Button>
)
