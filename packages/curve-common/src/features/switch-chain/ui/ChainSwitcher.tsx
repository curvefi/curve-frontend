import { MenuItem } from 'curve-ui-kit/src/shared/ui/MenuItem'
import { FunctionComponent, SVGProps, useCallback, useMemo } from 'react'
import { Typography } from 'curve-ui-kit/src/shared/ui/Typography'
import { CompactDropDown } from 'curve-ui-kit/src/shared/ui/CompactDropDown'

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
  const networkMapping = useMemo(() => options.reduce((acc, option) => ({ ...acc, [option.chainId]: option }), {} as Record<TChainId, ChainOption<TChainId>>), [options])

  const renderChainIcon = useCallback((value: TChainId) => {
    const { icon: Icon } = networkMapping[value]
    return (<Icon width={24} />)
  }, [networkMapping])

  return (
      <CompactDropDown<TChainId>
        value={chainId}
        onChange={onChange}
        variant="standard"
        disabled={disabled}
        renderValue={renderChainIcon}
        sx={{marginTop: 2}}
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
      </CompactDropDown>
  )
}
