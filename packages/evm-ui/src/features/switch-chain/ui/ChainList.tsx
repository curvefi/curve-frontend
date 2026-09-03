import lodash from 'lodash'
import { Fragment, useMemo, useState } from 'react'
import {
  getChainName,
  isChainConfigured,
  isChainLite,
  isChainTestnet,
} from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { usePathname } from '@evm-ui/hooks/router'
import { t } from '@evm-ui/lib/i18n'
import { getCurrentApp, getInternalUrl } from '@evm-ui/shared/routes'
import { MenuItem } from '@evm-ui/shared/ui/MenuItem'
import { MenuSectionHeader } from '@evm-ui/shared/ui/MenuSectionHeader'
import { RouterLink as Link } from '@evm-ui/shared/ui/RouterLink'
import { SearchField } from '@evm-ui/shared/ui/SearchField'
import type { QueryProp } from '@evm-ui/types/util'
import type { NetworkDef } from '@legacy-ui/utils'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import MenuList from '@mui/material/MenuList'
import { recordEntries } from '@primitives/objects.utils'
import { ChainSwitcherIcon } from './ChainSwitcherIcon'

enum ChainType {
  test = 'test',
  main = 'main',
  lite = 'lite',
}

const CHAIN_TYPE_NAMES: Record<ChainType, string> = {
  [ChainType.main]: t`Curve`,
  [ChainType.lite]: t`Curve Lite`,
  [ChainType.test]: t`Testnets`,
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
        options.filter(o => getChainName(o.chainId).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())),
        o =>
          isChainTestnet(o.chainId)
            ? ChainType.test
            : isChainLite(o.chainId) || (tvls && tvls[o.blockchainId] === undefined) // flag chains not supported by prices API as lite
              ? ChainType.lite
              : ChainType.main,
      ) as Record<ChainType, NetworkDef[]>,
    [options, searchValue, tvls],
  )

  const missingWagmiChains = options.filter(({ chainId }) => !isChainTestnet(chainId) && !isChainConfigured(chainId))

  return (
    <>
      {missingWagmiChains.length > 0 && (
        <Alert variant="filled" severity="error" data-testid="missing-wagmi-chain">
          <AlertTitle>{t`Missing wagmi chains`}</AlertTitle>
          {t`Missing wagmi chain configs in chains.ts for: `}
          {missingWagmiChains.map(({ blockchainId: id }) => id).join(', ')}
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
                      data-testid={`menu-item-chain-${network.blockchainId}`}
                      key={network.blockchainId}
                      value={network.blockchainId}
                      component={Link}
                      // navigate to app root to avoid deep-linking to non-existing resources across chains
                      href={getInternalUrl(getCurrentApp(pathname), network.blockchainId)}
                      isSelected={network.blockchainId == selectedNetworkId}
                      icon={<ChainSwitcherIcon blockchainId={network.blockchainId} size={36} />}
                      label={getChainName(network.chainId)}
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
