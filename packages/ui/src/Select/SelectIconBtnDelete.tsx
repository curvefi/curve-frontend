import { Icon } from '@ui/Icon'
import { StyledBtn } from '@ui/Select/styles'

export type SelectIconBtnDeleteProps = { loading?: boolean; onSelectionDelete?: () => void }

export function SelectIconBtnDelete({ loading, onSelectionDelete }: SelectIconBtnDeleteProps) {
  return (
    <StyledBtn $loading={loading} onClick={onSelectionDelete}>
      <Icon name="Close" size={16} aria-hidden="true" aria-label="delete" />
    </StyledBtn>
  )
}

SelectIconBtnDelete.displayName = 'SelectIconBtnDelete'
