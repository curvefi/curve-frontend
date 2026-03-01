import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { getInternalUrl, PAGE_LEGAL } from '@ui-kit/shared/routes'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { pushSearchParams } from '@ui-kit/utils/urls'
import type { TabProps } from '../../types/tabs'
import { List } from '../general/List'
import { Section, Header, Title, Paragraph, Bold, SubTitle } from '../general/Section'

export const Terms = ({ currentApp, network }: TabProps) => (
  <>
    <Header>{t`Preamble`}</Header>
    <Section>
      <Paragraph>
        {t`These terms and conditions (`}
        <Bold>{t`"Terms"`}</Bold>
        {t`) are entered into between Swiss Stake AG with registered office in Zug, Switzerland (`}
        <Bold>{t`"we"`}</Bold>
        {t`, `}
        <Bold>{t`"us"`}</Bold>
        {t` or `}
        <Bold>{t`"Company"`}</Bold>
        {t`) and the users (`}
        <Bold>{t`"you"`}</Bold>
        {t` or `}
        <Bold>{t`"your"`}</Bold>
        {t`) of the website [www.curve.finance] (`}
        <Bold>{t`«Website»`}</Bold>
        {t`). These Terms, together with our Privacy Policy, govern your access to and use of the Website, including any data, information, items, links and Curve Functionalities which can be accessed via the Website.`}
      </Paragraph>
      <Paragraph>
        {t`We reserve the right to modify these Terms at any time at our sole discretion. In this case, the Company will provide notice by changing the «last updated» date above. By continuing to access or use the Website, you confirm that you accept these updated Terms, and all documents incorporated therein by reference. If you do not agree with these Terms and/or the Privacy Notice, please immediately cease all use of the Website.`}
      </Paragraph>
      <Paragraph>
        {t`Other terms from third parties outside of these Terms may apply to you, in particular if you access any functionalities or services provided by third-parties, items or websites linked on the Website. Such other terms apply in addition to these Terms.`}
      </Paragraph>
    </Section>

    <Header>{t`1. Eligibility and Prohibited Jurisdictions`}</Header>
    <Section>
      <Paragraph>{t`By accessing or using the Website, you represent and warrant that you:`}</Paragraph>

      <Paragraph>
        <List type="lower-alpha">
          <Typography component="li" variant="bodyMRegular">
            {t`have the right, authority, and legal capacity to accept these Terms;`}
          </Typography>
          <Typography component="li" variant="bodyMRegular">
            {t`will not use the Website if the laws of your country of residency and/or citizenship prohibit you from doing so in accordance with these Terms;`}
          </Typography>
          <Typography component="li" variant="bodyMRegular">
            {t`only access or use the Website for your own personal use;`}
          </Typography>
          <Typography component="li" variant="bodyMRegular">
            {t`are not subject to personal sanctions issued by the UN, US, EU or Switzerland; and`}
          </Typography>
          <Typography component="li" variant="bodyMRegular">
            {t`are not accessing or using the Website from one of the countries embargoed or restricted by the Swiss State Secretariat for Economic Affairs (SECO), including but not limited to: Belarus, Burundi, Central African Republic, Congo, DPRK (North Korea), Guinea, Guinea-Bissau, Iran, Iraq, Lebanon, Libya, Mali, Myanmar (Burma), Republic of South Sudan, Russia, Somalia, Sudan, Syria, Ukraine, Venezuela, Yemen, or Zimbabwe (if your country is embargoed or restricted can be found out under the following`}{' '}
            <Link
              color="textSecondary"
              href="https://www.seco.admin.ch/seco/de/home/Aussenwirtschaftspolitik_Wirtschaftliche_Zusammenarbeit/Wirtschaftsbeziehungen/exportkontrollen-und-sanktionen/sanktionen-embargos/sanktionsmassnahmen/suche_sanktionsadressaten.html"
              target="_blank"
            >
              {t`link`}
            </Link>{' '}
            {t`(`}
            <Bold>{t`Restricted Jurisdictions`}</Bold>
            {t`).`}
          </Typography>
        </List>
      </Paragraph>
      <Paragraph>
        {t`We reserve the right to technically restrict the access to the Website and the content provided thereon based on your geographical location.`}
      </Paragraph>
    </Section>

    <Header>{t`2. Content of the Website`}</Header>
    <Section>
      <Title>{t`2.1 Information Accessible through the Website`}</Title>

      <SubTitle>{t`2.1.1 Overview`}</SubTitle>
      <Paragraph>
        {t`Users may find information related to the curve project (`}
        <Bold>{t`"Curve Project"`}</Bold>
        {t`) and its respective ecosystem (`}
        <Bold>{t`"Information"`}</Bold>
        {t`). The Information accessible on the Website concerns:`}
      </Paragraph>
      <Paragraph>
        <List type="disc">
          <Typography component="li" variant="bodyMRegular">
            {t`Technical Information: The Website provides access to various types of documentation related to the Curve ecosystem, including among others user guides (`}
            <Link color="textSecondary" href="https://docs.curve.finance/" target="_blank">
              {t`https://docs.curve.finance/`}
            </Link>
            {t`), GitHub repositories (`}
            <Link color="textSecondary" href="https://github.com/curvefi" target="_blank">
              {t`Curve GitHub`}
            </Link>
            {t`), a blog featuring the latest news in the Curve ecosystem (`}
            <Link color="textSecondary" href="https://news.curve.finance/" target="_blank">
              {t`Curve News`}
            </Link>
            {t`), a list of applications reportedly built on top of the Curve ecosystem (`}
            <Link color="textSecondary" href="https://www.curve.finance/dex/ethereum/integrations/" target="_blank">
              {t`Integrations - Curve`}
            </Link>
            {t`) and technical documentation detailing the implementation of the core Curve protocol and its associated smart contracts (`}
            <Link color="textSecondary" href="https://docs.curve.finance/" target="_blank">
              {t`Curve Technical Docs`}
            </Link>
            {t`).`}
          </Typography>
          <Typography component="li" variant="bodyMRegular">
            {t`Community Information: The Website offers access to the social media channels associated with the Curve Project including Twitter, Discord, YouTube and Telegram.`}
          </Typography>
          <Typography component="li" variant="bodyMRegular">
            {t`Security Information: The Website presents information related to the security of the Curve Project, respectively the Curve Functionalities and respective ecosystem, including audits reports (`}
            <Link
              color="textSecondary"
              href="https://docs.curve.finance/security/security/#security-audits"
              target="_blank"
            >
              {t`Bug Bounty & Audits - Curve Technical Docs`}
            </Link>
            {t`), details on bug bounty programs (`}
            <Link color="textSecondary" href="https://docs.curve.finance/security/security/#bug-bounty" target="_blank">
              {t`Bug Bounty & Audits - Curve Technical Docs`}
            </Link>
            {t`) and relevant statistics (`}
            <Link color="textSecondary" href="https://dune.com/mrblock_buidl/Curve.fi" target="_blank">
              {t`Curve.fi`}
            </Link>
            {t`) and API status monitoring (`}
            <Link color="textSecondary" href="https://statuspage.freshping.io/59335-CurveAPI" target="_blank">
              {t`Curve API's Live status - Powered by Freshping`}
            </Link>
            {t`).`}
          </Typography>
        </List>
      </Paragraph>
      <Paragraph>
        {t`The Information is provided for general informational purposes only. The Information may be generated or supplemented by artificial intelligence, or third parties and we make no representations or warranties regarding its accuracy, completeness, or usefulness. Any reference to a third-party provider, projects and applications does not entail any endorsement by the Company and no background checks have been conducted in this regard. Any reliance you place on the Information is strictly at your own risk. Nothing in the Information should be used or relied upon as legal, financial, tax or other advice, or as an instruction or solicitation of action by any person.`}
      </Paragraph>
      <SubTitle>{t`2.1.2 Third Party Links`}</SubTitle>
      <Paragraph>
        {t`The Website may contain links to websites and content that is controlled or operated by third parties (`}
        <Bold>{t`"Third Party Links"`}</Bold>
        {t`). The Company is providing these Third-Party Links for convenience only, and the inclusion of any Third-Party Links on the Website does not imply any endorsement by the Company of the Third-Party Links and/or their operators. The Company is not responsible for any content associated with the Third-Party Links.`}
      </Paragraph>
      <Paragraph>
        {t`If you believe that any Third-Party Links include or promote illegal, harmful, fraudulent, infringing, obscene, defamatory, threatening, intimidating, harassing, hateful, racially, ethnically or otherwise offensive content, please contact us via enquiries@curve.fi so that we can remove any such Third-Party Links from the Website.`}
      </Paragraph>
    </Section>

    <Section>
      <Title>{t`2.2 Functionalities Accessible through the Website`}</Title>
      <SubTitle>{t`2.2.1 Overview`}</SubTitle>
      <Paragraph>
        {t`The Website provides a non-exclusive interface via which Users may access, interact and use the Curve Project software, consisting of a set of smart contracts as deployed (`}
        <Bold>{t`"Curve Smart Contracts"`}</Bold>
        {t`), as well as access to tooling software, data analytics and governance tools (together with the Curve Smart Contracts the `}
        <Bold>{t`"Curve Functionalities"`}</Bold>
        {t`). The Curve Smart Contracts enable Users among others and in a fully decentralized manner, to provide liquidity by participating in or creating liquidity pools, to lend or borrow tokens and to participate in the governance of the Curve Project.`}
      </Paragraph>
      <Paragraph>
        {t`Users understand that the content of the Curve Functionalities may evolve over time due to regulatory requirements and ongoing development in the Curve ecosystem.`}
      </Paragraph>

      <SubTitle>{t`2.2.2 Third Party Wallet`}</SubTitle>
      <Paragraph>
        {t`To access the Curve Functionalities and interact with their underlying technology via the Website, you must first connect one of the third-party listed wallets under the "Connect Wallet" tab of the Website.`}
      </Paragraph>
      <Paragraph>
        {t`You are solely responsible for the security of your Wallets, and any associated seed phrases, passwords, and private keys (collectively `}
        <Bold>{t`"Security Credentials"`}</Bold>
        {t`). It is crucial to remember your Security Credentials, to store them in a safe place, and to not disclose them to anyone.`}
      </Paragraph>
      <Paragraph>
        {t`We have no control over or access to any of your Security Credentials, Wallets, and/or digital assets held in your Wallets. We will not be able to recover, restore, and/or retrieve your Security Credentials and/or your digital assets in your Wallet. You further understand and acknowledge that the security and integrity of your Security Credentials, Wallets, and thus the digital assets held therein, are largely dependent upon the technical integrity of your mobile device and your maintenance of appropriate confidentiality and security measures for the Security Credentials associated with your Wallets.`}
      </Paragraph>
      <Paragraph>
        {t`We assume no liability for any damages, including but not limited to, those associated with the disclosure, manipulation, or hacking of your Security Credentials, or those that may result in the unauthorized access to your Wallets.`}
      </Paragraph>
      <SubTitle>{t`2.2.3 Third Party Services`}</SubTitle>
      <Paragraph>
        {t`The Website as well as the Curve Functionalities may include links to third-party services, APIs, architecture and technology (`}
        <Bold>{t`"Third-Party Service"`}</Bold>
        {t`) with which you can interact using your Wallet (e.g. aggregators or other routing services).`}
      </Paragraph>
      <Paragraph>
        {t`We provide a link to these Third-Party Services merely as a convenience and the link to any Third-Party Services via or on the Website does not imply any warranty, endorsement or recommendation by the Company of the Third-Party Services and/or their operators.`}
      </Paragraph>
      <Paragraph>
        {t`We have no control over and are not responsible for such Third-Party Services, including without limitation, their fitness, security, availability and reliability. By using the Third-Party Services, you are not interacting with the Company in any way. Any dealings you have with Third-Party Services in connection with the use of the Curve Functionalities are between you and the Third-Party.`}
      </Paragraph>
      <Paragraph>
        {t`The use of any Third-Party Service may also be subject to additional terms and conditions, privacy policies, or other agreements between you, on the one hand, and the provider(s) of such Third-Party Service, on the other hand.`}
      </Paragraph>
      <Paragraph>
        {t`You are solely responsible for any and all risks, costs and charges associated with your use of any Third-Party Services.`}
      </Paragraph>
      <Paragraph>
        {t`We will not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any Third-Party Services.`}
      </Paragraph>
    </Section>

    <Section>
      <Title>{t`2.3 Risks`}</Title>
      <SubTitle>{t`2.3.1 Absence of Counterparty Risks`}</SubTitle>
      <Paragraph>
        {t`Users understand and acknowledge that the Curve Functionalities are neither operated nor controlled by the Company. Should Users interact with the Curve Functionalities, they understand and acknowledge that they are engaging directly with the Curve Functionalities and potentially with third parties. This means the Company is neither involved nor in any way responsible for the operation, running or functioning of the Curve Functionalities and/or any of the interactions, collaborations or factual relationships between Users and the technical component of the Curve Functionalities. The Company has neither access to nor any other possibility to control and/or influence the corresponding transactions, deposits and/or allocations made by the Users and the involved technical components supporting the Curve Functionalities.`}
      </Paragraph>
      <Paragraph>
        {t`In particular, the Company has not and will not enter into any legal or factual relationship with any User of the Website nor the Curve Functionalities in general. CONSEQUENTLY, COMPANY IS NOT LIABLE TO ANY USER FOR DAMAGES, INCLUDING ANY GENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE, IN CONNECTION WITH THE USE OR INABILITY TO USE THE CURVE FUNCTIONALITIES IN GENERAL.`}
      </Paragraph>
      <SubTitle>{t`2.3.2 Technical Risks`}</SubTitle>
      <Paragraph>
        {t`As the technological components supporting the Curve Functionalities are of experimental nature they may contain bugs, defects, or errors (including any bug, defect, or error relating to or resulting from the display, manipulation, processing, storage, transmission, or use of data) that may materially and adversely affect the use, functionality, or performance of the Curve Functionalities or any product or system containing or used in conjunction with the Curve Functionalities. Any tooling and analytics software/APIs are solely meant for informational, testing and debugging purposes. Users are advised to use and run their own tooling and analytics solutions for their productive environment.`}
      </Paragraph>
      <Paragraph>
        {t`THE CURVE FUNCTIONALITIES (INCL. TOOLING SOFTWARE AND ANALYTICS DATA) HAVE BEEN AND ARE BEING PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. CONSEQUENTLY, ANY INTERACTION WITH THE CURVE FUNCTIONALITIES MAY RESULT IN IRREVERSIBLE LOSS, WITHOUT ANY KIND OF CONSIDERATION.`}
      </Paragraph>
      <SubTitle>{t`2.3.3 Malicious Behavior Risks`}</SubTitle>
      <Paragraph>
        {t`The Website may be exposed to third-party infrastructure failures or cyberattacks including but not limited to SQL injection attacks, cross-site scripting (XSS), or clickjacking, denial-of-service (DoS) attacks, attacks at the DNS or DNS registrar level, or other unauthorized and/or malicious activities, that could result in the theft, loss, or unauthorized transfer of digital assets.`}
      </Paragraph>
      <Paragraph>
        {t`The Curve Functionalities may rely on smart contracts, which are self-executing pieces of code. Users acknowledge that, despite best efforts to enhance security, the smart contracts and technological components supporting the Curve Functionalities – including its blockchain infrastructure, smart contracts, wallets – may be vulnerable to cyberattacks. Malicious actors may exploit software vulnerabilities, attack consensus mechanisms, or compromise private keys to gain unauthorized access to digital assets. Risks include hacking attempts on the Curve Functionalities, the wallets, smart contract exploits, phishing attacks, malware infections, and other forms of cybercrime that could result in the theft, loss, or unauthorized transfer of digital assets. Since digital assets exist entirely in a technological environment, they are inherently exposed to evolving cyber threats, some of which may be undetectable or irreparable until after significant damage has occurred.`}
      </Paragraph>
      <SubTitle>{t`2.3.4 Legal and Regulatory Risks`}</SubTitle>
      <Paragraph>
        {t`Crypto-assets and blockchain-based technologies operate within a rapidly evolving regulatory landscape worldwide. Applicable laws and regulations vary significantly across jurisdictions and are subject to change at any time. Such regulatory developments may adversely affect the Curve Functionalities which may result in substantial or even total losses for the Users and could compel the Company to suspend, whether temporarily or permanently, access to the Website.`}
      </Paragraph>
      <Paragraph>
        {t`User is solely responsible for complying with applicable law when interacting with the Curve Functionalities whatsoever.`}
      </Paragraph>
      <SubTitle>{t`2.4 Fees`}</SubTitle>
      <Paragraph>{t`The Website is provided free of charge.`}</Paragraph>
    </Section>

    <Header>{t`3. Personal Data`}</Header>
    <Section>
      <Paragraph>
        {t`Please see our `}
        <RouterLink
          color="textSecondary"
          href={getInternalUrl(currentApp, network, PAGE_LEGAL)}
          onClick={(e) => pushSearchParams(e, { tab: 'privacy' })}
        >
          {t`Privacy Notice`}
        </RouterLink>

        {t` to understand how we collect, use and disclose your personal data.`}
      </Paragraph>
    </Section>

    <Header>{t`4. Intellectual Property Rights`}</Header>
    <Section>
      <Paragraph>
        {t`You accept that any and all rights (including copyrights, design rights and/or other intellectual property rights) of ours (in particular but not exclusively in the Company's trademark and the Company's logo) shall remain in our sole property. We do not assign any right, title and interest in any and all work results created or developed by us under these Terms.`}
      </Paragraph>
      <Paragraph>
        {t`Any and all rights related to the Website, including the official logos (as listed`}{' '}
        <Link
          color="textSecondary"
          href="https://curvefinance.notion.site/Brand-Assets-1a6599aae064802fba11ce6a9e642d74"
          target="_blank"
        >
          {t`here`}
        </Link>
        {t`) are held by us.`}
      </Paragraph>
      <Paragraph>
        {t`Any feedback users may provide to the Company may be used by the Company without restriction.`}
      </Paragraph>
    </Section>

    <Header>{t`5. Taxes`}</Header>
    <Section>
      <Paragraph>
        {t`You are solely responsible for all direct or indirect taxes, duties, charges, levies, contributions and withholdings or other fees of any kind payable under the laws of any relevant country, as well as all penalties, interest, surcharges and other costs related thereto, imposed on the sale, purchase, holding and transfer of digital assets via the Curve Smart Contracts and/or any other action or transaction related to the interaction with the Website.`}
      </Paragraph>
      <Paragraph>
        {t`We do not provide any tax advice to you and shall have no responsibility with the payment and/or collection of any taxes. You agree to indemnify and hold us harmless from and against any and all tax claims by any party.`}
      </Paragraph>
    </Section>

    <Header>{t`6. Limited Warranty`}</Header>
    <Section>
      <Paragraph>
        {t`The access and use of the Website is made at your own risk. You understand and agree that the Website is provided on an "as is" and "as available" basis and that the Company expressly disclaims all warranties or conditions of any kind, whether express, implied, statutory or otherwise.`}
      </Paragraph>
      <Paragraph>
        {t`Neither the Company nor any person associated with the Company makes any warranty or representation with respect to the completeness, security, reliability, quality, accuracy, or availability of the Website and the content (as outlined in section 2 above; `}
        <Bold>{t`"Content"`}</Bold>
        {t`). Without limiting the foregoing, neither the Foundation nor anyone associated with the Company represents or warrants that the Website, the Information, any Third Party Links or Third Party Services or any Curve Functionalities accessed via the Website will be accurate, reliable, error-free, or uninterrupted, that defects will be corrected, that our Website or the server that makes it available are free of viruses or other harmful components, or that the Website or any Curve Functionalities or other Content accessed via the Website will otherwise meet your needs or expectations.`}
      </Paragraph>
    </Section>

    <Header>{t`7. Limitation of Liability`}</Header>
    <Section>
      <Paragraph>
        {t`To the fullest extent permitted by law, in no event shall the Company, its affiliates, or their licensors, service providers, employees, agents, officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your visit, access, use, or inability to use the Website, including any direct, indirect, special, incidental, consequential, or punitive damages, including but not limited to, personal injury, pain and suffering, emotional distress, loss of revenue, loss of profits, loss of business or anticipated savings, loss of use, loss of goodwill, loss of data, and whether caused by tort (including negligence), breach of contract, or otherwise, even if foreseeable.`}
      </Paragraph>
      <Paragraph>
        {t`You further understand and agree that neither the Curve Functionalities nor any of its implementations and/or components are under the control of and/or operated by the Company and that the Company shall not be liable for any loss or injury resulting from any vulnerability or any type of malfunction or failure of the Curve Functionalities or any other issues resulting in loss or injury.`}
      </Paragraph>
      <Paragraph>
        {t`You further understand and agree that neither the Third Party Services, nor any of their elements are under the control of and/or operated by the Company and that the Company shall not be liable for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any Third-Party Services.`}
      </Paragraph>
    </Section>

    <Header>{t`8. Miscellaneous`}</Header>
    <Section>
      <Title>{t`8.1 Entire Agreement and Severability`}</Title>
      <Paragraph>
        {t`These Terms contain the entire agreement between you and us regarding the use of the Website and supersedes all understandings and agreements whether written or oral. If any provision of these Terms is invalid, illegal, or unenforceable in any jurisdiction, such invalidity, illegality, or unenforceability shall not affect any other provision of these Terms or invalidate or render unenforceable such provision in any other jurisdiction. Upon such determination that any provision is invalid, illegal, or unenforceable, these Terms shall be modified to effectuate the original intent of the parties as closely as possible.`}
      </Paragraph>
    </Section>

    <Section>
      <Title>{t`8.2 Governing Law and Jurisdiction`}</Title>
      <Paragraph>
        {t`These Terms shall be governed and construed in accordance with the substantive laws of Switzerland excluding the Swiss conflict of law rules. The application of the United Nations Convention on Contracts for the International Sale of Goods shall be excluded. Any dispute arising out of or in conjunction with these Terms shall be submitted to the exclusive jurisdiction of the ordinary courts of Zug, Switzerland.`}
      </Paragraph>
    </Section>

    <Section>
      <Title>{t`8.3 Class Action Waiver`}</Title>
      <Paragraph>
        {t`To the fullest extent permitted by applicable law, you waive your right to participate in a class action lawsuit or a class-wide arbitration against the Company, its affiliates or any individual or entity involved in the development and distribution of the Website.`}
      </Paragraph>
    </Section>

    <Section>
      <Title>{t`8.4 Contact`}</Title>
      <Paragraph>{t`Any questions related to these Terms can be sent to enquiries@curve.fi.`}</Paragraph>
    </Section>
  </>
)
