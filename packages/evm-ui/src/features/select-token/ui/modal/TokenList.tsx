import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { TokenSection, type TokenSectionProps } from '@evm-ui/features/select-token/ui/modal/TokenSection'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import { notFalsy } from '@primitives/objects.utils'
import { SearchField } from '@ui/components/SearchField'
import { TabsSwitcher } from '@ui/components/Tabs/TabsSwitcher'
import { toValue } from '@ui/features/queries/util'
import { TOKEN_CATEGORY_LABELS, TokenCategory, type TokenOption as Option } from '@ui/features/select-token/types'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useFuzzySearch } from '@ui/hooks/useFuzzySearch'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { ErrorAlert } from './ErrorAlert'
import { FavoriteTokens } from './FavoriteTokens'

const { Spacing } = SizesAndSpaces

export type TokenListProps = Pick<
  TokenSectionProps,
  'tokens' | 'onToken' | 'balances' | 'tokenPrices' | 'disabledTokens' | 'isLoading'
> & {
  /** Callback when user enters text in the search input (debounced) */
  onSearch?: (search: string) => void
  /** List of favorite token options to display at the top */
  favorites?: Option[]
  /** Token volumes in USD mapped by token address */
  volumes?: Record<Address, number>
  /** Custom error message to display (e.g., when tokens failed to load) */
  error?: string
  /** Disable automatic sorting of tokens and apply your own sorting of the tokens property */
  disableSorting?: boolean
  /** Disable the "My Tokens" section that shows tokens with non-zero balances */
  disableMyTokens?: boolean
  /** Disable the search input field */
  disableSearch?: boolean
  /** Custom React nodes to render below favorites section */
  children?: ReactNode
}

export const TokenList = ({
  tokens,
  favorites,
  balances,
  tokenPrices,
  volumes = {},
  error,
  disabledTokens,
  isLoading = false,
  disableSorting = false,
  disableMyTokens = false,
  disableSearch = false,
  children,
  onToken,
  onSearch,
}: TokenListProps) => {
  const [search, setSearch] = useState('')
  const onSearchCallback = useCallback(
    (val: string) => {
      setSearch(val)
      onSearch?.(val)
    },
    [setSearch, onSearch],
  )
  const [showPreviewMy, , closeShowPreviewMy] = useSwitch(true)
  const [showPreviewAll, , closeShowPreviewAll] = useSwitch(true)

  const showFavorites = !!favorites?.length && !search

  const tokensSearched = useFuzzySearch(tokens, search, ['symbol', 'address'])

  const [category, setCategory] = useState<TokenCategory>('all')
  const categories = useMemo(
    () => new Set(notFalsy('all', ...tokensSearched.map(token => token.category))),
    [tokensSearched],
  )
  const categoriesTabs = useMemo(
    () => [...categories].map(category => ({ value: category, label: TOKEN_CATEGORY_LABELS[category] })),
    [categories],
  )

  const tokensCategorized = useMemo(
    () => (category == 'all' ? tokensSearched : tokensSearched.filter(token => token.category === category)),
    [category, tokensSearched],
  )

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

    const balanceTokens = tokensCategorized.filter(token => +(toValue(balances?.[token.address]) ?? 0) > 0)

    if (!disableSorting) {
      // Sort tokens with balance by balance (USD then raw)
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      balanceTokens.sort((a, b) => {
        const aBalance = +(toValue(balances?.[a.address]) ?? 0)
        const bBalance = +(toValue(balances?.[b.address]) ?? 0)
        const aBalanceUsd = (toValue(tokenPrices?.[a.address]) ?? 0) * aBalance
        const bBalanceUsd = (toValue(tokenPrices?.[b.address]) ?? 0) * bBalance
        return bBalanceUsd - aBalanceUsd || bBalance - aBalance
      })
    }

    return balanceTokens
  }, [disableMyTokens, tokensCategorized, disableSorting, balances, tokenPrices])

  /**
   * Filters tokens to show only those with significant value.
   *
   * When showPreviewMy is true, returns tokens whose USD value exceeds 1% of total portfolio value.
   * This filtering helps prevent dust and potential scam tokens from cluttering the interface.
   */
  const previewMy = useMemo(() => {
    if (!showPreviewMy) return []

    const totalUsdBalance = myTokens.reduce((sum, token) => {
      const balance = +(toValue(balances?.[token.address]) ?? 0)
      const price = toValue(tokenPrices?.[token.address]) ?? 0
      return sum + balance * price
    }, 0)

    const threshold = totalUsdBalance * 0.01

    return myTokens.filter((token: Option) => {
      const balance = +(toValue(balances?.[token.address]) ?? 0)
      const price = toValue(tokenPrices?.[token.address]) ?? 0
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
    const allTokensBase = notFalsy(
      disableMyTokens
        ? tokensCategorized
        : tokensCategorized.filter(token => +(toValue(balances?.[token.address]) ?? 0) === 0),

      // Add tokens that have balance but aren't in the preview (dust tokens)
      // When showPreviewMy is false, those dust tokens should be in the myTokens section
      // However, TokenSection falls back to showing all myTokens when the preview is empty,
      // so only a nonempty preview can leave hidden dust to add to the volume section.
      showPreviewMy &&
        previewMy.length > 0 &&
        myTokens.filter(token => !previewMy.some(previewToken => previewToken.address === token.address)),
    ).flat()
    return disableSorting
      ? allTokensBase
      : allTokensBase.toSorted(
          (a, b) => (volumes[b.address] ?? 0) - (volumes[a.address] ?? 0) || a.symbol.localeCompare(b.symbol),
        )
  }, [disableMyTokens, tokensCategorized, showPreviewMy, myTokens, disableSorting, balances, previewMy, volumes])

  /**
   * Filters tokens to show in the preview of "All tokens" section.
   *
   * When showPreviewAll is true, returns the first 300 tokens from the allTokens array.
   * This limit prevents rendering too many tokens at once, improving performance
   * while still showing users a meaningful selection of available tokens.
   */
  const previewAll = useMemo(() => (showPreviewAll ? allTokens.slice(0, 300) : []), [allTokens, showPreviewAll])

  return (
    <Stack sx={{ gap: Spacing.sm, overflowY: 'auto' }}>
      {!disableSearch && <SearchField name="tokenName" onSearch={onSearchCallback} />}
      {showFavorites && <FavoriteTokens tokens={favorites} onToken={onToken} />}
      {showFavorites && children && <Divider />}
      {children}
      {categories.size > 1 && ( // categories always contain at least 'all'.
        <TabsSwitcher
          variant="underlined"
          size="small"
          value={category}
          onChange={setCategory}
          options={categoriesTabs}
        />
      )}
      {error ? (
        <ErrorAlert error={error} />
      ) : myTokens.length + allTokens.length === 0 ? (
        <Alert variant="filled" severity="info">
          <AlertTitle>{t`No tokens found`}</AlertTitle>
        </Alert>
      ) : (
        <>
          <TokenSection
            title={t`My tokens`}
            tokens={myTokens}
            balances={balances}
            tokenPrices={tokenPrices}
            disabledTokens={disabledTokens}
            preview={previewMy}
            showAllLabel={t`Show dust`}
            isLoading={isLoading}
            onShowAll={closeShowPreviewMy}
            onToken={onToken}
          />

          <TokenSection
            title={myTokens.length > 0 ? t`Tokens by 24h volume` : undefined}
            tokens={allTokens}
            balances={balances}
            tokenPrices={tokenPrices}
            disabledTokens={disabledTokens}
            preview={previewAll}
            isLoading={isLoading}
            onShowAll={closeShowPreviewAll}
            onToken={onToken}
          />
        </>
      )}
    </Stack>
  )
}
