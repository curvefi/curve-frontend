import { t } from '@lingui/macro'
import Image from 'next/image'

import { RCCrvUSDLogoXS, RCScrvUSDLogoXS } from 'ui/src/images'

import Box from '@/ui/Box'
import { InputLabel, InputWrapper, SelectorBox, StyledIcon, StyledInputComp, InputSelectorText } from './styles'

const DepositModule: React.FC = () => {
  return (
    <Box flex flexColumn>
      <div>
        <InputLabel>{t`From Vault`}</InputLabel>
        <InputWrapper>
          <Box flex>
            <SelectorBox>
              <Image height={28} src={RCScrvUSDLogoXS} alt="scrvUSD logo" />
              <InputSelectorText>scrvUSD</InputSelectorText>
            </SelectorBox>
          </Box>
          <StyledInputComp />
        </InputWrapper>
      </div>
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
          <StyledInputComp readOnly />
        </InputWrapper>
      </div>
    </Box>
  )
}

export default DepositModule
