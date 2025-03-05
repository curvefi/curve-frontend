import { useMemo, useState, type ReactNode } from 'react'
import uniqBy from 'lodash/uniqBy'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Divider from '@mui/material/Divider'
import MenuList from '@mui/material/MenuList'
import Stack from '@mui/material/Stack'

import { t } from '@ui-kit/lib/i18n'
import { searchByText } from '@ui-kit/utils/searchText'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

import type { TokenOption as Option } from '../../types'
import { FavoriteTokens } from './FavoriteTokens'
import { TokenOption } from './TokenOption'
import { SearchInput } from './SearchInput'
import { ErrorAlert } from './ErrorAlert'

// Prevent all the token options from re-rendering if only the balance of a single one has changed.
export type TokenListCallbacks = {
  /** Callback when a token is selected */
  onToken: (token: Option) => void
  /** Callback when user enters text in the search input (debounced) */
  onSearch: (search: string) => void
}

export type TokenListProps = {
  /** List of token options to display */
  tokens: Option[]
  /** List of favorite token options to display at the top */
  favorites: Option[]
  /** Token balances mapped by token address */
  balances: Record<string, string | undefined>
  /** Token prices in USD mapped by token address */
  tokenPrices: Record<string, number | undefined>
  /** Whether to show the search input field */
  showSearch: boolean
  /** Custom error message to display (e.g., when tokens failed to load) */
  error?: string
  /** List of token addresses that should be disabled/unselectable */
  disabledTokens: string[]
  /** Disable automatic sorting of tokens and apply your own sorting of the tokens property */
  disableSorting: boolean
  /** Custom React nodes to render below favorites section */
  customOptions: ReactNode
}

export type Props = TokenListProps & TokenListCallbacks

export const TokenList = ({
  tokens,
  favorites,
  balances,
  tokenPrices,
  showSearch,
  error,
  disabledTokens,
  disableSorting,
  customOptions,
  onToken,
  onSearch,
}: Props) => {
  const [search, setSearch] = useState('')

  const showFavorites = favorites.length > 0 && !search

  // List of all token options
  const options = useMemo(() => {
    let tokensFiltered = tokens

    // Apply search only if meaningful. searchByText returns nothing is the search is an empty string.
    if (search) {
      const { addressesResult, tokensResult } = searchByText(search, tokens, ['symbol', 'name'], {
        tokens: ['address'],
        other: [],
      })

      tokensFiltered = uniqBy([...tokensResult, ...addressesResult], (x) => x.item.address).map((x) => x.item)
    }

    return disableSorting
      ? tokensFiltered
      : tokensFiltered.sort((a, b) => {
          const aBalance = +(balances[a.address] ?? 0)
          const bBalance = +(balances[b.address] ?? 0)

          // Compare USD balances first (including existence check)
          const aBalanceUsd = (tokenPrices[a.address] ?? 0) * aBalance
          const bBalanceUsd = (tokenPrices[b.address] ?? 0) * bBalance
          if (aBalanceUsd !== bBalanceUsd) return bBalanceUsd - aBalanceUsd

          // If USD balances are equal, compare raw balances
          if (aBalance !== bBalance) return bBalance - aBalance

          // Sort by volume in descending order
          if (a.volume !== b.volume) return (b.volume ?? 0) - (a.volume ?? 0)

          // Finally sort by label
          return a.symbol.localeCompare(b.symbol)
        })
  }, [tokens, search, disableSorting, balances, tokenPrices])

  return (
    <Stack gap={Spacing.sm} sx={{ overflowY: 'auto' }}>
      {showSearch && (
        <SearchInput
          onSearch={(val) => {
            setSearch(val)
            onSearch(val)
          }}
        />
      )}

      {showFavorites && (
        <>
          <FavoriteTokens tokens={favorites} onToken={onToken} />
          <Divider />
        </>
      )}

      {customOptions && (
        <>
          {customOptions}
          <Divider />
        </>
      )}

      {error ? (
        <ErrorAlert error={error} />
      ) : (
        <Stack sx={{ overflowY: 'auto' }}>
          {options.length ? (
            <MenuList autoFocusItem autoFocus variant="menu" sx={{ paddingBlock: 0 }}>
              {options.map((token) => (
                <TokenOption
                  key={token.address}
                  {...token}
                  balance={balances[token.address]}
                  tokenPrice={tokenPrices[token.address]}
                  onToken={() => onToken(token)}
                  disabled={disabledTokens.includes(token.address)}
                />
              ))}
            </MenuList>
          ) : (
            <Alert variant="filled" severity="info">
              <AlertTitle>{t`No tokens found`}</AlertTitle>
            </Alert>
          )}
        </Stack>
      )}
    </Stack>
  )
}
