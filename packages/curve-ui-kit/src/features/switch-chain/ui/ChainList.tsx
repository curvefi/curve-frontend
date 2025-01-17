import TextField from '@mui/material/TextField'
import { t } from '@lingui/macro'
import SearchIcon from '@mui/icons-material/Search'
import MenuItem from '@mui/material/MenuItem'
import { ChainSwitcherIcon } from './ChainSwitcherIcon'
import Typography from '@mui/material/Typography'
import { ChainOption } from './ChainSwitcher'
import { Fragment, useMemo, useState } from 'react'
import groupBy from 'lodash/groupBy'
import MenuList from '@mui/material/MenuList'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import { CheckedIcon } from '@ui-kit/shared/icons/CheckedIcon'
import { MenuSectionHeader } from '@ui-kit/shared/ui/MenuSectionHeader'
import AlertTitle from '@mui/material/AlertTitle'

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
        name="chainName"
        autoFocus
      />
      <Box sx={{ overflowY: 'auto', flexGrow: '1' }}>
        {entries.length ? (
          entries
            .filter(([key]) => showTestnets || key !== ChainType.test)
            .flatMap(([key, chains]) => (
              <Fragment key={key}>
                {showTestnets && <MenuSectionHeader>{chainTypeNames[key as ChainType]}</MenuSectionHeader>}
                <MenuList>
                  {chains.map((chain) => (
                    <MenuItem
                      key={chain.chainId}
                      onClick={() => onChange(chain.chainId)}
                      data-testid={`menu-item-chain-${chain.chainId}`}
                      selected={chain.chainId == selectedNetwork?.chainId}
                      tabIndex={0}
                    >
                      <ChainSwitcherIcon chain={chain} size={36} />
                      <Typography sx={{ flexGrow: 1 }} variant="headingXsBold">
                        {chain.label}
                      </Typography>
                      {chain.chainId == selectedNetwork?.chainId && <CheckedIcon />}
                    </MenuItem>
                  ))}
                </MenuList>
              </Fragment>
            ))
        ) : (
          <Alert variant="filled" severity="info" sx={{ marginTop: 3 }}>
            <AlertTitle>{t`No networks found`}</AlertTitle>
          </Alert>
        )}
      </Box>
    </>
  )
}
