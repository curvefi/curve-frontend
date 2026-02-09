import { useCallback, useMemo, useState } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import MenuList from '@mui/material/MenuList'
import Stack from '@mui/material/Stack'
import type { TokenOption as Option } from '@ui-kit/features/select-token'
import { blacklist } from '@ui-kit/features/select-token/blacklist'
import { TokenOption } from '@ui-kit/features/select-token/ui/modal/TokenOption'
import { t } from '@ui-kit/lib/i18n'
import { Spinner } from '@ui-kit/shared/ui/Spinner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, ButtonSize } = SizesAndSpaces
const TOKEN_ROW_HEIGHT_PX = 56
const TOKEN_LIST_MAX_HEIGHT_PX = 384
const TOKEN_LIST_OVERSCAN_ROWS = 8
const TOKEN_LIST_VIRTUALIZE_THRESHOLD = 120

export type TokenSectionProps<T extends Option = Option> = {
  /** List of token options to display */
  tokens: T[]
  /** Are token balances still being fetched? Is the section 'under construction'? */
  isLoading?: boolean
  /** Token balances mapped by token address */
  balances?: Record<string, string | undefined>
  /** Token prices in USD mapped by token address */
  tokenPrices?: Record<string, number>
  /** List of token addresses that should be disabled/unselectable */
  disabledTokens?: string[]
  /** Callback when a token is selected */
  onToken: (token: T) => void
  /** The title of the section */
  title?: string
  /** The label to show on the button that expands the section to show all */
  showAllLabel?: string
  /** The label to show on the button when section is expanded */
  hideAllLabel?: string
  /** List of tokens visible before "Show more" is clicked */
  preview?: T[]
  /** Is the preview currently expanded */
  isExpanded?: boolean
  /** Callback when preview toggle button is clicked */
  onTogglePreview?: () => void
  /** Callback when "Show more" is clicked */
  onShowAll?: () => void
}

export const TokenSection = <T extends Option = Option>({
  title,
  isLoading,
  showAllLabel,
  hideAllLabel,
  preview,
  isExpanded = false,
  tokens,
  balances,
  tokenPrices,
  disabledTokens,
  onToken,
  onTogglePreview,
  onShowAll,
}: TokenSectionProps<T>) => {
  const collapsedPreview = preview?.length ? preview : tokens
  const togglePreview = onTogglePreview ?? onShowAll
  const displayTokens = isExpanded ? tokens : collapsedPreview
  const hasToggle = !!(preview?.length && preview.length < tokens.length && togglePreview)
  const shouldVirtualize = displayTokens.length >= TOKEN_LIST_VIRTUALIZE_THRESHOLD
  const [scrollTop, setScrollTop] = useState(0)

  const virtualRows = useMemo(() => {
    if (!shouldVirtualize) return null

    const visibleRowCount = Math.ceil(TOKEN_LIST_MAX_HEIGHT_PX / TOKEN_ROW_HEIGHT_PX)
    const startIndex = Math.max(0, Math.floor(scrollTop / TOKEN_ROW_HEIGHT_PX) - TOKEN_LIST_OVERSCAN_ROWS)
    const endIndex = Math.min(displayTokens.length, startIndex + visibleRowCount + TOKEN_LIST_OVERSCAN_ROWS * 2)
    return {
      startIndex,
      endIndex,
      topSpacer: startIndex * TOKEN_ROW_HEIGHT_PX,
      bottomSpacer: (displayTokens.length - endIndex) * TOKEN_ROW_HEIGHT_PX,
    }
  }, [displayTokens.length, scrollTop, shouldVirtualize])

  const visibleTokens = useMemo(
    () => (virtualRows ? displayTokens.slice(virtualRows.startIndex, virtualRows.endIndex) : displayTokens),
    [displayTokens, virtualRows],
  )

  const renderTokenOption = useCallback(
    (token: T) => {
      const blacklistEntry = blacklist.find((x) => x.address.toLowerCase() === token.address.toLowerCase())
      return (
        <TokenOption
          key={token.address}
          {...token}
          balance={balances?.[token.address]}
          tokenPrice={tokenPrices?.[token.address]}
          disabled={disabledTokens?.includes(token.address) || !!blacklistEntry}
          disabledReason={blacklistEntry?.reason}
          onToken={() => onToken(token)}
        />
      )
    },
    [balances, disabledTokens, onToken, tokenPrices],
  )

  if (!tokens.length) return null

  // If there's a list of preview tokens, show that with a 'Show more' button.
  // If not, then just display all tokens from the list.
  return (
    <>
      {title && (
        <Box sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: (t) => t.design.Layer[1].Fill }}>
          <CardHeader
            title={
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                {title}
                {isLoading && (
                  <Box sx={{ marginBlockEnd: Spacing.xs }}>
                    <Spinner size={15} />
                  </Box>
                )}
              </Stack>
            }
            size="small"
          />
          <Divider />
        </Box>
      )}

      <Box
        onScroll={shouldVirtualize ? (event) => setScrollTop(event.currentTarget.scrollTop) : undefined}
        sx={shouldVirtualize ? { maxHeight: `${TOKEN_LIST_MAX_HEIGHT_PX}px`, overflowY: 'auto' } : undefined}
      >
        <MenuList variant="menu" sx={{ paddingBlock: 0 }}>
          {virtualRows && (
            <Box
              component="li"
              role="presentation"
              sx={{ height: `${virtualRows.topSpacer}px`, listStyle: 'none', padding: 0, margin: 0 }}
            />
          )}

          {visibleTokens.map(renderTokenOption)}

          {virtualRows && (
            <Box
              component="li"
              role="presentation"
              sx={{ height: `${virtualRows.bottomSpacer}px`, listStyle: 'none', padding: 0, margin: 0 }}
            />
          )}

          {hasToggle && (
            <Button
              fullWidth
              variant="link"
              color="ghost"
              size="medium"
              endIcon={<ExpandMoreIcon />}
              onClick={togglePreview}
              // Override variant button height to match menu list item height, so !important is required over '&'.
              sx={{ height: `${ButtonSize.md} !important` }}
            >
              {isExpanded ? hideAllLabel || t`Hide` : showAllLabel || t`Show more`}
            </Button>
          )}
        </MenuList>
      </Box>
    </>
  )
}
