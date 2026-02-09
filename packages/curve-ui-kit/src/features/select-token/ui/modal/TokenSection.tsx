import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
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
const TOKEN_LIST_OVERSCAN_ROWS = 8
const TOKEN_LIST_VIRTUALIZE_THRESHOLD = 220

type VirtualizationState = {
  scrollTop: number
  viewportHeight: number
  scrollContainerRef: RefObject<HTMLElement | null>
}

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
  /** Shared scroll-root virtualization state */
  virtualization?: VirtualizationState
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
  virtualization,
}: TokenSectionProps<T>) => {
  const listRef = useRef<HTMLUListElement | null>(null)
  const [sectionTopOffset, setSectionTopOffset] = useState(0)
  const hasTokens = tokens.length > 0

  const collapsedPreview = preview?.length ? preview : tokens
  const togglePreview = onTogglePreview ?? onShowAll
  const displayTokens = isExpanded ? tokens : collapsedPreview
  const hasToggle = !!(preview?.length && preview.length < tokens.length && togglePreview)
  const shouldVirtualize =
    !!virtualization && displayTokens.length >= TOKEN_LIST_VIRTUALIZE_THRESHOLD && virtualization.viewportHeight > 0

  useLayoutEffect(() => {
    if (!virtualization) return

    const measureSectionTop = () => {
      const listElement = listRef.current
      const containerElement = virtualization.scrollContainerRef.current
      if (!listElement || !containerElement) return
      const topOffset =
        listElement.getBoundingClientRect().top -
        containerElement.getBoundingClientRect().top +
        containerElement.scrollTop
      setSectionTopOffset(topOffset)
    }

    measureSectionTop()
    if (typeof ResizeObserver === 'undefined') return

    const resizeObserver = new ResizeObserver(measureSectionTop)
    const listElement = listRef.current
    const containerElement = virtualization.scrollContainerRef.current
    if (listElement) resizeObserver.observe(listElement)
    if (containerElement) resizeObserver.observe(containerElement)
    window.addEventListener('resize', measureSectionTop)
    return () => {
      window.removeEventListener('resize', measureSectionTop)
      resizeObserver.disconnect()
    }
  }, [displayTokens.length, hasToggle, title, virtualization])

  const virtualRows = useMemo(() => {
    if (!shouldVirtualize || !virtualization) return null

    const relativeTop = virtualization.scrollTop - sectionTopOffset
    const visibleCount = Math.ceil(virtualization.viewportHeight / TOKEN_ROW_HEIGHT_PX) + TOKEN_LIST_OVERSCAN_ROWS * 2
    const startIndex = Math.max(0, Math.floor(relativeTop / TOKEN_ROW_HEIGHT_PX) - TOKEN_LIST_OVERSCAN_ROWS)
    const endIndex = Math.min(displayTokens.length, startIndex + visibleCount)

    return {
      startIndex,
      endIndex,
      topSpacer: startIndex * TOKEN_ROW_HEIGHT_PX,
      bottomSpacer: (displayTokens.length - endIndex) * TOKEN_ROW_HEIGHT_PX,
    }
  }, [displayTokens.length, sectionTopOffset, shouldVirtualize, virtualization])

  const visibleTokens = virtualRows ? displayTokens.slice(virtualRows.startIndex, virtualRows.endIndex) : displayTokens
  if (!hasTokens) return null

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

      <MenuList variant="menu" sx={{ paddingBlock: 0 }} ref={listRef}>
        {virtualRows && (
          <Box
            component="li"
            role="presentation"
            sx={{ height: `${virtualRows.topSpacer}px`, listStyle: 'none', padding: 0, margin: 0 }}
          />
        )}

        {visibleTokens.map((token) => {
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
        })}

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
    </>
  )
}
