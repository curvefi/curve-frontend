import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { TabsSwitcher, type TabsSwitcherProps } from '@ui/components/Tabs/TabsSwitcher'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { ReloadIcon } from '@ui/icons/ReloadIcon'
import { TableButton } from './TableButton'
import { TableVisibilitySettingsButton, type TableVisibilitySettingsButtonProps } from './TableVisibilitySettingsButton'

type TitleOrTabs<T extends string> = { title: string; tabs?: never } | { title?: never; tabs: TabsSwitcherProps<T> }

type TableHeaderProps<T extends string> = {
  onReload: () => Promise<unknown>
  isLoading: boolean
  visibilitySettings?: TableVisibilitySettingsButtonProps
  testId?: string
} & TitleOrTabs<T>

export const TableHeader = <T extends string>({
  title,
  tabs,
  onReload,
  isLoading,
  visibilitySettings,
  testId,
}: TableHeaderProps<T>) => (
  <Stack
    direction="row"
    sx={{ justifyContent: 'space-between', alignItems: 'end', backgroundColor: t => t.design.Layer.App.Background }}
  >
    {tabs ? <TabsSwitcher {...tabs} /> : <CardHeader title={title} data-testid={testId} />}
    <Stack direction="row" sx={{ alignItems: 'center' }}>
      {!useIsMobile() && visibilitySettings && <TableVisibilitySettingsButton {...visibilitySettings} />}
      <TableButton onClick={() => void onReload()} icon={ReloadIcon} rotateIcon={isLoading} />
    </Stack>
  </Stack>
)
