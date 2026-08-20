import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
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
    <CardHeader title={title} />
    <TableButton onClick={onReload} icon={ReloadIcon} rotateIcon={isLoading} />
  </Stack>
)
