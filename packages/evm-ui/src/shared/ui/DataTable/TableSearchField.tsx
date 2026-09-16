import { notFalsy } from '@primitives/objects.utils'
import { SearchField } from '@ui/components/SearchField'
import { t } from '@ui/lib/i18n'

type Props = {
  value: string
  placeholder?: string
  onChange: (value: string) => void
  testId?: string
  disableAutoFocus?: boolean
}

export const TableSearchField = ({ value, onChange, testId, disableAutoFocus, placeholder = t`Search` }: Props) => (
  <SearchField
    placeholder={placeholder}
    value={value}
    onSearch={onChange}
    data-testid={notFalsy('table-text-search', testId).join('-')}
    size="small"
    disableAutoFocus={disableAutoFocus}
  />
)
