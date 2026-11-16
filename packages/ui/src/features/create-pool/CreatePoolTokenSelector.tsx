import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import MenuList from '@mui/material/MenuList'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SearchField } from '@ui/components/SearchField'
import { Select } from '@ui/components/Select'
import { TokenLabel } from '@ui/components/TokenLabel'
import type { TokenOption } from '@ui/features/select-token/types'
import { TokenOption as TokenRow } from '@ui/features/select-token/ui/modal/TokenOption'
import { TokenSelectorModal } from '@ui/features/select-token/ui/modal/TokenSelectorModal'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import type { CreatePoolToken, CreatePoolTokenSearchProps } from './types'

const { Spacing } = SizesAndSpaces

const TokenList = ({
  tokenOptions,
  tokenSearch,
  onTokenSearch,
  excluded,
  onToken,
}: CreatePoolTokenSearchProps & {
  excluded: (CreatePoolToken | undefined)[]
  onToken: (token: TokenOption) => void
}) => {
  const { data: options, error, isLoading } = tokenOptions

  return (
    <Stack sx={{ gap: Spacing.sm, overflow: 'hidden' }}>
      <Typography
        component="label"
        htmlFor="create-pool-token-search"
        variant="bodySRegular"
      >{t`Token symbol or contract address`}</Typography>
      <SearchField
        data-testid="create-pool-token-search"
        autoFocus
        id="create-pool-token-search"
        size="small"
        placeholder={t`Search tokens`}
        value={tokenSearch}
        onSearch={onTokenSearch}
        helperText={t`Paste a token contract address to add an unlisted token.`}
      />
      {error && (
        <Alert severity="info">{t`The token list is unavailable. You can still paste a token contract address.`}</Alert>
      )}
      {isLoading ? (
        <CircularProgress size={SizesAndSpaces.IconSize.md.desktop} />
      ) : (
        !options?.length && (
          <Typography variant="bodySRegular">{t`No tokens found. Paste a token contract address to look it up.`}</Typography>
        )
      )}
      <MenuList sx={{ overflowY: 'auto' }}>
        {options?.map(option => (
          <TokenRow
            key={option.address}
            {...option}
            disabled={excluded.some(token => token?.address === option.address)}
            disabledReason={t`it is already selected`}
            onToken={() => onToken(option)}
          />
        ))}
      </MenuList>
    </Stack>
  )
}

export const CreatePoolTokenSelector = ({
  blockchainId,
  tokenOptions,
  tokenSearch,
  onTokenSearch,
  selectedToken,
  excluded,
  onToken,
  disabled,
}: CreatePoolTokenSearchProps & {
  blockchainId: string
  selectedToken: CreatePoolToken | undefined
  excluded: (CreatePoolToken | undefined)[]
  onToken: (token: TokenOption) => void
  disabled: boolean
}) => {
  const [isOpen, open, close] = useSwitch(false)
  return (
    <>
      <Select
        data-testid="create-pool-token-select"
        fullWidth
        size="small"
        value=""
        open={false}
        displayEmpty
        disabled={disabled}
        onOpen={() => {
          if (disabled) return // MUI can still call onOpen from keyboard events while disabled.
          onTokenSearch('')
          open()
        }}
        renderValue={() =>
          selectedToken ? (
            <TokenLabel
              blockchainId={blockchainId}
              address={selectedToken.address}
              label={selectedToken.symbol}
              size="mui-md"
              noWrap
            />
          ) : (
            t`Select token`
          )
        }
      />
      <TokenSelectorModal isOpen={isOpen} onClose={close} compact>
        <TokenList
          tokenOptions={tokenOptions}
          tokenSearch={tokenSearch}
          onTokenSearch={onTokenSearch}
          excluded={excluded}
          onToken={token => {
            onToken(token)
            close()
          }}
        />
      </TokenSelectorModal>
    </>
  )
}
