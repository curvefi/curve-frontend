import type { RefObject } from 'react'
import { GearIcon } from '@ui/icons/GearIcon'
import { TableButton } from './TableButton'

export type TableVisibilitySettingsButtonProps = {
  anchorRef: RefObject<HTMLButtonElement | null>
  isOpen: boolean
  open: () => void
}

export const TableVisibilitySettingsButton = ({ anchorRef, isOpen, open }: TableVisibilitySettingsButtonProps) => (
  <TableButton ref={anchorRef} onClick={open} icon={GearIcon} testId="btn-visibility-settings" active={isOpen} />
)
