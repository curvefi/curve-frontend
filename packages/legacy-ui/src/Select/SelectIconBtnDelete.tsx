import { StyledBtn } from '@legacy-ui/Select/styles'
import { Cross2Icon } from '@ui/icons/Cross2Icon'

export type SelectIconBtnDeleteProps = { loading?: boolean; onSelectionDelete?: () => void }

export const SelectIconBtnDelete = ({ loading, onSelectionDelete }: SelectIconBtnDeleteProps) => (
  <StyledBtn $loading={loading} onClick={onSelectionDelete} aria-label="delete">
    <Cross2Icon sx={{ fontSize: 16 }} />
  </StyledBtn>
)

SelectIconBtnDelete.displayName = 'SelectIconBtnDelete'
