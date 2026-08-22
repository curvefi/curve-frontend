import { t } from '@evm-ui/lib/i18n'
import { SearchField } from '@evm-ui/shared/ui/SearchField'
import { notFalsy } from '@primitives/objects.utils'

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
