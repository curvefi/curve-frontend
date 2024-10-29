import { InputLabel } from '@/common/shared/ui/InputLabel'
import { Select } from '@/common/shared/ui/Select'
import { FormControl } from '@/common/shared/ui/FormControl'
import { MenuItem } from '@/common/shared/ui/MenuItem'
import { useCallback } from 'react'
import { SelectChangeEvent } from '@mui/material/Select/SelectInput'

export type LanguageOption = {
  code: string
  name: string
}

export type LanguageSwitcherProps = {
  languageCode: string
  languageOptions: LanguageOption[]
  onChange: (languageCode: string) => void
}

export const LanguageSwitcher = ({ languageOptions, languageCode, onChange }: LanguageSwitcherProps) =>
  (
    <FormControl fullWidth>
      <InputLabel id="language-switcher-label">Language</InputLabel>
      <Select
        labelId="language-switcher-label"
        id="language-switcher"
        value={languageCode}
        label="Language"
        onChange={useCallback((v: SelectChangeEvent) => onChange(v.target.value), [onChange])}
        variant="standard"
      >
        {
          languageOptions.map((languageOption) => (
            <MenuItem key={languageOption.code} value={languageOption.code}>
              {languageOption.name}
            </MenuItem>
          ))
        }
      </Select>
    </FormControl>
  )
