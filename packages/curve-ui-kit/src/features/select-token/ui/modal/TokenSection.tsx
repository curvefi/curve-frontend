import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import MenuList from '@mui/material/MenuList'
import type { TokenOption as Option } from '@ui-kit/features/select-token'
import { blacklist } from '@ui-kit/features/select-token/blacklist'
import { TokenOption } from '@ui-kit/features/select-token/ui/modal/TokenOption'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { ButtonSize } = SizesAndSpaces

export type TokenSectionProps<T extends Option = Option> = {
  /** List of token options to display */
  tokens: T[]
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
  /** List of tokens visible before "Show more" is clicked */
  preview?: T[]
  /** Callback when "Show more" is clicked */
  onShowAll?: () => void
}

export const TokenSection = <T extends Option = Option>({
  title,
  showAllLabel,
  preview,
  tokens,
  balances,
  tokenPrices,
  disabledTokens,
  onToken,
  onShowAll,
}: TokenSectionProps<T>) => {
  if (!tokens.length) return null

  const displayTokens = preview?.length ? preview : tokens
  const hasMore = !!(preview?.length && preview.length < tokens.length && onShowAll)

  // If there's a list of preview tokens, show that with a 'Show more' button.
  // If not, then just display all tokens from the list.
  return (
    <>
      {title && (
        <Box sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: (t) => t.design.Layer[1].Fill }}>
          <CardHeader title={title} size="small" />
          <Divider />
        </Box>
      )}

      <MenuList variant="menu" sx={{ paddingBlock: 0 }}>
        {displayTokens.map((token) => {
          const blacklistEntry = blacklist.find(
            (x) => x.address.toLocaleLowerCase() === token.address.toLocaleLowerCase(),
          )
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

        {hasMore && (
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
            {showAllLabel || t`Show more`}
          </Button>
        )}
      </MenuList>
    </>
  )
}
