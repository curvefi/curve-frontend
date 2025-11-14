import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { ArrowDownIcon } from '@ui-kit/shared/icons/ArrowDownIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const UserPositionsViewAllButton = ({ onClick }: { onClick: () => void }) => (
  <Stack
    sx={{
      paddingBlock: Spacing.xs,
      alignSelf: 'center',
    }}
  >
    <Button color="ghost" size="extraSmall" onClick={onClick} endIcon={<ArrowDownIcon fontSize="small" />}>
      {t`View all positions`}
    </Button>
  </Stack>
)
