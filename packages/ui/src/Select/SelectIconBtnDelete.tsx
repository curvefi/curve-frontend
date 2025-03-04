import { StyledBtn } from 'ui/src/Select/styles'
import Icon from 'ui/src/Icon'

export type SelectIconBtnDeleteProps = { loading?: boolean; onSelectionDelete?: () => void }

function SelectIconBtnDelete({ loading, onSelectionDelete }: SelectIconBtnDeleteProps) {
  return (
    <StyledBtn $loading={loading} onClick={onSelectionDelete}>
      <Icon name="Close" size={16} aria-hidden="true" aria-label="delete" />
    </StyledBtn>
  )
}

SelectIconBtnDelete.displayName = 'SelectIconBtnDelete'
export default SelectIconBtnDelete
