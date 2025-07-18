import lodash from 'lodash'
import { Fragment, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import MenuList from '@mui/material/MenuList'
import type { NetworkDef } from '@ui/utils'
import { usePathname } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { AppNames } from '@ui-kit/shared/routes'
import { MenuItem } from '@ui-kit/shared/ui/MenuItem'
import { MenuSectionHeader } from '@ui-kit/shared/ui/MenuSectionHeader'
import { RouterLink as Link } from '@ui-kit/shared/ui/RouterLink'
import { SearchField } from '@ui-kit/shared/ui/SearchField'
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

export function ChainList({
  options,
  showTestnets,
  selectedNetwork,
}: {
  options: NetworkDef[]
  showTestnets: boolean
  selectedNetwork: NetworkDef | undefined
}) {
  const pathname = usePathname() || ''
  const [searchValue, setSearchValue] = useState('')
  const groupedOptions = useMemo(
    () =>
      lodash.groupBy(
        options.filter((o) => o.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())),
        (o) => (o.isTestnet ? ChainType.test : ChainType.main),
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
            .flatMap(([key, networks]) => (
              <Fragment key={key}>
                {showTestnets && <MenuSectionHeader>{chainTypeNames[key as ChainType]}</MenuSectionHeader>}
                <MenuList>
                  {networks.map((network) => (
                    <MenuItem<number, typeof Link>
                      data-testid={`menu-item-chain-${network.chainId}`}
                      key={network.chainId}
                      value={network.chainId}
                      component={Link}
                      href={getNetworkPathname(pathname, network.id)}
                      isSelected={network.chainId == selectedNetwork?.chainId}
                      icon={<ChainSwitcherIcon network={network} size={36} />}
                      label={network.name}
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
