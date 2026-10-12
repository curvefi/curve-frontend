import { StyledBtn } from '@legacy-ui/Select/styles'
import { Cross2Icon } from '@ui/icons/Cross2Icon'

export type SelectIconBtnDeleteProps = { loading?: boolean; onSelectionDelete?: () => void }

export const SelectIconBtnDelete = ({ loading, onSelectionDelete }: SelectIconBtnDeleteProps) => (
  <StyledBtn $loading={loading} onClick={onSelectionDelete}>
    <Cross2Icon sx={{ fontSize: 16 }} aria-hidden="true" aria-label="delete" />
  </StyledBtn>
)

SelectIconBtnDelete.displayName = 'SelectIconBtnDelete'
