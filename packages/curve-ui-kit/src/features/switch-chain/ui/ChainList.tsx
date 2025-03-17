import groupBy from 'lodash/groupBy'
import { Fragment, useMemo, useRef, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { CheckedIcon } from '@ui-kit/shared/icons/CheckedIcon'
import { SearchIcon } from '@ui-kit/shared/icons/SearchIcon'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
import { MenuSectionHeader } from '@ui-kit/shared/ui/MenuSectionHeader'
import { ChainOption } from './ChainSwitcher'
import { ChainSwitcherIcon } from './ChainSwitcherIcon'

enum ChainType {
  test = 'test',
  main = 'main',
}

function ChainListItem<TChainId extends number>({
  chain,
  onChange,
  isSelected,
}: {
  chain: ChainOption<TChainId>
  onChange: (chainId: TChainId) => void
  isSelected: boolean
}) {
  const ref = useRef<HTMLLIElement | null>(null)
  return (
    <InvertOnHover hoverRef={ref}>
      <MenuItem
        onClick={() => onChange(chain.chainId)}
        data-testid={`menu-item-chain-${chain.chainId}`}
        selected={isSelected}
        tabIndex={0}
      >
        <ChainSwitcherIcon chain={chain} size={36} />
        <Typography sx={{ flexGrow: 1 }} variant="headingXsBold">
          {chain.label}
        </Typography>
        {isSelected && <CheckedIcon />}
      </MenuItem>
    </InvertOnHover>
  )
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
                    <ChainListItem
                      key={chain.chainId}
                      chain={chain}
                      onChange={onChange}
                      isSelected={chain.chainId == selectedNetwork?.chainId}
                    />
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
