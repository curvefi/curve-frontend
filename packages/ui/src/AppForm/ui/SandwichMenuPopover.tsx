import { Key, RefObject, useRef } from 'react'
import { useOverlayTrigger, useSelect } from 'react-aria'
import { Item, useSelectState } from 'react-stately'
import { styled } from 'styled-components'
import SelectModal from 'ui/src/Select/SelectModal'

type SandwichMenuItem = {
  id: string
  name: string
}

interface SandwichMenuPopoverProps {
  onClose: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
  onItemClick: (key: string) => void
}

const menuItems: SandwichMenuItem[] = [{ id: 'manage-gauge', name: 'Gauge Management' }]

const SandwichMenuPopover = ({ onClose, onItemClick, triggerRef }: SandwichMenuPopoverProps) => {
  const popoverRef = useRef<HTMLDivElement>(null)

  const state = useSelectState<SandwichMenuItem>({
    isOpen: true,
    onSelectionChange: (key: Key | null) => {
      onItemClick(key!.toString())
    },
    items: menuItems,
    children: (item) => <StyledItem key={item.id}>{item.name}</StyledItem>,
  })

  const { menuProps } = useSelect<SandwichMenuItem>(
    {
      'aria-label': 'Pool Management',
      label: 'Pool Management',
      items: menuItems,
      // todo: the type doesn't actually include children, does it even work?
      ...({ children: ({ id, name }: SandwichMenuItem) => <StyledItem key={id}>{name}</StyledItem> } as any),
      onSelectionChange: (key: Key | null) => {
        onItemClick(key!.toString())
        onClose()
      },
    },
    state,
    triggerRef,
  )
  const { overlayProps } = useOverlayTrigger({ type: 'menu' }, state, triggerRef)

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
