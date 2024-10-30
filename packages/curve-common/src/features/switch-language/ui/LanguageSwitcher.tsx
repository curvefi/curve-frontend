import { MenuItem } from 'curve-ui-kit/src/shared/ui/MenuItem'
import { Typography } from 'curve-ui-kit/src/shared/ui/Typography'
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

export const LanguageSwitcher = ({ locales, locale, onChange }: LanguageSwitcherProps) => (
  <CompactDropDown<LocaleValue> value={locale} onChange={onChange}>
    {locales.map((languageOption) => (
      <MenuItem key={languageOption.value} value={languageOption.value}>
        <Typography fontWeight="bold">{languageOption.name}</Typography>
      </MenuItem>
    ))}
  </CompactDropDown>
)
