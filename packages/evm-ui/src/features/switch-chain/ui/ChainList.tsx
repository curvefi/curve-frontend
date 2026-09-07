import lodash from 'lodash'
import { Fragment, useMemo, useState } from 'react'
import { SearchField } from '@evm-ui/shared/ui/SearchField'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import MenuList from '@mui/material/MenuList'
import { recordEntries } from '@primitives/objects.utils'
import { MenuItem } from '@ui/components/MenuItem'
import { MenuSectionHeader } from '@ui/components/MenuSectionHeader'
import { RouterLink as Link } from '@ui/components/RouterLink'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
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

export type ChainListOption<TId extends string, TChainId extends number> = {
  blockchainId: TId
  chainId: TChainId
  name: string
  isConfigured: boolean
  isTestnet: boolean
  isLite: boolean
  href: string
}

export function ChainList<TId extends string, TChainId extends number>({
  options,
  showTestnets,
  selectedNetworkId,
  onNetwork,
  tvls: { data: tvls, isLoading: tvlsLoading },
}: {
  options: ChainListOption<TId, TChainId>[]
  showTestnets: boolean
  selectedNetworkId: TId | undefined
  onNetwork?: (network: ChainListOption<TId, TChainId>) => void
  tvls: QueryProp<Record<string, number>>
}) {
  const [searchValue, setSearchValue] = useState('')
  const groupedOptions = useMemo(
    () =>
      lodash.groupBy(
        options.filter(o => o.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())),
        o =>
          o.isTestnet
            ? ChainType.test
            : o.isLite || (tvls && tvls[o.blockchainId] === undefined) // flag chains not supported by prices API as lite
              ? ChainType.lite
              : ChainType.main,
      ) as Record<ChainType, ChainListOption<TId, TChainId>[]>,
    [options, searchValue, tvls],
  )

  const unconfiguredChains = options.filter(({ isTestnet, isConfigured }) => !isTestnet && !isConfigured)

  return (
    <>
      {unconfiguredChains.length > 0 && (
        <Alert variant="filled" severity="error" data-testid="missing-chain-config">
          <AlertTitle>{t`Missing chains`}</AlertTitle>
          {t`Missing chain configs in for: `}
          {unconfiguredChains.map(({ blockchainId: id }) => id).join(', ')}
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
                      href={network.href}
                      isSelected={network.blockchainId == selectedNetworkId}
                      icon={<ChainSwitcherIcon blockchainId={network.blockchainId} size={36} />}
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
