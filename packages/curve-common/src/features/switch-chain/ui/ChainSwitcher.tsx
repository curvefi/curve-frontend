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
  const networkIcons = useMemo(() => options.reduce((acc, option) => ({ ...acc, [option.chainId]: option.icon }), {} as Record<TChainId, IconType>), [options])

  const renderChainIcon = useCallback((value: TChainId) => {
    const Icon: IconType = networkIcons[value]
    return <Icon width={28} />
  }, [networkIcons])

  return (
      <CompactDropDown<TChainId>
        value={chainId}
        onChange={onChange}
        variant="standard"
        disabled={disabled}
        renderValue={renderChainIcon}
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
