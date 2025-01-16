import { t } from '@lingui/macro'
import Image from 'next/image'
import BigNumber from 'bignumber.js'
import useStore from '@/loan/store/useStore'
import { isLoading } from '@/loan/components/PageCrvUsdStaking/utils'
import { RCCrvUSDLogoXS, RCScrvUSDLogoXS } from '@ui/images'
import Box from '@ui/Box'
import {
  ErrorText,
  InputLabel,
  InputSelectorText,
  InputWrapper,
  SelectorBox,
  StyledIcon,
  StyledInputComp,
} from './styles'

const DepositModule = () => {
  const onboardInstance = useStore((state) => state.wallet.onboard)
  const signerAddress = onboardInstance?.state.get().wallets?.[0]?.accounts?.[0]?.address
  const userBalances = useStore((state) => state.scrvusd.userBalances[signerAddress?.toLowerCase() ?? ''])
  const { inputAmount, preview, setInputAmount, setMax } = useStore((state) => state.scrvusd)

  const isLoadingBalances = !userBalances || isLoading(userBalances.fetchStatus)
  const isLoadingPreview = isLoading(preview.fetchStatus)

  const validationError = userBalances?.crvUSD ? BigNumber(inputAmount).gt(BigNumber(userBalances.crvUSD)) : false

  return (
    <Box flex flexColumn>
      <Box flex flexColumn>
        <InputLabel>{t`From Wallet`}</InputLabel>
        <InputWrapper>
          <Box flex>
            <SelectorBox>
              <Image height={28} src={RCCrvUSDLogoXS} alt="Token Logo" />
              <InputSelectorText>crvUSD</InputSelectorText>
            </SelectorBox>
          </Box>
          <StyledInputComp
            walletBalance={userBalances?.crvUSD ?? '0'}
            walletBalanceUSD={userBalances?.crvUSD ?? '0'}
            walletBalanceSymbol="crvUSD"
            value={inputAmount}
            isLoadingBalances={isLoadingBalances}
            isLoadingInput={false}
            setValue={setInputAmount}
            setMax={() => setMax(signerAddress?.toLowerCase() ?? '', 'deposit')}
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
              <Image height={28} src={RCScrvUSDLogoXS} alt="scrvUSD logo" />
              <InputSelectorText>scrvUSD</InputSelectorText>
            </SelectorBox>
          </Box>
          <StyledInputComp
            walletBalance={userBalances?.scrvUSD ?? '0'}
            walletBalanceUSD={userBalances?.scrvUSD ?? '0'}
            walletBalanceSymbol="scrvUSD"
            value={preview.value}
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
