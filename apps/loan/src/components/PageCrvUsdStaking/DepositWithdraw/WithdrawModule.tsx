import { t } from '@lingui/macro'
import Image from 'next/image'

import useStore from '@/store/useStore'
import { useSignerAddress } from '@/entities/signer'

import { RCCrvUSDLogoXS, RCScrvUSDLogoXS } from 'ui/src/images'
import { isLoading } from '@/components/PageCrvUsdStaking/utils'

import Box from '@/ui/Box'
import {
  ErrorText,
  InputLabel,
  InputWrapper,
  SelectorBox,
  StyledIcon,
  StyledInputComp,
  InputSelectorText,
} from './styles'

const WithdrawModule: React.FC = () => {
  const { data: signerAddress } = useSignerAddress()
  const userBalances = useStore((state) => state.scrvusd.userBalances[signerAddress?.toLowerCase() ?? ''])
  const { inputAmount, preview, setInputAmount } = useStore((state) => state.scrvusd)

  const isLoadingBalances = !userBalances || isLoading(userBalances.fetchStatus)
  const isLoadingPreview = isLoading(preview.fetchStatus)
  const isError = inputAmount > +userBalances?.scrvUSD

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
          />
        </InputWrapper>
        {isError && <ErrorText>{t`You don't have enough scrvUSD to withdraw`}</ErrorText>}
      </Box>
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
            value={+preview.value}
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
