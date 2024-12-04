import React, { useRef } from 'react'
import { useOverlayTrigger, useSelect } from 'react-aria'
import { Item, useSelectState } from 'react-stately'
import styled from 'styled-components'
import SelectModal from 'ui/src/Select/SelectModal'

type SandwichMenuItem = {
  id: string
  name: string
}

interface SandwichMenuPopoverProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement>
  onItemClick: (key: string) => void
}

const menuItems: SandwichMenuItem[] = [{ id: 'manage-gauge', name: 'Gauge Management' }]

const SandwichMenuPopover: React.FC<SandwichMenuPopoverProps> = ({ isOpen, onClose, onItemClick, triggerRef }) => {
  const popoverRef = useRef<HTMLDivElement>(null)

  const state = useSelectState<SandwichMenuItem>({
    isOpen,
    onOpenChange: (isOpen) => {
      if (!isOpen) onClose()
    },
    onSelectionChange: (key: React.Key) => {
      onItemClick(key.toString())
    },
    items: menuItems,
    children: (item) => <StyledItem key={item.id}>{item.name}</StyledItem>,
  })

  const { menuProps, labelProps } = useSelect<SandwichMenuItem>(
    {
      'aria-label': 'Pool Management',
      label: 'Pool Management',
      items: menuItems,
      children: (item) => <StyledItem key={item.id}>{item.name}</StyledItem>,
      onSelectionChange: (key: React.Key) => {
        onItemClick(key.toString())
        onClose()
      },
    },
    state,
    triggerRef,
  )
  const { triggerProps, overlayProps } = useOverlayTrigger({ type: 'menu' }, state, triggerRef)

  return (
    <>
      {state.isOpen && (
        <SelectModal
          isOpen={state.isOpen}
          onClose={state.close}
          menuProps={menuProps}
          state={state}
          popoverRef={popoverRef}
          minWidth="10rem"
          mobileRightAlign={true}
          {...overlayProps}
        />
      )}
    </>
  )
}

const StyledItem = styled(Item)`
  padding: var(--spacing-2);
  cursor: pointer;
`

export default SandwichMenuPopover
