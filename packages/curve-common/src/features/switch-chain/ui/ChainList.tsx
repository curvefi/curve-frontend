import TextField from '@mui/material/TextField'
import { t } from '@lingui/macro'
import SearchIcon from '@mui/icons-material/Search'
import MenuItem from '@mui/material/MenuItem'
import { ChainIcon } from './ChainIcon'
import Typography from '@mui/material/Typography'
import { ChainOption } from './ChainSwitcher'
import { useMemo, useState } from 'react'
import groupBy from 'lodash/groupBy'
import CardHeader from '@mui/material/CardHeader'
import List from '@mui/material/List'
import Box from '@mui/material/Box'
import { CheckedIcon } from 'curve-ui-kit/src/shared/icons/CheckedIcon'

enum ChainType {
  test = 'test',
  main = 'main',
}

export function ChainList<TChainId extends number>({
  options,
  onChange,
  showTestnets,
  selectedNetwork,
}: {
  onChange: (chainId: TChainId) => void
  options: ChainOption<TChainId>[]
  showTestnets: boolean
  selectedNetwork: ChainOption<TChainId>
}) {
  const [searchValue, setSearchValue] = useState('')
  const groupedOptions = useMemo(
    () =>
      groupBy(
        options.filter((o) => o.label.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())),
        (o: ChainOption<TChainId>) => (o.isTestnet ? ChainType.test : ChainType.main),
      ),
    [options, searchValue],
  )

  const chainTypeNames = {
    [ChainType.test]: t`Test networks`,
    [ChainType.main]: t`Main networks`,
  }

  const entries = Object.entries(groupedOptions)
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
      <Box sx={{ overflowY: 'auto', flexGrow: '1' }}>
        {entries.length ? entries
          .filter(([key]) => showTestnets || key !== ChainType.test)
          .flatMap(([key, chains]) => (
            <>
              {showTestnets && (
                <CardHeader
                  title={<Typography variant="headingXsBold">{chainTypeNames[key as ChainType]}</Typography>}
                  sx={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: (t) => t.design.Layer[3].Fill,
                    zIndex: 1,
                  }}
                />
              )}
              <List>
                {chains.map((chain) => (
                  <MenuItem
                    key={chain.chainId}
                    onClick={() => onChange(chain.chainId)}
                    data-testid={`menu-item-chain-${chain.chainId}`}
                    selected={chain.chainId == selectedNetwork?.chainId}
                  >
                    <ChainIcon chain={chain} size={36} />
                    <Typography sx={{ flexGrow: 1 }} variant="headingXsBold">
                      {chain.label}
                    </Typography>
                    {chain.chainId == selectedNetwork?.chainId && <CheckedIcon />}
                  </MenuItem>
                ))}
              </List>
            </>
          )) : (
            <List>
              <MenuItem disabled>
                <Typography variant="bodyMBold">{t`No networks found`}</Typography>
              </MenuItem>
            </List>
          )}
      </Box>
    </>
  )
}
