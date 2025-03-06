import { useMemo, useState, type ReactNode } from 'react'
import uniqBy from 'lodash/uniqBy'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import MenuList from '@mui/material/MenuList'
import Stack from '@mui/material/Stack'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { t } from '@ui-kit/lib/i18n'
import { searchByText } from '@ui-kit/utils/searchText'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, ButtonSize } = SizesAndSpaces

import type { TokenOption as Option } from '../../types'
import { FavoriteTokens } from './FavoriteTokens'
import { TokenOption } from './TokenOption'
import { SearchInput } from './SearchInput'
import { ErrorAlert } from './ErrorAlert'

export type Section = 'my' | 'all'

export type TokenSectionProps = Required<
  Pick<TokenListProps, 'tokens' | 'balances' | 'tokenPrices' | 'disabledTokens'>
> &
  Required<Pick<TokenListCallbacks, 'onToken'>> & {
    title?: string
    showAll: boolean
    /** Amount of options to show before a 'Show more' buttons appears if count exceeds limit */
    limit: number
    onShowAll: () => void
  }

const TokenSection = ({
  title,
  showAll,
  limit,
  tokens,
  balances,
  tokenPrices,
  disabledTokens,
  onToken,
  onShowAll,
}: TokenSectionProps) => {
  if (!tokens.length) return null

  const hasMore = tokens.length > limit
  const displayTokens = showAll ? tokens : tokens.slice(0, limit)

  return (
    <>
      {title && (
        <>
          <CardHeader title={title} size="small" />
          <Divider />
        </>
      )}

      <MenuList variant="menu" sx={{ paddingBlock: 0 }}>
        {displayTokens.map((token) => (
          <TokenOption
            key={token.address}
            {...token}
            balance={balances[token.address]}
            tokenPrice={tokenPrices[token.address]}
            disabled={disabledTokens.includes(token.address)}
            onToken={() => onToken(token)}
          />
        ))}

        {hasMore && !showAll && (
          <Button
            fullWidth
            variant="link"
            color="ghost"
            size="medium"
            endIcon={<ExpandMoreIcon />}
            onClick={onShowAll}
            // Override variant button height to match menu list item height, so !important is required over '&'.
            sx={{ height: `${ButtonSize.md} !important` }}
          >
            {t`Show more`}
          </Button>
        )}
      </MenuList>
    </>
  )
}

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
  const [sections, setSections] = useState<Record<Section, boolean>>({
    my: false,
    all: false,
  })
  const showFavorites = favorites.length > 0 && !search

  const tokensFiltered = useMemo(() => {
    if (!search) return tokens

    const { addressesResult, tokensResult } = searchByText(search, tokens, ['symbol'], {
      tokens: ['address'],
      other: [],
    })

    return uniqBy([...tokensResult, ...addressesResult], (x) => x.item.address).map((x) => x.item)
  }, [tokens, search])

  const { myTokens, allTokens } = useMemo(() => {
    const myTokens = tokensFiltered.filter((token) => +(balances[token.address] ?? 0) > 0)
    const allTokens = tokensFiltered.filter((token) => +(balances[token.address] ?? 0) === 0)

    if (!disableSorting) {
      const sortFn = (a: Option, b: Option) => {
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
      }

      myTokens.sort(sortFn)
      allTokens.sort(sortFn)
    }

    return { myTokens, allTokens }
  }, [tokensFiltered, disableSorting, balances, tokenPrices])

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

      {showFavorites && <FavoriteTokens tokens={favorites} onToken={onToken} />}
      {showFavorites && customOptions && <Divider />}
      {customOptions}

      {error ? (
        <ErrorAlert error={error} />
      ) : myTokens.length + allTokens.length === 0 ? (
        <Alert variant="filled" severity="info">
          <AlertTitle>{t`No tokens found`}</AlertTitle>
        </Alert>
      ) : (
        <Stack sx={{ overflowY: 'auto' }}>
          <TokenSection
            title={t`My tokens`}
            tokens={myTokens}
            balances={balances}
            tokenPrices={tokenPrices}
            disabledTokens={disabledTokens}
            limit={5}
            showAll={sections.my || !!search}
            onShowAll={() => setSections((prev) => ({ ...prev, my: true }))}
            onToken={onToken}
          />

          <TokenSection
            title={myTokens.length > 0 ? t`All tokens` : undefined}
            tokens={allTokens}
            balances={balances}
            tokenPrices={tokenPrices}
            disabledTokens={disabledTokens}
            limit={10}
            showAll={sections.all || !!search}
            onShowAll={() => setSections((prev) => ({ ...prev, all: true }))}
            onToken={onToken}
          />
        </Stack>
      )}
    </Stack>
  )
}
