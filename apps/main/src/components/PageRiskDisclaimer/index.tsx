import styled from 'styled-components'
import { t } from '@lingui/macro'

import {
  RiskWrapper,
  RiskTitle,
  RiskSection,
  RiskSubHeadingWrapper,
  RiskSubTitle,
  RiskSubHeading,
  RiskParagraph,
  RiskComment,
} from '@/ui/RiskDisclaimer/styles'
import { ExternalLink } from '@/ui/Link'
import Box from '@/ui/Box'

const RiskDisclaimer = () => {
  return (
    <RiskWrapper>
      <RiskTitle>{t`Curve Pool Risk Disclosures for Liquidity Providers`}</RiskTitle>
      <RiskSection>
        <RiskParagraph>
          {t`
          Providing liquidity on Curve doesn't come without risks. Before making a deposit, it is best to research and understand the risks involved.
        `}
        </RiskParagraph>
        <Box flex flexColumn className="extra-margin">
          <StyledExternalLink
            $noStyles
            href="https://docs.curve.fi/references/whitepapers/overview/"
          >{t`Curve Whitepapers`}</StyledExternalLink>
          <StyledExternalLink
            $noStyles
            href="https://docs.curve.fi/references/audits/"
          >{t`Smart Contract Audits`}</StyledExternalLink>
        </Box>
      </RiskSection>

      <RiskSection>
        <RiskSubTitle>{t`Technology Risk`}</RiskSubTitle>
        <RiskSubHeadingWrapper>
          <RiskSubHeading>{t`Smart Contract Risk:`}</RiskSubHeading>
          <RiskParagraph>
            {t`Curve relies on smart contracts, which are self-executing pieces of code. While these contracts are designed to be secure, there is a risk that they may contain vulnerabilities or bugs. Malicious actors could exploit these vulnerabilities, resulting in the loss of funds or other adverse consequences. It is essential for users to conduct due diligence and review the smart contracts and security audit reports to assess the inherent risks.`}
          </RiskParagraph>
        </RiskSubHeadingWrapper>
        <RiskParagraph>
          {t`Curve smart contracts have undergone multiple audits by reputable firms including Trail of Bits, MixBytes, QuantStamp, and ChainSecurity to enhance protocol security. While smart contract audits play an important role in good security practices to mitigate user risks, they don't eliminate all risks. Users should always exercise caution regardless of Curve's commitment to protocol security.`}
        </RiskParagraph>
        <RiskSubHeadingWrapper>
          <RiskSubHeading>{t`Immutability and Irreversibility of Transactions:`}</RiskSubHeading>
          <RiskParagraph>
            {t`When you engage in transactions on Ethereum or EVM-compatible blockchains, it is important to understand that these transactions are immutable and irreversible. Once a transaction is confirmed and recorded on the blockchain, it cannot be modified, reversed, or deleted. This means that if a user sends funds to an incorrect address or engage in a fraudulent transaction, it may not be possible to recover the funds. It is crucial to exercise caution, verify transaction details, and use secure wallets to minimize the risk of irreversible transactions.`}
          </RiskParagraph>
        </RiskSubHeadingWrapper>
      </RiskSection>

      <RiskSection>
        <RiskSubTitle>{t`Counterparty Risk`}</RiskSubTitle>
        <RiskSubHeadingWrapper>
          <RiskSubHeading>{t`Access Control:`}</RiskSubHeading>
          <RiskParagraph>
            {t`Curve pool smart contracts are intentionally designed to be immutable and noncustodial, meaning they cannot be upgraded and liquidity providers always retain full control of their funds. While this characteristic may limit protective actions in case of emergencies, it significantly strengthens user assurances about custody of their funds.`}
          </RiskParagraph>
        </RiskSubHeadingWrapper>
        <RiskParagraph>
          {t`The Curve protocol is governed by a Decentralized Autonomous Organization (DAO) comprised of veCRV tokenholders that requires a 1-week vote period with 51% approval and a sufficient voter quorum to execute any actions. It controls critical system functions, including the implementation of new system contracts and the adjustment of system parameters.`}
        </RiskParagraph>
        <RiskParagraph>
          {t`The Curve Emergency Admin is a`}{' '}
          <StyledExternalLink $noStyles href="https://etherscan.io/address/0x467947EE34aF926cF1DCac093870f613C96B1E0c">
            {t`5-of-9 multisig`}
          </StyledExternalLink>{' '}
          {t`composed of Curve community members. It has restricted rights to undertake actions that do not directly impact users' funds, including canceling parameter changes authorized by the DAO and halting CRV emissions to a pool. Early pool implementations included a timelimited function to freeze swaps and deposits in case of emergency, but this precautionary function has since been deprecated in current pool implementations.`}
        </RiskParagraph>
      </RiskSection>

      <RiskSection>
        <RiskSubTitle>{t`Asset Risk`}</RiskSubTitle>
        <RiskSubHeadingWrapper>
          <RiskSubHeading>{t`Permanent Loss of a Peg:`}</RiskSubHeading>
          <RiskParagraph>
            {t`Stablecoins and other derivative assets are designed to maintain a peg to a reference asset. If one of the pool assets drops below its peg, it effectively means that liquidity providers in the pool hold almost all their liquidity in that token. The depegged token may never recover as a result of a technical failure, insolvency, or other adverse situations.`}
          </RiskParagraph>
        </RiskSubHeadingWrapper>
        <RiskParagraph>
          {t`If the token fails to regain its peg, liquidity providers will encounter losses proportional to the severity of the depeg. The potential permanent loss highlights the importance of thorough consideration and caution when participating in activities involving stablecoins and/or derivative assets.`}
        </RiskParagraph>
        <RiskSubHeadingWrapper>
          <RiskSubHeading>{t`Impermanent Loss:`}</RiskSubHeading>
          <RiskParagraph>
            {t`Providing liquidity to Curve pools may expose users to the risk of impermanent loss. Fluctuations in asset prices after supplying to a pool can result in losses when users remove liquidity. Before engaging in liquidity provision activities, users are advised to carefully evaluate the potential for impermanent loss and consider their own risk tolerance.`}
          </RiskParagraph>
        </RiskSubHeadingWrapper>
        <RiskParagraph>
          <StyledExternalLink $noStyles href="https://docs.curve.fi/stableswap-exchange/overview/">
            {t`StableSwap pools`}
          </StyledExternalLink>{' '}
          {t`are designed to mitigate impermanent loss by pairing assets that are expected to exhibit mean-reverting behavior. This assumption may not hold true in every case, requiring diligent assessment when interacting with these pools.`}
        </RiskParagraph>
        <RiskParagraph>
          <StyledExternalLink $noStyles href="https://docs.curve.fi/stableswap-exchange/overview/">
            {t`CryptoSwap V2 pools`}
          </StyledExternalLink>{' '}
          {t`are designed with an internal oracle to concentrate liquidity around the current market price. The algorithm attempts to offset the effects of impermanent loss by calculating fees generated by the pool and ensuring the pool is in profit before re-pegging. Impermanent loss may still occur in CryptoSwap V2 pools, particularly when the earned fees are insufficient to counterbalance the impact of re-pegging. This underscores the need for users to be attentive about the dynamics of these pools when making decisions about liquidity provision.`}
        </RiskParagraph>
        <RiskSubHeadingWrapper>
          <RiskSubHeading>{t`Price Volatility:`}</RiskSubHeading>
          <RiskParagraph>
            {t`Cryptocurrencies and ERC20 tokens have historically exhibited significant price volatility. They can experience rapid and substantial fluctuations in value, which may occur within short periods of time. The market value of any token may rise or fall, and there is no guarantee of any specific price stability.`}
          </RiskParagraph>
        </RiskSubHeadingWrapper>
        <RiskParagraph>
          {t`The overall market dynamics, including price volatility, liquidity fluctuations, and broader economic factors, can impact the value of user funds when providing liquidity. Sudden market movements or unexpected events can result in losses that may be difficult to anticipate or mitigate.`}
        </RiskParagraph>
        <RiskSubHeadingWrapper>
          <RiskSubHeading>{t`Unvetted Tokens:`}</RiskSubHeading>
          <RiskParagraph>
            {t`Due to the permissionless pool factory and the absence of strict onboarding criteria, not every token included in Curve pools undergoes a detailed independent risk assessment. Curve pools may contain unvetted tokens that have uncertain value or potential fraudulent characteristics. The presence of unvetted tokens introduces potential risks, including exchange rate volatility, smart contract vulnerabilities, liquidity risks, and other unforeseen circumstances that could result in the loss of funds or other adverse consequences.`}
          </RiskParagraph>
        </RiskSubHeadingWrapper>
        <RiskParagraph>
          {t`When participating as a liquidity provider in any pool, users should carefully assess the tokens' functionality, security audits, team credibility, community feedback, and other relevant factors to make informed decisions and mitigate potential risks associated with the pool assets.`}
        </RiskParagraph>
        <RiskSubHeadingWrapper>
          <RiskSubHeading>{t`Pools with Lending Assets:`}</RiskSubHeading>
          <RiskParagraph>
            {t`Due to composability within DeFi, it is possible for assets in Curve pools to be receipt tokens for deposits in third party lending platforms. Composability of this sort can amplify yields for liquidity providers, but it also exposes users to additional risks associated with the underlying lending protocol. Users interacting with pools that involve lending assets should be mindful of this additional risk and conduct due diligence on the associated lending protocol.`}
          </RiskParagraph>
        </RiskSubHeadingWrapper>
      </RiskSection>

      <RiskSection>
        <RiskSubTitle>{t`Regulatory Risk`}</RiskSubTitle>
        <RiskSubHeadingWrapper>
          <RiskSubHeading>{t`Regulatory Uncertainty:`}</RiskSubHeading>
          <RiskParagraph>
            {t`The regulatory landscape surrounding blockchain technology, DeFi protocols, tokens, cryptocurrencies, and related activities is constantly evolving, resulting in regulatory uncertainty. The lack of clear and consistent regulations may impact legal obligations, compliance requirements, and potential risks associated with the protocol activities.`}
          </RiskParagraph>
        </RiskSubHeadingWrapper>
        <RiskComment>
          {t`Disclaimer: The information provided within this context does not constitute financial, legal, or tax advice personalized to your specific circumstances. The content presented is for informational purposes only and should not be relied upon as a substitute for professional advice tailored to your individual needs. It is recommended that you seek the advice of qualified professionals regarding financial, legal, and tax matters before engaging in any activities on Curve.`}
        </RiskComment>
      </RiskSection>
    </RiskWrapper>
  )
}

const StyledExternalLink = styled(ExternalLink)`
  color: var(--link--color);
  text-transform: none;
  font-weight: var(--semi-bold);
  :hover {
    color: var(--link--hover--color);
    text-decoration-color: var(--link--underline--hover-color);
  }
`

export default RiskDisclaimer
