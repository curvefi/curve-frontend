import { InputLabel } from '@/common/shared/ui/InputLabel'
import { Select } from '@/common/shared/ui/Select'
import { FormControl } from '@/common/shared/ui/FormControl'
import { MenuItem } from '@/common/shared/ui/MenuItem'
import { useCallback } from 'react'
import { SelectChangeEvent } from '@mui/material/Select/SelectInput'

export type ChainOption<TChainId> = {
  id: TChainId
  name: string
  icon: string
}

export type ChainSwitcherProps<TChainId> = {
  chainId: TChainId;
  chainOptions: ChainOption<TChainId>[]
  onChange: (chainId: TChainId) => void
}

export const ChainSwitcher = <TChainId extends number>({ chainOptions, chainId, onChange }: ChainSwitcherProps<TChainId>) =>
  (
    <FormControl fullWidth>
      <InputLabel id="chain-switcher-label">Chain</InputLabel>
      <Select<TChainId>
        labelId="chain-switcher-label"
        id="chain-switcher"
        value={chainId}
        label="Chain"
        onChange={useCallback((v: SelectChangeEvent<TChainId>) => onChange(v.target.value as TChainId), [onChange])}
        variant="standard"
      >
        {
          chainOptions.map((chainOption) => (
            <MenuItem key={chainOption.id} value={chainOption.id}>
              {chainOption.icon}
              {chainOption.name}
            </MenuItem>
          ))
        }
      </Select>
    </FormControl>
  )
