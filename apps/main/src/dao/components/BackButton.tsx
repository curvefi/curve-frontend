import { useGoBack } from '@evm-ui/hooks/router'
import { ArrowLeft } from '@evm-ui/shared/icons/ArrowLeft'
import { RouterLink } from '@evm-ui/shared/ui/RouterLink'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Button from '@mui/material/Button'

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
