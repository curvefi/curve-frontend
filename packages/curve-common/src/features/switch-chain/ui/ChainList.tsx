import TextField from '@mui/material/TextField'
import { t } from '@lingui/macro'
import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import { ChainIcon } from './ChainIcon'
import Typography from '@mui/material/Typography'
import { ChainOption } from './ChainSwitcher'
import { useMemo, useState } from 'react'

export function ChainList<TChainId extends number>({
  options,
  onChange,
  onClick,
  showTestnets,
}: {
  onChange: (chainId: TChainId) => void
  onClick: () => void
  options: ChainOption<TChainId>[]
  showTestnets: boolean
}) {
  const [searchValue, setSearchValue] = useState('')
  const filteredOptions = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(searchValue.toLowerCase()) && (showTestnets || !o.isTestNet)),
    [options, searchValue, showTestnets],
  )

  return (
    <>
      <TextField
        fullWidth
        sx={{ marginBottom: 2 }}
        placeholder={t`Search Networks`}
        onChange={(e) => setSearchValue(e.target.value)}
        slotProps={{ input: { startAdornment: <SearchIcon /> } }}
        variant="outlined"
        value={searchValue}
      />

      <Box onClick={onClick}>
        {filteredOptions.map((chain) => (
          <MenuItem key={chain.chainId} onClick={() => onChange(chain.chainId)} data-testid={`menu-item-chain-${chain.chainId}`}>
            <ChainIcon chain={chain} />
            <Typography sx={{ marginLeft: 4 }} variant="headingXsBold">
              {chain.label}
            </Typography>
          </MenuItem>
        ))}
      </Box>
    </>
  )
}
