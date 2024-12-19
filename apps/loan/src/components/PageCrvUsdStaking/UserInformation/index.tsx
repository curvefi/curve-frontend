import styled from 'styled-components'
import { t } from '@lingui/macro'
import Image from 'next/image'

import { RCCrvUSDLogoSM, RCScrvUSDLogoSM, RCYieldGrowth } from 'ui/src/images'

import Icon from '@/ui/Icon'
import { ExternalLink } from '@/ui/Link'

import { APP_LINK } from '@ui-kit/shared/routes'

type UserInformationProps = {
  className?: string
}

const UserInformation = ({ className }: UserInformationProps) => (
    <UserInformationWrapper className={className}>
      <Title>{t`How to get yield with Savings crvUSD?`}</Title>
      <TextContainerRow>
        <InformationContainer>
          <Image src={RCCrvUSDLogoSM} alt="crvUSD logo" width={48} height={48} />
          <InformationTitle>{t`Get crvUSD`}</InformationTitle>
          <InformationParagraph>
            {t`To access the yield of Savings crvUSD (scrvUSD), you need crvUSD.`}{' '}
            {t`You can acquire it on the open markets or borrow it in the LLAMALEND markets.`}
          </InformationParagraph>
          <InformationParagraph>
            {t`We recommend using Curve's`}{' '}
            <StyledExternalLinkInline href={APP_LINK.main.root}>QuickSwap</StyledExternalLinkInline>
            {t`, or alternatively an aggregator like`}{' '}
            <StyledExternalLinkInline href="https://swap.cow.fi/#/1/swap/WETH/crvUSD">Cowswap</StyledExternalLinkInline>
            .
          </InformationParagraph>
        </InformationContainer>
        <InformationContainer>
          <Image src={RCScrvUSDLogoSM} alt="scrvUSD logo" width={48} height={48} />
          <InformationTitle>{t`Deposit crvUSD and get scrvUSD`}</InformationTitle>
          <InformationParagraph>
            {t`By depositing crvUSD in the Curve Savings Vault, you get`}{' '}
            <StyledExternalLinkInline href="https://resources.curve.fi/crvusd/scrvusd/#how-to-deposit-and-withdraw-crvusd">
              scrvUSD
            </StyledExternalLinkInline>
            . {t`This token  represents your share of all the crvUSD deposited in the vault. `}
          </InformationParagraph>
          <InformationParagraph>
            {t`scrvUSD is a yield-bearing stablecoin you can use further in DeFi.`}
          </InformationParagraph>
        </InformationContainer>
        <InformationContainer>
          <StyledRCYieldGrowth />
          <InformationTitle>{t`Watch your yield grow`}</InformationTitle>
          <InformationParagraph>
            {t`Upon deposit, your crvUSD is instantly generating yield and your rewards get `}{' '}
            <StyledExternalLinkInline href="https://resources.curve.fi/crvusd/scrvusd/#how-does-the-interest-accrue">
              {t`automatically compounded`}
            </StyledExternalLinkInline>
            .
          </InformationParagraph>
          <InformationParagraph>
            {t`The more crvUSD’s market grows, the more revenue it generates and the more yield get directed to Savings crvUSD and veCRV holders.`}
          </InformationParagraph>
        </InformationContainer>
      </TextContainerRow>
      <StyledExternalLink href="https://resources.curve.fi/crvusd/scrvusd/">
        {t`Learn More`}
        <Icon name="ArrowUpRight" size={20} />
      </StyledExternalLink>
    </UserInformationWrapper>
  )

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
    grid-template-columns: 1fr 1fr 1fr;
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

const StyledExternalLinkInline = styled(ExternalLink)`
  text-transform: none;
  margin: 0;
`

const StyledRCYieldGrowth = styled(RCYieldGrowth)`
  stroke: var(--page--text-color);
  width: 48px;
  height: 48px;
`

export default UserInformation
