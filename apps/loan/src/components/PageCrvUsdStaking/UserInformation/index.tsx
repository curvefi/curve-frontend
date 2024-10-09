import styled from 'styled-components'
import { t } from '@lingui/macro'
import Image from 'next/image'

import { RCCrvUSDLogoSM } from 'ui/src/images'

import Icon from '@/ui/Icon'
import { ExternalLink } from '@/ui/Link'
import Box from '@/ui/Box'

type UserInformationProps = {
  className?: string
}

const UserInformation: React.FC<UserInformationProps> = ({ className }) => {
  return (
    <UserInformationWrapper className={className}>
      <Title>{t`How to use the LLAma Savings Vault?`}</Title>
      <Box grid gridTemplateColumns="1fr 1fr" gridGap={4}>
        <InformationContainer>
          <Image src={RCCrvUSDLogoSM} alt="crvUSD logo" width={48} height={48} />
          <InformationTitle>{t`Deposit crvUSD in the Llama Savings vault (LSV)`}</InformationTitle>
          <InformationParagraph>{t`Borrow crvUSD, swap it from the market or use our convenient zap to deposit in the LSV. When Zapping, your tokens will be automatically converted to crvUSD before being deposited in the vault.`}</InformationParagraph>
        </InformationContainer>
        <InformationContainer>
          <Image src={RCCrvUSDLogoSM} alt="crvUSD logo" width={48} height={48} />
          <InformationTitle>{t`Watch your yield grow`}</InformationTitle>
          <InformationParagraph>{t`Your crvUSD is instantly generating yield according to your share of the LSV.  Your rewards get automatically compounded.`}</InformationParagraph>
          <InformationParagraph>{t`The more crvUSD market grows, the more revenue it generates and the more yield the LSV gives to its depositors.`}</InformationParagraph>
        </InformationContainer>
      </Box>
      <StyledExternalLink href="https://docs.curve.fi/llama-savings-vault">
        {t`TELL ME MORE`}
        <Icon name="ArrowUpRight" size={20} />
      </StyledExternalLink>
    </UserInformationWrapper>
  )
}

const UserInformationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--box--secondary--background-color);
  padding: var(--spacing-4);
  gap: var(--spacing-4);
`

const Title = styled.h3`
  font-size: var(--font-size-5);
  font-weight: var(--bold);
  text-transform: uppercase;
  margin: 0 auto;
`

const InformationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`

const InformationTitle = styled.h5`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  text-transform: uppercase;
`

const InformationParagraph = styled.p`
  font-size: var(--font-size-2);
  line-height: 1.5;
`

const StyledExternalLink = styled(ExternalLink)`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  text-decoration: none;
  font-size: var(--font-size-3);
  font-weight: var(--bold);
  text-transform: uppercase;
  margin: 0 auto;
  color: var(--primary-400);
`

export default UserInformation
