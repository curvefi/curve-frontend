import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { ReloadIcon } from '@ui/icons/ReloadIcon'
import { TableButton } from './TableButton'
import { TableVisibilitySettingsButton, type TableVisibilitySettingsButtonProps } from './TableVisibilitySettingsButton'

export const TableHeader = ({
  title,
  onReload,
  isLoading,
  visibilitySettings,
  testId,
}: {
  title: string
  onReload: () => Promise<unknown>
  isLoading: boolean
  visibilitySettings?: TableVisibilitySettingsButtonProps
  testId?: string
}) => (
  <Stack
    direction="row"
    sx={{ justifyContent: 'space-between', alignItems: 'end', backgroundColor: t => t.design.Layer.App.Background }}
  >
    <CardHeader title={title} data-testid={testId} />
    <Stack direction="row" sx={{ alignItems: 'center' }}>
      {!useIsMobile() && visibilitySettings && <TableVisibilitySettingsButton {...visibilitySettings} />}
      <TableButton onClick={() => void onReload()} icon={ReloadIcon} rotateIcon={isLoading} />
    </Stack>
  </Stack>
)
