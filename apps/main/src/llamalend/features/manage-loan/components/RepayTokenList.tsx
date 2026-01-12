import { partition } from 'lodash'
import { useMemo } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Stack from '@mui/material/Stack'
import { TokenSection } from '@ui-kit/features/select-token/ui/modal/TokenSection'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Decimal } from '@ui-kit/utils'
import type { RepayTokenOption } from '../hooks/useRepayTokens'

const { Spacing } = SizesAndSpaces

type RepayTokenListProps = {
  tokens: RepayTokenOption[]
  balances?: Record<string, string | undefined>
  tokenPrices?: Record<string, number>
  positionCollateral: Decimal | undefined
  onToken: (token: RepayTokenOption) => void
}

export const RepayTokenList = ({ tokens, balances, tokenPrices, positionCollateral, onToken }: RepayTokenListProps) => {
  const [[stateCollateralToken], walletTokens] = useMemo(
    () => partition(tokens, (token) => token.field === 'stateCollateral'),
    [tokens],
  )
  return (
    <Stack gap={Spacing.sm} sx={{ overflowY: 'auto' }}>
      {tokens.length ? (
        <>
          <TokenSection
            title={t`In wallet`}
            tokens={walletTokens}
            balances={balances}
            tokenPrices={tokenPrices}
            onToken={onToken}
          />

          <TokenSection
            title={t`Llamalend`}
            tokens={[stateCollateralToken]}
            balances={{ ...(stateCollateralToken && { [stateCollateralToken.address]: positionCollateral }) }}
            tokenPrices={tokenPrices}
            onToken={onToken}
          />
        </>
      ) : (
        <Alert variant="filled" severity="info">
          <AlertTitle>{t`No tokens found`}</AlertTitle>
        </Alert>
      )}
    </Stack>
  )
}
