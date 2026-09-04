import { useGoBack } from '@evm-ui/hooks/router'
import Button from '@mui/material/Button'
import { RouterLink } from '@ui/components/RouterLink'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ArrowLeft } from '@ui/icons/ArrowLeft'

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
