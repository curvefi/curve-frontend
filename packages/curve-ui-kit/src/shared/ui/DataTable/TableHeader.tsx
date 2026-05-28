import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReloadIcon } from '@ui-kit/shared/icons/ReloadIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TableButton } from './TableButton'

const { Spacing } = SizesAndSpaces

export const TableHeader = ({
  title,
  onReload,
  isLoading,
}: {
  title: string
  onReload: () => void
  isLoading: boolean
}) => (
  <Stack
    direction="row"
    sx={{
      justifyContent: 'space-between',
      alignItems: 'end',
      paddingBlockEnd: Spacing.xs,
      backgroundColor: t => t.design.Layer.App.Background,
    }}
  >
    <Typography variant="headingSBold" color="textSecondary" sx={{ paddingInlineStart: Spacing.sm }}>
      {title}
    </Typography>
    <TableButton onClick={onReload} icon={ReloadIcon} rotateIcon={isLoading} />
  </Stack>
)
