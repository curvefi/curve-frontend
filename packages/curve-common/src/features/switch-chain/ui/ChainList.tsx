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

enum ChainType {
  test = 'test',
  main = 'main',
}

export function ChainList<TChainId extends number>({
  options,
  onChange,
  showTestnets,
}: {
  onChange: (chainId: TChainId) => void
  options: ChainOption<TChainId>[]
  showTestnets: boolean
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
      {Object.entries(groupedOptions)
        .filter(([key]) => showTestnets || key !== ChainType.test)
        .flatMap(([key, chains]) => (
          <>
            {showTestnets && (
              <CardHeader title={<Typography variant="headingXsBold">{chainTypeNames[key as ChainType]}</Typography>} />
            )}
            {chains.map((chain) => (
              <MenuItem
                key={chain.chainId}
                onClick={() => onChange(chain.chainId)}
                data-testid={`menu-item-chain-${chain.chainId}`}
              >
                <ChainIcon chain={chain} />
                <Typography sx={{ marginLeft: 4 }} variant="headingXsBold">
                  {chain.label}
                </Typography>
              </MenuItem>
            ))}
          </>
        ))}
    </>
  )
}
