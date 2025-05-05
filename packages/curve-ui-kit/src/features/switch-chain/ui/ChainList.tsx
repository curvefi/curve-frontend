import groupBy from 'lodash/groupBy'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import MenuList from '@mui/material/MenuList'
import { t } from '@ui-kit/lib/i18n'
import { AppNames } from '@ui-kit/shared/routes'
import { MenuItem } from '@ui-kit/shared/ui/MenuItem'
import { MenuSectionHeader } from '@ui-kit/shared/ui/MenuSectionHeader'
import { SearchField } from '@ui-kit/shared/ui/SearchField'
import { ChainOption } from './ChainSwitcher'
import { ChainSwitcherIcon } from './ChainSwitcherIcon'

enum ChainType {
  test = 'test',
  main = 'main',
}

/**
 * Returns a new pathname with a different network
 * @param pathname The current pathname
 * @param networkId The new network ID
 * @returns The new pathname
 */
export function getNetworkPathname(pathname: string, networkId: string) {
  const [, appName = AppNames[0], , ...rest] = pathname.split('/')
  return ['', appName, networkId, ...rest].join('/')
}

export function ChainList<TChainId extends number>({
  options,
  showTestnets,
  selectedNetwork,
}: {
  options: ChainOption<TChainId>[]
  showTestnets: boolean
  selectedNetwork: ChainOption<TChainId>
}) {
  const pathname = usePathname() || ''
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
                    <MenuItem<TChainId, typeof Link>
                      data-testid={`menu-item-chain-${chain.chainId}`}
                      key={chain.chainId}
                      value={chain.chainId}
                      component={Link}
                      href={getNetworkPathname(pathname, chain.networkId)}
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
