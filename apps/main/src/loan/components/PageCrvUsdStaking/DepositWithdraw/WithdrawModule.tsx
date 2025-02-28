import { t } from '@ui-kit/lib/i18n'
import Image from 'next/image'
import BigNumber from 'bignumber.js'

import useStore from '@/loan/store/useStore'
import { isLoading } from '@/loan/components/PageCrvUsdStaking/utils'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusdUserBalances'

import { RCCrvUSDLogoXS, RCScrvUSDLogoXS } from 'ui/src/images'

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
import { useWallet } from '@ui-kit/features/connect-wallet'

const WithdrawModule = () => {
  const { signerAddress } = useWallet()
  const { data: userScrvUsdBalance, isLoading: userScrvUsdBalanceLoading } = useScrvUsdUserBalances({
    userAddress: signerAddress ?? '',
  })
  const inputAmount = useStore((state) => state.scrvusd.inputAmount)
  const preview = useStore((state) => state.scrvusd.preview)
  const setInputAmount = useStore((state) => state.scrvusd.setInputAmount)
  const setMax = useStore((state) => state.scrvusd.setMax)

  const isLoadingPreview = isLoading(preview.fetchStatus)

  const validationError = userScrvUsdBalance?.scrvUSD
    ? BigNumber(inputAmount).gt(BigNumber(userScrvUsdBalance.scrvUSD))
    : false

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
            walletBalance={userScrvUsdBalance?.scrvUSD ?? '0'}
            walletBalanceSymbol="scrvUSD"
            isLoadingBalances={userScrvUsdBalanceLoading}
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
            walletBalance={userScrvUsdBalance?.crvUSD ?? '0'}
            walletBalanceSymbol="crvUSD"
            isLoadingBalances={userScrvUsdBalanceLoading}
            isLoadingInput={isLoadingPreview}
            readOnly
          />
        </InputWrapper>
      </div>
    </Box>
  )
}

export default WithdrawModule
