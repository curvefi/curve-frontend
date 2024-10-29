import { Select } from '@ui-kit/shared/ui/Select'
import { MenuItem } from '@ui-kit/shared/ui/MenuItem'
import { FunctionComponent, SVGProps, useCallback, useMemo } from 'react'
import { SelectChangeEvent } from '@mui/material/Select/SelectInput'
import { Typography } from 'curve-ui-kit/src/shared/ui/Typography'

export type IconType = FunctionComponent<SVGProps<SVGSVGElement>>

export type ChainOption<TChainId> = {
  chainId: TChainId
  label: string
  icon: IconType
}

export type ChainSwitcherProps<TChainId> = {
  chainId: TChainId;
  options: ChainOption<TChainId>[]
  onChange: (chainId: TChainId) => void
  disabled?: boolean
}

export const ChainSwitcher = <TChainId extends number>({ options, chainId, onChange, disabled }: ChainSwitcherProps<TChainId>) => {
  const networkIcons = useMemo(() => options.reduce((acc, option) => ({ ...acc, [option.chainId]: option.icon }), {} as Record<TChainId, IconType>), [options])

  const renderChainIcon = useCallback((value: TChainId) => {
    const Icon = networkIcons[value]
    return <Icon width={28} />
  }, [networkIcons])

  const onValueChange = useCallback((v: SelectChangeEvent<TChainId>) => onChange(v.target.value as TChainId), [onChange])

  return (
      <Select<TChainId>
        value={[-1, 0].includes(chainId) ? 1 : chainId}
        onChange={onValueChange}
        variant="standard"
        disabled={disabled}
        renderValue={renderChainIcon}
        size="small"
        sx={{padding:0}}
      >
        {
          options.map(({ chainId: id, icon: Icon, label }) => (
            <MenuItem key={id} value={id}>
              <Icon width={28} />
              <Typography sx={{ marginLeft: 4 }}>
                {label}
              </Typography>
            </MenuItem>
          ))
        }
      </Select>
  )
}
