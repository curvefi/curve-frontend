import { Icon } from '@legacy-ui/Icon'
import { StyledBtn } from '@legacy-ui/Select/styles'

export type SelectIconBtnDeleteProps = { loading?: boolean; onSelectionDelete?: () => void }

export const SelectIconBtnDelete = ({ loading, onSelectionDelete }: SelectIconBtnDeleteProps) => (
  <StyledBtn $loading={loading} onClick={onSelectionDelete}>
    <Icon name="Close" size={16} aria-hidden="true" aria-label="delete" />
  </StyledBtn>
)

SelectIconBtnDelete.displayName = 'SelectIconBtnDelete'
