import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { CompactDropDown } from 'curve-ui-kit/src/shared/ui/CompactDropDown'

export type LocaleValue = 'en' | 'zh-Hans' | 'zh-Hant' | 'pseudo'
export type LocaleOption = {
  name: string
  value: LocaleValue
  lang: string
}

export type LanguageSwitcherProps = {
  locale: LocaleValue
  locales: LocaleOption[]
  onChange: (value: LocaleValue) => void
}

export const LanguageSwitcher = ({ locales, locale, onChange }: LanguageSwitcherProps) => locales.length > 1 && (
  <CompactDropDown<LocaleValue>
    value={locale} onChange={onChange}
    inputProps={{ sx: { padding: 3 } }}
  >
    {locales.map((languageOption) => (
      <MenuItem key={languageOption.value} value={languageOption.value}>
        <Typography fontWeight="bold">{languageOption.name}</Typography>
      </MenuItem>
    ))}
  </CompactDropDown>
)
