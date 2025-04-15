import groupBy from 'lodash/groupBy'
import { Fragment, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import MenuList from '@mui/material/MenuList'
import { t } from '@ui-kit/lib/i18n'
import { MenuItem } from '@ui-kit/shared/ui/MenuItem'
import { MenuSectionHeader } from '@ui-kit/shared/ui/MenuSectionHeader'
import { SearchField } from '@ui-kit/shared/ui/SearchField'
import { ChainOption } from './ChainSwitcher'
import { ChainSwitcherIcon } from './ChainSwitcherIcon'

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
      <SearchField
        sx={{ marginBottom: 2 }}
        placeholder={t`Search Networks`}
        onSearch={setSearchValue}
        name="chainName"
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
                      data-testid={`menu-item-chain-${chain.chainId}`}
                      key={chain.chainId}
                      value={chain.chainId}
                      onSelected={onChange}
                      isSelected={chain.chainId == selectedNetwork?.chainId}
                      icon={<ChainSwitcherIcon chain={chain} size={36} />}
                      label={chain.label}
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
