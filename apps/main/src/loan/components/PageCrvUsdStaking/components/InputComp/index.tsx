import { useState } from 'react'
import { styled } from 'styled-components'
import { NumberField } from '@/loan/components/PageCrvUsdStaking/components/InputComp/NumberField'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { Loader } from '@ui/Loader'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

type InputCompProps = {
  walletBalance: string
  walletBalanceSymbol: string
  value: string
  isLoadingInput: boolean
  isLoadingBalances: boolean
  setValue?: (value: string) => void
  setMax?: () => void
  className?: string
  readOnly?: boolean
}

export const InputComp = ({
  className,
  readOnly = false,
  walletBalance,
  walletBalanceSymbol,
  isLoadingInput,
  isLoadingBalances,
  value,
  setValue,
  setMax,
}: InputCompProps) => {
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
                {walletBalance
                  ? `${formatNumber(walletBalance, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${walletBalanceSymbol}`
                  : '-'}
              </WalletBalance>
            )}
          </BalancesWrapper>
        </WalletBalanceWrapper>
      </Box>
      {!readOnly && setMax && <StyledButton variant="filled" onClick={setMax}>{t`Max`}</StyledButton>}
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
  color: var(--page--text-color);
  opacity: 0.5;
`

const WalletBalanceWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  color: var(--page--text-color);
  gap: var(--spacing-1);
  opacity: 0.7;
`

const BalancesWrapper = styled(Box)`
  gap: 0 var(--spacing-1);
`

const WalletBalance = styled.p`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  white-space: nowrap;
`

const StyledButton = styled(Button)`
  margin: auto var(--spacing-1) auto 0;
  text-transform: uppercase;
`
