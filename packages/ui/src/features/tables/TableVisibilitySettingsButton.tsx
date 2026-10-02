import { GearIcon } from '@ui/icons/GearIcon'
import { TableButton } from './TableButton'

export type TableVisibilitySettingsButtonProps = { isOpen: boolean; open: () => void }

export const TableVisibilitySettingsButton = ({ isOpen, open }: TableVisibilitySettingsButtonProps) => (
  <TableButton onClick={open} icon={GearIcon} testId="btn-visibility-settings" active={isOpen} />
)
