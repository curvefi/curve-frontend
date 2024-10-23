import styled from 'styled-components'
import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils'

import Icon from 'ui/src/Icon'
import Box from 'ui/src/Box'
import Loader from '@/ui/Loader'
import Button from 'ui/src/Button'

import NumberField from '@/components/PageCrvUsdStaking/components/InputComp/NumberField'

type InputCompProps = {
  walletBalance: string
  walletBalanceUSD: string
  walletBalanceSymbol: string
  value: number
  isLoading: boolean
  setValue?: (value: number) => void
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
  isLoading,
  value,
  setValue,
  setMax,
}) => {
  return (
    <InputCompWrapper className={className}>
      <Box flex flexColumn fillWidth>
        <NumberField value={value} isDisabled={readOnly} aria-label="Input" onChange={setValue} />
        <WalletBalanceWrapper>
          <StyledIcon name="Wallet" size={16} />
          <BalancesWrapper flex flexWrap="wrap">
            {isLoading ? (
              <Loader skeleton={[36, 12]} />
            ) : (
              <WalletBalance>
                {formatNumber(walletBalance)} {walletBalanceSymbol}
              </WalletBalance>
            )}
            <WalletBalanceUSD>${Number(walletBalanceUSD).toFixed(2)}</WalletBalanceUSD>
          </BalancesWrapper>
        </WalletBalanceWrapper>
      </Box>
      {!readOnly && <StyledButton variant="filled" onClick={setMax}>{t`Max`}</StyledButton>}
    </InputCompWrapper>
  )
}

const InputCompWrapper = styled.div`
  display: flex;
  flex-direction: row;
  background-color: var(--summary_header--loading--background-color);
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