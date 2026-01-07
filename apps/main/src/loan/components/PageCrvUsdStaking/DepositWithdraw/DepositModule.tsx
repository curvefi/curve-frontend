import BigNumber from 'bignumber.js'
import { RCCrvUSDLogoXS, RCScrvUSDLogoXS } from 'ui/src/images'
import { useConnection } from 'wagmi'
import { isLoading } from '@/loan/components/PageCrvUsdStaking/utils'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances'
import useStore from '@/loan/store/useStore'
import Box from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'
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

  const validationError =
    hasWallet && userScrvUsdBalance?.crvUSD ? BigNumber(inputAmount).gt(BigNumber(userScrvUsdBalance.crvUSD)) : false

  return (
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
