import type { RefObject } from 'react'
import { GearIcon } from '@ui/icons/GearIcon'
import { TableButton } from './TableButton'

export type TableVisibilitySettingsButtonProps = {
  anchorRef: RefObject<HTMLButtonElement | null>
  open: boolean
  onOpen: () => void
}

export const TableVisibilitySettingsButton = ({ anchorRef, open, onOpen }: TableVisibilitySettingsButtonProps) => (
  <TableButton ref={anchorRef} onClick={onOpen} icon={GearIcon} testId="btn-visibility-settings" active={open} />
)
