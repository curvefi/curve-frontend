import styled from 'styled-components'
import { t } from '@lingui/macro'
import Image from 'next/image'

import { RCCrvUSDLogoSM, RCYieldGrowth } from 'ui/src/images'

import Icon from '@/ui/Icon'
import { ExternalLink } from '@/ui/Link'

type UserInformationProps = {
  className?: string
}

const UserInformation: React.FC<UserInformationProps> = ({ className }) => {
  return (
    <UserInformationWrapper className={className}>
      <Title>{t`How to use the crvUSD Savings vault?`}</Title>
      <TextContainerRow>
        <InformationContainer>
          <Image src={RCCrvUSDLogoSM} alt="crvUSD logo" width={48} height={48} />
          <InformationTitle>{t`Deposit crvUSD in the crvUSD Savings vault (CSV)`}</InformationTitle>
          <InformationParagraph>{t`Borrow crvUSD, swap it from the market or use our convenient zap to deposit in the CSV. When Zapping, your tokens will be automatically converted to crvUSD before being deposited in the vault.`}</InformationParagraph>
        </InformationContainer>
        <InformationContainer>
          <StyledRCYieldGrowth />
          <InformationTitle>{t`Watch your yield grow`}</InformationTitle>
          <InformationParagraph>{t`Your crvUSD is instantly generating yield according to your share of the CSV.  Your rewards get automatically compounded.`}</InformationParagraph>
          <InformationParagraph>{t`The more crvUSD market grows, the more revenue it generates and the more yield the CSV gives to its depositors.`}</InformationParagraph>
        </InformationContainer>
      </TextContainerRow>
      <StyledExternalLink href="https://docs.curve.fi/scrvusd/overview/">
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

const TextContainerRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  @media (min-width: 41.875rem) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: var(--spacing-4);
  }
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

const StyledRCYieldGrowth = styled(RCYieldGrowth)`
  stroke: var(--page--text-color);
  width: 48px;
  height: 48px;
`

export default UserInformation
