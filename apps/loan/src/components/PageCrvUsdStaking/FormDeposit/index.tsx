import { SubNavItem } from '@/components/PageCrvUsdStaking/components/SubNav/types'

import { useState } from 'react'
import Image from 'next/image'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import { SUB_NAV_ITEMS } from '@/components/PageCrvUsdStaking/FormDeposit/constants'
import crvLogo from 'ui/src/images/curve-logo.png'

import Box from '@/ui/Box'
import Button from '@/ui/Button'
import Icon from '@/ui/Icon'

import InputComp from '@/components/PageCrvUsdStaking/components/InputComp'
import SubNav from '@/components/PageCrvUsdStaking/components/SubNav'
import TransactionDetails from '@/components/PageCrvUsdStaking/TransactionDetails'

const FormDeposit = () => {
  const [activeKey, setActiveKey] = useState<keyof typeof SUB_NAV_ITEMS>('deposit' as keyof typeof SUB_NAV_ITEMS)

  const setNavChange = (key: string) => {
    setActiveKey(key as keyof typeof SUB_NAV_ITEMS)
  }

  return (
    <Wrapper>
      <SubNav activeKey="deposit" navItems={SUB_NAV_ITEMS} setNavChange={setNavChange} />
      <ModuleContainer>
        <div>
          <InputLabel>{t`From Wallet`}</InputLabel>
          <InputWrapper>
            <Box flex>
              <SelectorBox>
                <Image height={28} src={crvLogo} alt="Token Logo" />
                <InputSelectorText>crvUSD</InputSelectorText>
              </SelectorBox>
            </Box>
            <StyledInputComp />
          </InputWrapper>
        </div>
        <StyledIcon name="ArrowDown" size={16} />
        <div>
          <InputLabel>{t`To Vault`}</InputLabel>
          <InputWrapper>
            <Box flex>
              <SelectorBox>
                <Image height={28} src={crvLogo} alt="scrvUSD logo" />
                <InputSelectorText>scrvUSD</InputSelectorText>
              </SelectorBox>
            </Box>
            <StyledInputComp readOnly />
          </InputWrapper>
        </div>
        <StyledButton variant="filled">{t`Deposit`}</StyledButton>
        <TransactionDetails />
      </ModuleContainer>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const ModuleContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--box--secondary--background-color);
  max-width: 25rem;
  padding: var(--spacing-3);
`

const SelectorBox = styled.div`
  background-color: var(--input--background-color);
  padding: var(--spacing-2);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 8rem;
`

const StyledIcon = styled(Icon)`
  margin: var(--spacing-3) auto 0;
`

const StyledInputComp = styled(InputComp)`
  width: 100%;
`

const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-2);
`

const InputSelectorText = styled.p`
  font-weight: var(--bold);
`

const InputLabel = styled.p`
  font-size: var(--font-size-2);
  margin-bottom: var(--spacing-1);
`

const StyledButton = styled(Button)`
  margin: var(--spacing-3) 0;
`

export default FormDeposit
