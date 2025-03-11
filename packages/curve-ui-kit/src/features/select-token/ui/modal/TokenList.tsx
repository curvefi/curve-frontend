import uniqBy from 'lodash/uniqBy'
import { useMemo, useState, type ReactNode } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import MenuList from '@mui/material/MenuList'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { searchByText } from '@ui-kit/utils/searchText'
import type { TokenOption as Option } from '../../types'
import { ErrorAlert } from './ErrorAlert'
import { FavoriteTokens } from './FavoriteTokens'
import { SearchInput } from './SearchInput'
import { TokenOption } from './TokenOption'

const { Spacing, ButtonSize } = SizesAndSpaces

export type Section = 'my' | 'all'

export type TokenSectionProps = Required<
  Pick<TokenListProps, 'tokens' | 'balances' | 'tokenPrices' | 'disabledTokens'>
> &
  Required<Pick<TokenListCallbacks, 'onToken'>> & {
    title?: string
    showAll: boolean
    /**
     * Controls which tokens are visible before "Show more".
     * Can be a number (quantity limit) or a function that filters tokens.
     */
    preview: number | ((token: Option) => boolean)
    onShowAll: () => void
  }

const TokenSection = ({
  title,
  showAll,
  preview,
  tokens,
  balances,
  tokenPrices,
  disabledTokens,
  onToken,
  onShowAll,
}: TokenSectionProps) => {
  if (!tokens.length) return null

  const displayTokens = showAll
    ? tokens
    : typeof preview === 'number'
      ? tokens.slice(0, preview)
      : tokens.filter(preview)

  const hasMore = displayTokens.length < tokens.length

  return (
    <>
      {title && (
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <CardHeader title={title} size="small" />
          <Divider />
        </Box>
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
      // Sort tokens with balance by balance (USD then raw)
      myTokens.sort((a, b) => {
        const aBalance = +(balances[a.address] ?? 0)
        const bBalance = +(balances[b.address] ?? 0)
        const aBalanceUsd = (tokenPrices[a.address] ?? 0) * aBalance
        const bBalanceUsd = (tokenPrices[b.address] ?? 0) * bBalance

        return bBalanceUsd - aBalanceUsd || bBalance - aBalance
      })

      // Sort all non-balance tokens by volume then symbol
      allTokens.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0) || a.symbol.localeCompare(b.symbol))
    }

    return { myTokens, allTokens }
  }, [tokensFiltered, disableSorting, balances, tokenPrices])

  /**
   * Creates a filter function that determines which tokens to show in the preview section
   * of 'My Tokens' based on their USD value relative to the total portfolio.
   *
   * @returns A filter function that returns true for tokens with USD value > 1% of total balance
   */
  const myTokensPreview = useMemo(() => {
    const totalUsdBalance = myTokens.reduce((sum, token) => {
      const balance = +(balances[token.address] ?? 0)
      const price = tokenPrices[token.address] ?? 0
      return sum + balance * price
    }, 0)

    const threshold = totalUsdBalance * 0.01

    return (token: Option) => {
      const balance = +(balances[token.address] ?? 0)
      const price = tokenPrices[token.address] ?? 0

      // Rare, but also show tokens with a balance but no $ price.
      return balance > 0 && (price === 0 || balance * price > threshold)
    }
  }, [myTokens, balances, tokenPrices])

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
            preview={myTokensPreview}
            showAll={sections.my || !!search}
            onShowAll={() => setSections((prev) => ({ ...prev, my: true }))}
            onToken={onToken}
          />

          <TokenSection
            title={myTokens.length > 0 ? t`Tokens by 24h volume` : undefined}
            tokens={allTokens}
            balances={balances}
            tokenPrices={tokenPrices}
            disabledTokens={disabledTokens}
            preview={300}
            showAll={sections.all || !!search}
            onShowAll={() => setSections((prev) => ({ ...prev, all: true }))}
            onToken={onToken}
          />
        </Stack>
      )}
    </Stack>
  )
}
