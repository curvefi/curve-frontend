import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import { RCCrvUSDLogoXS, RCScrvUSDLogoXS } from 'ui/src/images'
import { useConnection } from 'wagmi'
import { isLoading } from '@/loan/components/PageCrvUsdStaking/utils'
import { CRVUSD_ADDRESS, SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { type ChainId } from '@/loan/types/loan.types'
import Stack from '@mui/material/Stack'
import Box from '@ui/Box'
import Icon from '@ui/Icon'
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

const DepositModule = () => {
  const { address } = useConnection()
  const { data: userScrvUsdBalance, isLoading: userScrvUsdBalanceLoading } = useScrvUsdUserBalances({
    userAddress: address,
  })
  const inputAmount = useStore((state) => state.scrvusd.inputAmount)
  const preview = useStore((state) => state.scrvusd.preview)
  const setInputAmount = useStore((state) => state.scrvusd.setInputAmount)
  const setMax = useStore((state) => state.scrvusd.setMax)

  const hasWallet = !!address
  const isLoadingPreview = hasWallet && isLoading(preview.fetchStatus)
  const isLoadingBalances = hasWallet && userScrvUsdBalanceLoading
  const inputValue = !hasWallet && inputAmount === '0' ? '' : inputAmount
  const previewValue = hasWallet ? preview.value : ''
  const crvUsdBalance = hasWallet ? (userScrvUsdBalance?.crvUSD ?? '0') : ''
  const scrvUsdBalance = hasWallet ? (userScrvUsdBalance?.scrvUSD ?? '0') : ''
  const shouldUseLargeTokenInput = useLargeTokenInputScrvusd()
  const { llamaApi: curve = null } = useCurve()
  const networkId = curve?.chainId ? networks[curve.chainId as ChainId]?.id : undefined
  const inputBalance = hasWallet || inputAmount !== '0' ? decimal(inputAmount) : undefined
  const previewBalance = hasWallet && !isLoadingPreview ? decimal(preview.value) : undefined
  const walletBalanceCrvUsd = hasWallet ? decimal(crvUsdBalance) : undefined
  const walletBalanceScrvUsd = hasWallet ? decimal(scrvUsdBalance) : undefined

  const onBalance = useCallback((value?: Decimal) => setInputAmount(value ?? '0'), [setInputAmount])

  const validationError =
    hasWallet && userScrvUsdBalance?.crvUSD ? BigNumber(inputAmount).gt(BigNumber(userScrvUsdBalance.crvUSD)) : false

  return shouldUseLargeTokenInput ? (
    <Stack gap={Spacing.sm}>
      <LargeTokenInput
        label={t`From Wallet`}
        name="deposit-from"
        isError={validationError}
        message={validationError ? t`Input amount exceeds your balance, click max to use all your balance` : undefined}
        balance={inputBalance}
        onBalance={onBalance}
        tokenSelector={<TokenLabel blockchainId={networkId} tooltip="crvUSD" address={CRVUSD_ADDRESS} label="crvUSD" />}
        walletBalance={
          hasWallet
            ? {
                loading: isLoadingBalances,
                balance: walletBalanceCrvUsd,
                symbol: 'crvUSD',
              }
            : undefined
        }
        maxBalance={hasWallet ? { balance: walletBalanceCrvUsd, chips: 'max' } : undefined}
      />
      <Stack alignItems="center" sx={{ color: (theme) => theme.palette.text.secondary }}>
        <Icon name="ArrowDown" size={16} />
      </Stack>
      <LargeTokenInput
        label={t`To Vault`}
        name="deposit-to"
        balance={previewBalance}
        disabled
        tokenSelector={
          <TokenLabel blockchainId={networkId} tooltip="scrvUSD" address={SCRVUSD_VAULT_ADDRESS} label="scrvUSD" />
        }
        walletBalance={
          hasWallet
            ? {
                loading: isLoadingBalances,
                balance: walletBalanceScrvUsd,
                symbol: 'scrvUSD',
              }
            : undefined
        }
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
            walletBalance={crvUsdBalance}
            walletBalanceSymbol="crvUSD"
            value={inputValue}
            isLoadingBalances={isLoadingBalances}
            isLoadingInput={false}
            setValue={setInputAmount}
            setMax={() => setMax(address, 'deposit')}
            readOnly={!hasWallet}
          />
        </InputWrapper>
      </Box>
      {validationError && (
        <ErrorText>{t`Input amount exceeds your balance, click max to use all your balance`}</ErrorText>
      )}
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
            walletBalance={scrvUsdBalance}
            walletBalanceSymbol="scrvUSD"
            value={previewValue}
            readOnly
            isLoadingInput={isLoadingPreview}
            isLoadingBalances={isLoadingBalances}
          />
        </InputWrapper>
      </div>
    </Box>
  )
}

export default DepositModule
