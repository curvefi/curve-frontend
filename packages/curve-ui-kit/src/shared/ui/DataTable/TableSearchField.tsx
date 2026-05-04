import { notFalsy } from '@primitives/objects.utils'
import { SearchField } from '@ui-kit/shared/ui/SearchField'

type Props = {
  value: string
  placeholder?: string
  onChange: (value: string) => void
  testId?: string
  disableAutoFocus?: boolean
}

export const TableSearchField = ({ value, onChange, testId, disableAutoFocus }: Props) => (
  <SearchField
    placeholder="Search"
    value={value}
    onSearch={onChange}
    data-testid={notFalsy('table-text-search', testId).join('-')}
    size="small"
    disableAutoFocus={disableAutoFocus}
  />
)
