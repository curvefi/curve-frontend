import { Select } from '@ui-kit/shared/ui/Select'
import { MenuItem } from '@ui-kit/shared/ui/MenuItem'

import { useCallback } from 'react'
import { SelectChangeEvent } from '@mui/material/Select/SelectInput'
import { Typography } from 'curve-ui-kit/src/shared/ui/Typography'

export type LanguageOption = {
  value: string
  lang: string
  name: string
}

export type LanguageSwitcherProps = {
  languageCode: string
  languageOptions: LanguageOption[]
  onChange: (languageCode: string) => void
}

export const LanguageSwitcher = ({ languageOptions, languageCode, onChange }: LanguageSwitcherProps) => (
  <Select
    labelId="language-switcher-label"
    id="language-switcher"
    value={languageCode}
    onChange={useCallback((v: SelectChangeEvent) => onChange(v.target.value), [onChange])}
    variant="standard"
    size="small"
    sx={{paddingTop: 3}}
  >
    {
      languageOptions.map((languageOption) => (
        <MenuItem key={languageOption.value} value={languageOption.value}>
          <Typography fontWeight="bold">{languageOption.name}</Typography>
        </MenuItem>
      ))
    }
  </Select>
)
