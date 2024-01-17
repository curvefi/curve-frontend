import * as React from 'react'

import { StyledBtn } from 'ui/src/Select/styles'
import Icon from 'ui/src/Icon'

function SelectIconBtnDelete({ loading, onSelectionDelete }: { loading?: boolean; onSelectionDelete?: () => void }) {
  return (
    <StyledBtn $loading={loading} onClick={onSelectionDelete}>
      <Icon name="Close" size={16} aria-hidden="true" aria-label="delete" />
    </StyledBtn>
  )
}

SelectIconBtnDelete.displayName = 'SelectIconBtnDelete'
export default SelectIconBtnDelete
