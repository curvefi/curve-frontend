import { t } from '@lingui/macro'
import Image from 'next/image'

import useStore from '@/store/useStore'
import { useSignerAddress } from '@/entities/signer'

import { RCCrvUSDLogoXS, RCScrvUSDLogoXS } from 'ui/src/images'

import Box from '@/ui/Box'

import { InputLabel, InputWrapper, SelectorBox, StyledIcon, StyledInputComp, InputSelectorText } from './styles'

const DepositModule: React.FC = () => {
  const { data: signerAddress } = useSignerAddress()
  const userBalances = useStore((state) => state.scrvusd.userBalances[signerAddress?.toLowerCase() ?? ''])
  const { inputAmount, preview, setInputAmount, setMax } = useStore((state) => state.scrvusd)

  const isLoadingBalances = !userBalances || userBalances.fetchStatus === 'loading'
  const isLoadingPreview = preview.fetchStatus === 'loading'

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
          <Box flex flexColumn>
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
          </Box>
        </InputWrapper>
      </Box>
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
            value={+preview.value}
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
