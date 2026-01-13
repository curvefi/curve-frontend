import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import { RCCrvUSDLogoXS, RCScrvUSDLogoXS } from 'ui/src/images'
import { useConnection } from 'wagmi'
import { InputDivider } from '@/llamalend/widgets/InputDivider'
import { isLoading } from '@/loan/components/PageCrvUsdStaking/utils'
import { CRVUSD_ADDRESS, SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances'
import { networks } from '@/loan/networks'
import { useStore } from '@/loan/store/useStore'
import { type ChainId } from '@/loan/types/loan.types'
import Stack from '@mui/material/Stack'
import { Box } from '@ui/Box'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useLargeTokenInputScrvusd } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal, type Decimal } from '@ui-kit/utils'
import {
  ErrorText,
  InputLabel,
  InputSelectorText,
  InputWrapper,
  SelectorBox,
  StyledIcon,
  StyledInputComp,
} from './styles'

const { Spacing } = SizesAndSpaces

export const DepositModule = () => {
  const { address } = useConnection()
  const { data: userScrvUsdBalance, isLoading: userScrvUsdBalanceLoading } = useScrvUsdUserBalances({
    userAddress: address,
  })
  const inputAmount = useStore((state) => state.scrvusd.inputAmount)
  const preview = useStore((state) => state.scrvusd.preview)
  const setInputAmount = useStore((state) => state.scrvusd.setInputAmount)
  const setMax = useStore((state) => state.scrvusd.setMax)

  const hasWallet = !!address

  const { llamaApi: curve = null } = useCurve()

  const onBalance = useCallback((value?: Decimal) => setInputAmount(value ?? '0'), [setInputAmount])

  const validationError =
    hasWallet &&
    userScrvUsdBalance?.crvUSD &&
    BigNumber(inputAmount).gt(BigNumber(userScrvUsdBalance.crvUSD)) &&
    t`Input amount exceeds your balance, click max to use all your balance`

  return useLargeTokenInputScrvusd() ? (
    <Stack gap={Spacing.sm} divider={<InputDivider />}>
      <LargeTokenInput
        label={t`From Wallet`}
        name="deposit-from"
        isError={!!validationError}
        message={validationError}
        balance={decimal(inputAmount)}
        onBalance={onBalance}
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
          maxBalance: { balance: decimal(userScrvUsdBalance?.crvUSD), chips: 'max' },
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
  ) : (
    <Box flex flexColumn>
      <Box flex flexColumn>
        <InputLabel>{t`From Wallet`}</InputLabel>
        <InputWrapper>
          <Box flex>
            <SelectorBox>
              <img height={28} src={RCCrvUSDLogoXS} alt="Token Logo" />
              <InputSelectorText>crvUSD</InputSelectorText>
            </SelectorBox>
          </Box>
          <StyledInputComp
            walletBalance={userScrvUsdBalance?.crvUSD ?? ''}
            walletBalanceSymbol="crvUSD"
            value={inputAmount}
            isLoadingBalances={hasWallet && userScrvUsdBalanceLoading}
            isLoadingInput={false}
            setValue={setInputAmount}
            setMax={() => setMax(address, 'deposit')}
            readOnly={!hasWallet}
          />
        </InputWrapper>
      </Box>
      {validationError && <ErrorText>{validationError}</ErrorText>}
      <StyledIcon name="ArrowDown" size={16} />
      <div>
        <InputLabel>{t`To Vault`}</InputLabel>
        <InputWrapper>
          <Box flex>
            <SelectorBox>
              <img height={28} src={RCScrvUSDLogoXS} alt="scrvUSD logo" />
              <InputSelectorText>scrvUSD</InputSelectorText>
            </SelectorBox>
          </Box>
          <StyledInputComp
            walletBalance={userScrvUsdBalance?.scrvUSD ?? ''}
            walletBalanceSymbol="scrvUSD"
            value={preview.value}
            readOnly
            isLoadingInput={hasWallet && isLoading(preview.fetchStatus)}
            isLoadingBalances={hasWallet && userScrvUsdBalanceLoading}
          />
        </InputWrapper>
      </div>
    </Box>
  )
}
