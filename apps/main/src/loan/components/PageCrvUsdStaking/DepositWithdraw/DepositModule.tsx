import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import { useConnection } from 'wagmi'
import { InputDivider } from '@/llamalend/widgets/InputDivider'
import { CRVUSD_ADDRESS, SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances'
import { networks } from '@/loan/networks'
import { useStore } from '@/loan/store/useStore'
import { type ChainId } from '@/loan/types/loan.types'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export const DepositModule = () => {
  const { address } = useConnection()
  const { data: userScrvUsdBalance, isLoading: userScrvUsdBalanceLoading } = useScrvUsdUserBalances({
    userAddress: address,
  })
  const inputAmount = useStore((state) => state.scrvusd.inputAmount)
  const preview = useStore((state) => state.scrvusd.preview)
  const setInputAmount = useStore((state) => state.scrvusd.setInputAmount)

  const hasWallet = !!address

  const { llamaApi: curve = null } = useCurve()

  const validationError =
    hasWallet &&
    userScrvUsdBalance?.crvUSD &&
    BigNumber(inputAmount).gt(BigNumber(userScrvUsdBalance.crvUSD)) &&
    t`Input amount exceeds your balance, click max to use all your balance`

  return (
    <Stack gap={Spacing.sm} divider={<InputDivider />}>
      <LargeTokenInput
        label={t`From Wallet`}
        name="deposit-from"
        isError={!!validationError}
        message={validationError}
        balance={decimal(inputAmount)}
        onBalance={useCallback((value?: Decimal) => setInputAmount(value ?? '0'), [setInputAmount])}
        tokenSelector={
          <TokenLabel
            blockchainId={networks[curve?.chainId as ChainId]?.id}
            tooltip="crvUSD"
            address={CRVUSD_ADDRESS}
            label="crvUSD"
          />
        }
        {...(hasWallet && {
          walletBalance: {
            loading: userScrvUsdBalanceLoading,
            balance: decimal(userScrvUsdBalance?.crvUSD),
            symbol: 'crvUSD',
          },
        })}
        disabled={!hasWallet}
      />
      <LargeTokenInput
        label={t`To Vault`}
        name="deposit-to"
        balance={decimal(preview.value)}
        disabled
        tokenSelector={
          <TokenLabel
            blockchainId={networks[curve?.chainId as ChainId]?.id}
            tooltip="scrvUSD"
            address={SCRVUSD_VAULT_ADDRESS}
            label="scrvUSD"
          />
        }
        {...(hasWallet && {
          walletBalance: {
            loading: userScrvUsdBalanceLoading,
            balance: decimal(userScrvUsdBalance?.scrvUSD),
            symbol: 'scrvUSD',
          },
        })}
      />
    </Stack>
  )
}
