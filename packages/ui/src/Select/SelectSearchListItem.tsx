import type { Collection, Node, CollectionBase, SingleSelection } from '@react-types/shared'
import type { SelectState } from 'react-stately'

import React from 'react'
import styled from 'styled-components'

import { focusVisible } from 'ui/src/utils'

import Box from 'ui/src/Box'
import Button from 'ui/src/Button'

function ComboBoxListItem<T>({
  item,
  state,
  onSelectionChange,
}: {
  item: Node<T>
  listBoxRef?: React.RefObject<HTMLUListElement>
  state: SelectState<T>
  onSelectionChange(key: React.Key): void
}) {
  return (
    <li>
      <ItemButton
        variant="outlined"
        className={state.selectedKey === item.key ? 'active' : ''}
        onClick={() => onSelectionChange(item.key)}
      >
        {item.rendered}
      </ItemButton>
    </li>
  )
}

const ItemButton = styled(Button)`
  ${focusVisible};

  &.focus-visible,
  &.active {
    color: var(--box--primary--color);
    background-color: var(--table_detail_row--active--background-color);
  }
  align-items: center;
  border: none;
  display: grid;
  font-family: inherit;
  padding: 0 var(--spacing-3);
  grid-column-gap: var(--spacing-2);
  grid-template-columns: auto 1fr auto;
  height: 34px;
  width: 100%;
`

const IconWrapper = styled.div`
  min-width: 1.875rem; // 30px;
  text-align: left;
`

const LabelText = styled.div`
  overflow: hidden;

  font-size: var(--font-size-4);
  font-weight: var(--font-weight--bold);
  line-height: 1;
  text-overflow: ellipsis;
  text-transform: initial;
`

const LabelTextWrapper = styled(Box)`
  overflow: hidden;
  text-overflow: ellipsis;
`

export default ComboBoxListItem
