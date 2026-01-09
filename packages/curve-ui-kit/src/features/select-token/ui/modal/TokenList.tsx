import lodash from 'lodash'
import { type ReactNode, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { TokenSection } from '@ui-kit/features/select-token/ui/modal/TokenSection'
import { t } from '@ui-kit/lib/i18n'
import { SearchField } from '@ui-kit/shared/ui/SearchField'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { searchByText } from '@ui-kit/utils/searchText'
import type { TokenOption as Option } from '../../types'
import { ErrorAlert } from './ErrorAlert'
import { FavoriteTokens } from './FavoriteTokens'

const { Spacing } = SizesAndSpaces

export type TokenSectionProps<T extends Option> = Required<
  Pick<TokenListProps<T>, 'tokens' | 'balances' | 'tokenPrices' | 'disabledTokens'>
> &
  Required<Pick<TokenListCallbacks<T>, 'onToken'>> & {
    title?: string
    /** The label to show on the button that expands the section to show all */
    showAllLabel?: string
    /** List of tokens visible before "Show more" is clicked */
    preview: T[]
    onShowAll: () => void
  }

// Prevent all the token options from re-rendering if only the balance of a single one has changed.
export type TokenListCallbacks<T extends Option> = {
  /** Callback when a token is selected */
  onToken: (token: T) => void
  /** Callback when user enters text in the search input (debounced) */
  onSearch: (search: string) => void
}

export type TokenListProps<T extends Option> = {
  /** List of token options to display */
  tokens: T[]
  /** List of favorite token options to display at the top */
  favorites: T[]
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
  /** Disable the "My Tokens" section that shows tokens with non-zero balances */
  disableMyTokens: boolean
  /** Custom React nodes to render below favorites section */
  customOptions: ReactNode
}

export type Props<T extends Option> = TokenListProps<T> & TokenListCallbacks<T>

export const TokenList = <T extends Option>({
  tokens,
  favorites,
  balances,
  tokenPrices,
  showSearch,
  error,
  disabledTokens,
  disableSorting,
  disableMyTokens,
  customOptions,
  onToken,
  onSearch,
}: Props<T>) => {
  const [search, setSearch] = useState('')
  const [showPreviewMy, setShowPreviewMy] = useState(true)
  const [showPreviewAll, setShowPreviewAll] = useState(true)

  const showFavorites = favorites.length > 0 && !search

  const tokensSearched = useMemo(() => {
    if (!search) return tokens

    const { addressesResult, tokensResult } = searchByText(search, tokens, ['symbol'], {
      tokens: ['address'],
      other: [],
    })

    return lodash.uniqBy([...tokensResult, ...addressesResult], (x) => x.item.address).map((x) => x.item)
  }, [tokens, search])

  /**
   * Filters and sorts tokens that the user owns (has a balance > 0).
   *
   * When disableSorting is false, tokens are sorted by:
   * 1. USD value of balance (highest first)
   * 2. Raw token balance (highest first) as a tiebreaker
   *
   * This prioritizes showing the most valuable tokens at the top of the list.
   */
  const myTokens = useMemo(() => {
    if (disableMyTokens) return []

    const balanceTokens = tokensSearched.filter((token) => +(balances[token.address] ?? 0) > 0)

    if (!disableSorting) {
      // Sort tokens with balance by balance (USD then raw)
      balanceTokens.sort((a, b) => {
        const aBalance = +(balances[a.address] ?? 0)
        const bBalance = +(balances[b.address] ?? 0)
        const aBalanceUsd = (tokenPrices[a.address] ?? 0) * aBalance
        const bBalanceUsd = (tokenPrices[b.address] ?? 0) * bBalance

        return bBalanceUsd - aBalanceUsd || bBalance - aBalance
      })
    }

    return balanceTokens
  }, [disableMyTokens, tokensSearched, disableSorting, balances, tokenPrices])

  /**
   * Filters tokens to show only those with significant value.
   *
   * When showPreviewMy is true, returns tokens whose USD value exceeds 1% of total portfolio value.
   * This filtering helps prevent dust and potential scam tokens from cluttering the interface.
   */
  const previewMy = useMemo(() => {
    if (!showPreviewMy) return []

    const totalUsdBalance = myTokens.reduce((sum, token) => {
      const balance = +(balances[token.address] ?? 0)
      const price = tokenPrices[token.address] ?? 0
      return sum + balance * price
    }, 0)

    const threshold = totalUsdBalance * 0.01

    return myTokens.filter((token: Option) => {
      const balance = +(balances[token.address] ?? 0)
      const price = tokenPrices[token.address] ?? 0

      // We used to include tokens with a balance > 0, but no $ price (0),
      // but it turns out that way quite a few scam tokens show up in the preview.
      return balance * price > threshold
    })
  }, [myTokens, balances, tokenPrices, showPreviewMy])

  /**
   * Builds the "All tokens" list from:
   * - All tokens when disableMyTokens is true
   * - Zero-balance tokens when disableMyTokens is false
   * - "Dust tokens" (low-value tokens below 1% portfolio threshold) when hidden from 'my tokens'
   *
   * This keeps the UI clean while ensuring all tokens remain accessible.
   */
  const allTokens = useMemo(() => {
    const allTokensBase = disableMyTokens
      ? tokensSearched
      : tokensSearched.filter((token) => +(balances[token.address] ?? 0) === 0)

    // Add tokens that have balance but aren't in the preview (dust tokens)
    // Only add dust tokens if we're still showing the preview (showPreviewMy is true)
    // When showPreviewMy is false, those dust tokens should be in the myTokens section
    const dustTokens = showPreviewMy
      ? myTokens.filter((token) => !previewMy.some((previewToken) => previewToken.address === token.address))
      : []

    allTokensBase.push(...dustTokens)

    if (!disableSorting) {
      // Sort all non-balance tokens by volume then symbol
      allTokensBase.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0) || a.symbol.localeCompare(b.symbol))
    }

    return allTokensBase
  }, [disableMyTokens, tokensSearched, showPreviewMy, myTokens, disableSorting, balances, previewMy])

  /**
   * Filters tokens to show in the preview of "All tokens" section.
   *
   * When showPreviewAll is true, returns the first 300 tokens from the allTokens array.
   * This limit prevents rendering too many tokens at once, improving performance
   * while still showing users a meaningful selection of available tokens.
   */
  const previewAll = useMemo(() => {
    if (!showPreviewAll) return []

    return allTokens.slice(0, 300)
  }, [allTokens, showPreviewAll])

  return (
    <Stack gap={Spacing.sm} sx={{ overflowY: 'auto' }}>
      {showSearch && (
        <SearchField
          name="tokenName"
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
            preview={previewMy}
            showAllLabel={t`Show dust`}
            onShowAll={() => setShowPreviewMy(false)}
            onToken={onToken}
          />

          <TokenSection
            title={myTokens.length > 0 ? t`Tokens by 24h volume` : undefined}
            tokens={allTokens}
            balances={balances}
            tokenPrices={tokenPrices}
            disabledTokens={disabledTokens}
            preview={previewAll}
            onShowAll={() => setShowPreviewAll(false)}
            onToken={onToken}
          />
        </Stack>
      )}
    </Stack>
  )
}
