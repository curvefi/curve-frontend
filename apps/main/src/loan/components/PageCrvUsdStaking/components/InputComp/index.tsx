import styled from 'styled-components'
import { t } from '@ui-kit/lib/i18n'
import { useState } from 'react'

import { formatNumber } from '@ui/utils'

import Icon from 'ui/src/Icon'
import Box from 'ui/src/Box'
import Loader from '@ui/Loader'
import Button from 'ui/src/Button'

import NumberField from '@/loan/components/PageCrvUsdStaking/components/InputComp/NumberField'

type InputCompProps = {
  walletBalance: string
  walletBalanceUSD: string
  walletBalanceSymbol: string
  value: string
  isLoadingInput: boolean
  isLoadingBalances: boolean
  setValue?: (value: string) => void
  setMax?: () => void
  className?: string
  readOnly?: boolean
}

const InputComp: React.FC<InputCompProps> = ({
  className,
  readOnly = false,
  walletBalance,
  walletBalanceUSD,
  walletBalanceSymbol,
  isLoadingInput,
  isLoadingBalances,
  value,
  setValue,
  setMax,
}) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <InputCompWrapper className={className} isFocused={isFocused}>
      <Box flex flexColumn fillWidth>
        {isLoadingInput ? (
          <InputLoaderWrapper>
            <Loader isLightBg skeleton={[36, 14]} />
          </InputLoaderWrapper>
        ) : (
          <NumberField
            value={value}
            isDisabled={readOnly}
            aria-label="Input"
            onChange={setValue}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        )}
        <WalletBalanceWrapper>
          <StyledIcon name="Wallet" size={16} />
          <BalancesWrapper flex flexColumn>
            {isLoadingBalances ? (
              <Loader isLightBg skeleton={[36, 14]} />
            ) : (
              <WalletBalance>
                {formatNumber(walletBalance, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}{' '}
                {walletBalanceSymbol}
              </WalletBalance>
            )}
          </BalancesWrapper>
        </WalletBalanceWrapper>
      </Box>
      {!readOnly && <StyledButton variant="filled" onClick={setMax}>{t`Max`}</StyledButton>}
    </InputCompWrapper>
  )
}

const InputCompWrapper = styled.div<{ isFocused: boolean }>`
  display: flex;
  flex-direction: row;
  min-height: var(--height-x-large);
  padding: var(--spacing-1);
  color: var(--gray-200);
  background-color: var(--input--background-color);
  box-sizing: border-box;
  border: 1px solid var(--input--border-color);
  box-shadow: inset 0.5px 0.5px 0 0.5px var(--input--border-color);
  ${({ isFocused }) =>
    isFocused && 'border: 1px solid var(--primary-400); box-shadow: inset 0.5px 0.5px 0 0.5px var(--primary-400);'}
`

const InputLoaderWrapper = styled.div`
  padding: var(--spacing-1);
`

const StyledIcon = styled(Icon)`
  margin-left: var(--spacing-1);
  opacity: 0.5;
`

const WalletBalanceWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-1);
`

const BalancesWrapper = styled(Box)`
  gap: 0 var(--spacing-1);
`

const WalletBalance = styled.p`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  white-space: nowrap;
`

const WalletBalanceUSD = styled.p`
  font-size: var(--font-size-1);
  opacity: 0.5;
  white-space: nowrap;
`

const StyledButton = styled(Button)`
  margin: auto var(--spacing-1) auto 0;
  text-transform: uppercase;
`

export default InputComp
