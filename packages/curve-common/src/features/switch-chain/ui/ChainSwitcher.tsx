import MenuItem from '@mui/material/MenuItem'
import { FunctionComponent, SVGProps, useCallback, useMemo } from 'react'
import Typography from '@mui/material/Typography'
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
    return (<Icon width={32} />)
  }, [networkMapping])

  if (options.length <= 1) {
    return null
  }

  return (
      <CompactDropDown<TChainId>
        value={chainId}
        onChange={onChange}
        disabled={disabled}
        renderValue={renderChainIcon}
      >
        {
          options.map(({ chainId: id, icon: Icon, label }) => (
            <MenuItem key={id} value={id} divider>
              <Icon width={28} />
              <Typography sx={{ marginLeft: 4 }} variant="bodySRegular">
                {label}
              </Typography>
            </MenuItem>
          ))
        }
      </CompactDropDown>
  )
}
