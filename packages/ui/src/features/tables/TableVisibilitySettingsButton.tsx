import { GearIcon } from '@ui/icons/GearIcon'
import { TableButton } from './TableButton'

export type TableVisibilitySettingsButtonProps = { isOpen: boolean; open: () => void; testId?: string }

export const TableVisibilitySettingsButton = ({
  isOpen,
  open,
  testId = 'btn-visibility-settings',
}: TableVisibilitySettingsButtonProps) => <TableButton onClick={open} icon={GearIcon} testId={testId} active={isOpen} />
