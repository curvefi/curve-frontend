import { t } from '@lingui/macro'
import Image from 'next/image'
import BigNumber from 'bignumber.js'

import useStore from '@/store/useStore'

import { RCCrvUSDLogoXS, RCScrvUSDLogoXS } from 'ui/src/images'
import { isLoading } from '@/components/PageCrvUsdStaking/utils'

import Box from '@/ui/Box'
import {
  InputLabel,
  InputWrapper,
  SelectorBox,
  StyledIcon,
  StyledInputComp,
  InputSelectorText,
  ErrorText,
} from './styles'

const WithdrawModule: React.FC = () => {
  const onboardInstance = useStore((state) => state.wallet.onboard)
  const signerAddress = onboardInstance?.state.get().wallets?.[0]?.accounts?.[0]?.address
  const userBalances = useStore((state) => state.scrvusd.userBalances[signerAddress?.toLowerCase() ?? ''])
  const { inputAmount, preview, setInputAmount, setMax } = useStore((state) => state.scrvusd)

  const isLoadingBalances = !userBalances || isLoading(userBalances.fetchStatus)
  const isLoadingPreview = isLoading(preview.fetchStatus)

  const validationError = userBalances?.scrvUSD ? BigNumber(inputAmount).gt(BigNumber(userBalances.scrvUSD)) : false

  return (
    <Box flex flexColumn>
      <Box flex flexColumn>
        <InputLabel>{t`From Vault`}</InputLabel>
        <InputWrapper>
          <Box flex>
            <SelectorBox>
              <Image height={28} src={RCScrvUSDLogoXS} alt="scrvUSD logo" />
              <InputSelectorText>scrvUSD</InputSelectorText>
            </SelectorBox>
          </Box>
          <StyledInputComp
            value={inputAmount}
            walletBalance={userBalances?.scrvUSD ?? '0'}
            walletBalanceUSD={userBalances?.scrvUSD ?? '0'}
            walletBalanceSymbol="scrvUSD"
            isLoadingBalances={isLoadingBalances}
            isLoadingInput={false}
            setValue={setInputAmount}
            setMax={() => setMax(signerAddress?.toLowerCase() ?? '', 'withdraw')}
          />
        </InputWrapper>
      </Box>
      {validationError && (
        <ErrorText>{t`Input amount exceeds your balance, click max to use all your balance`}</ErrorText>
      )}
      <StyledIcon name="ArrowDown" size={16} />
      <div>
        <InputLabel>{t`To Wallet`}</InputLabel>
        <InputWrapper>
          <Box flex>
            <SelectorBox>
              <Image height={28} src={RCCrvUSDLogoXS} alt="Token Logo" />
              <InputSelectorText>crvUSD</InputSelectorText>
            </SelectorBox>
          </Box>
          <StyledInputComp
            value={preview.value}
            walletBalance={userBalances?.crvUSD ?? '0'}
            walletBalanceUSD={userBalances?.crvUSD ?? '0'}
            walletBalanceSymbol="crvUSD"
            isLoadingBalances={isLoadingBalances}
            isLoadingInput={isLoadingPreview}
            readOnly
          />
        </InputWrapper>
      </div>
    </Box>
  )
}

export default WithdrawModule
