import styled from 'styled-components'
import { t } from '@lingui/macro'

import Icon from 'ui/src/Icon'
import Box from 'ui/src/Box'

import NumberField from '@/components/PageCrvUsdStaking/components/InputComp/NumberField'
import Button from 'ui/src/Button'

type InputCompProps = {
  className?: string
  readOnly?: boolean
}

const InputComp: React.FC<InputCompProps> = ({ className, readOnly = false }) => {
  return (
    <InputCompWrapper className={className}>
      <Box flex flexColumn fillWidth>
        <NumberField defaultValue={0} isDisabled={readOnly} />
        <WalletBalanceWrapper>
          <StyledIcon name="Wallet" size={16} />
          <WalletBalance>1000 ETH</WalletBalance>
          <WalletBalanceUSD>$1000</WalletBalanceUSD>
        </WalletBalanceWrapper>
      </Box>
      {!readOnly && <StyledButton variant="filled">{t`Max`}</StyledButton>}
    </InputCompWrapper>
  )
}

const InputCompWrapper = styled.div`
  display: flex;
  flex-direction: row;
  background-color: var(--input--background-color);
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

const WalletBalance = styled.p`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
`

const WalletBalanceUSD = styled.p`
  font-size: var(--font-size-1);
  opacity: 0.5;
`

const StyledButton = styled(Button)`
  margin: auto var(--spacing-1) auto 0;
  text-transform: uppercase;
`

export default InputComp
