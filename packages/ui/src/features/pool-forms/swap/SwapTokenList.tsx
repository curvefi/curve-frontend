import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { PLACEHOLDER } from '@primitives/number.utils'
import { type QueryProp } from '@ui/features/queries/util'
import type { TokenOption } from '@ui/features/select-token/types'
import { TokenOption as TokenMenuOption } from '@ui/features/select-token/ui/modal/TokenOption'
import { t } from '@ui/lib/i18n'

const TokenOptionSkeleton = () => (
  <Skeleton>
    <MenuItem>
      <Typography variant="bodyMBold">{PLACEHOLDER}</Typography>
    </MenuItem>
  </Skeleton>
)

const SwapTokenOption = ({
  token: { data: token, isLoading, error },
  onToken,
  index,
}: {
  token: QueryProp<TokenOption>
  onToken: (index: number) => void
  index: number
}) =>
  token ? (
    <TokenMenuOption key={token.address} {...token} onToken={() => onToken(index)} />
  ) : isLoading ? (
    <TokenOptionSkeleton />
  ) : (
    error && (
      <Alert severity="error">
        <AlertTitle>{t`Cannot load token`}</AlertTitle>
        {error.message}
      </Alert>
    )
  )

export const SwapTokenList = ({
  tokens,
  calculatedIndex,
  onToken,
}: {
  tokens: QueryProp<TokenOption>[] | undefined
  calculatedIndex: number
  onToken: (index: number) => void
}) => (
  <MenuList variant="menu" sx={{ paddingBlock: 0 }}>
    {tokens?.map(
      (token, index) =>
        index !== calculatedIndex && (
          // eslint-disable-next-line @eslint-react/no-array-index-key -- The index is the correct identifier for pools
          <SwapTokenOption key={index} token={token} onToken={onToken} index={index} />
        ),
    ) ?? <TokenOptionSkeleton />}
  </MenuList>
)
