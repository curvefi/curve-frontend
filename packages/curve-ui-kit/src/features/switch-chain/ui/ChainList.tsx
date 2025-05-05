import groupBy from 'lodash/groupBy'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useMemo, useRef, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { CheckedIcon } from '@ui-kit/shared/icons/CheckedIcon'
import { AppNames } from '@ui-kit/shared/routes'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
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
 * @param networkId The new network ID
 * @returns The new pathname
 */
export function useNetworkPathname(networkId: string) {
  const pathname = usePathname() ?? ''
  return useMemo(() => {
    const [, appName = AppNames[0], , ...rest] = pathname.split('/')
    return ['', appName, networkId, ...rest].join('/')
  }, [networkId, pathname])
}

const ChainListItem = <TChainId extends number>({
  chain,
  isSelected,
}: {
  chain: ChainOption<TChainId>
  isSelected: boolean
}) => (
  <InvertOnHover hoverEl={useRef<HTMLLIElement | null>(null).current}>
    <MenuItem
      component={Link}
      href={useNetworkPathname(chain.networkId)}
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

export function ChainList<TChainId extends number>({
  options,
  showTestnets,
  selectedNetwork,
}: {
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
                    <ChainListItem
                      key={chain.chainId}
                      chain={chain}
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
