import lodash from 'lodash'
import { Fragment, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import MenuList from '@mui/material/MenuList'
import { recordEntries } from '@primitives/objects.utils'
import type { NetworkDef } from '@ui/utils'
import { wagmiChainsMap } from '@ui-kit/features/connect-wallet/lib/wagmi/chains'
import { usePathname } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { getCurrentApp, getInternalUrl } from '@ui-kit/shared/routes'
import { MenuItem } from '@ui-kit/shared/ui/MenuItem'
import { MenuSectionHeader } from '@ui-kit/shared/ui/MenuSectionHeader'
import { RouterLink as Link } from '@ui-kit/shared/ui/RouterLink'
import { SearchField } from '@ui-kit/shared/ui/SearchField'
import type { QueryProp } from '@ui-kit/types/util'
import { ChainSwitcherIcon } from './ChainSwitcherIcon'

enum ChainType {
  test = 'test',
  main = 'main',
  lite = 'lite',
  deprecated = 'deprecated',
}

const CHAIN_TYPE_NAMES: Record<ChainType, string> = {
  [ChainType.main]: t`Active networks`,
  [ChainType.test]: t`Test networks`,
  [ChainType.lite]: t`Lite networks`,
  [ChainType.deprecated]: t`Inactive networks`,
}

export function ChainList({
  options,
  showTestnets,
  selectedNetworkId,
  onNetwork,
  tvls: { data: tvls, isLoading: tvlsLoading },
}: {
  options: NetworkDef[]
  showTestnets: boolean
  selectedNetworkId: string | undefined
  onNetwork?: (network: NetworkDef) => void
  tvls: QueryProp<Record<string, number>>
}) {
  const pathname = usePathname()
  const [searchValue, setSearchValue] = useState('')
  const groupedOptions = useMemo(
    () =>
      lodash.groupBy(
        options.filter(o => o.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())),
        o =>
          o.isTestnet
            ? ChainType.test
            : o.isLite || (tvls && tvls[o.id] === undefined)
              ? ChainType.lite
              : ChainType.main,
      ) as Record<ChainType, NetworkDef[]>,
    [options, searchValue, tvls],
  )

  const missingWagmiChains = options.filter(({ isTestnet, chainId }) => !isTestnet && !wagmiChainsMap[chainId])

  return (
    <>
      {missingWagmiChains.length > 0 && (
        <Alert variant="filled" severity="error" data-testid="missing-wagmi-chain">
          <AlertTitle>{t`Missing wagmi chains`}</AlertTitle>
          {t`Missing wagmi chain configs in chains.ts for: `}
          {missingWagmiChains.map(({ id }) => id).join(', ')}
        </Alert>
      )}
      <SearchField
        sx={{ marginBottom: 2 }}
        placeholder={t`Search Networks`}
        onSearch={setSearchValue}
        name="chainName"
      />
      <Box sx={{ overflowY: 'auto', flexGrow: '1' }}>
        {options.length ? (
          recordEntries(CHAIN_TYPE_NAMES)
            .filter(([key]) => (showTestnets || key !== ChainType.test) && groupedOptions[key]?.length)
            .flatMap(([key, title]) => (
              <Fragment key={key}>
                <MenuSectionHeader>{title}</MenuSectionHeader>
                <MenuList>
                  {groupedOptions[key]?.map(network => (
                    <MenuItem<string, typeof Link>
                      data-testid={`menu-item-chain-${network.id}`}
                      key={network.id}
                      value={network.id}
                      component={Link}
                      // navigate to app root to avoid deep-linking to non-existing resources across chains
                      href={getInternalUrl(getCurrentApp(pathname), network.id)}
                      isSelected={network.id == selectedNetworkId}
                      icon={<ChainSwitcherIcon networkId={network.id} size={36} />}
                      label={network.name}
                      onMouseDown={() => onNetwork?.(network)} // onClick somehow doesn't work ???
                      isLoading={tvlsLoading && key != ChainType.lite /* lite doesn't have tvl */}
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
