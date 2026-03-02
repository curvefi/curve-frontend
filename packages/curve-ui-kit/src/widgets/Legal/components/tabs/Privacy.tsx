import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { List } from '../general/List'
import { Section, Header, Title, Paragraph, Bold } from '../general/Section'

export const Privacy = () => (
  <>
    <Header>{t`Privacy Notice`}</Header>
    <Section>
      <Paragraph>
        {t`This privacy notice (`}
        <Bold>{t`"Privacy Notice"`}</Bold>
        {t`) explains the basis for our collection of personal data when you use our websites `}
        <Link color="textSecondary" href="https://www.curve.finance" target="_blank">
          https://www.curve.finance
        </Link>
        {t`, `}
        <Link color="textSecondary" href="https://classic.curve.finance" target="_blank">
          https://classic.curve.finance
        </Link>
        {t`, `}
        <Link color="textSecondary" href="https://news.curve.finance/" target="_blank">
          https://news.curve.finance/
        </Link>
        {t`, `}
        <Link color="textSecondary" href="https://docs.curve.finance/" target="_blank">
          https://docs.curve.finance/
        </Link>
        {t`, `}
        <Link color="textSecondary" href="https://docs.curve.finance/" target="_blank">
          https://docs.curve.finance/
        </Link>
        {t` and `}
        <Link color="textSecondary" href="https://gov.curve.finance/" target="_blank">
          https://gov.curve.finance/
        </Link>
        {t` (together `}
        <Bold>{t`"Websites"`}</Bold>
        {t`), when you use our services, when you communicate with us or when you otherwise deal with us, and sets out how we use your personal data, the conditions under which we disclose it to others and the measures we take to keep it secure. In addition, we may inform you about the processing of your personal data separately, for example in consent forms, terms and conditions, additional privacy notices, forms, and other notices. We use the word `}
        <Bold>{t`"data"`}</Bold>
        {t` here interchangeably with `}
        <Bold>{t`"personal data"`}</Bold>
        {t`.`}
      </Paragraph>
      <Paragraph>
        {t`If you provide information to us about you or any person other than yourself, you must ensure that the data is accurate and that these other people understand how their data will be used, that they have given their permission for you to disclose it to us and for you to allow us, and our service providers, to use it. You are welcome to provide them with a copy of this Privacy Notice.`}
      </Paragraph>
      <Paragraph>
        {t`This Privacy Notice is aligned with the Federal Data Protection Act (`}
        <Bold>{t`"FDPA"`}</Bold>
        {t`) and the EU General Data Protection Regulation (`}
        <Bold>{t`"GDPR"`}</Bold>
        {t`). However, the application of these laws depends on each individual case.`}
      </Paragraph>
    </Section>

    <Header>{t`1. Controller`}</Header>
    <Section>
      <Paragraph>
        {t`The responsible person for processing your data under this Privacy Notice (`}
        <Bold>{t`"Controller"`}</Bold>
        {t`) unless we tell you otherwise in an individual case is:`}
      </Paragraph>
      <Paragraph>
        <Bold>{t`Swiss Stake AG`}</Bold>
        <br />
        {t`Gartenstrasse 6`}
        <br />
        {t`6300 Zug`}
        <br />
        {t`Switzerland`}
      </Paragraph>
      <Paragraph>{t`You may contact us regarding data protection matters and to exercise your rights at enquiries@curve.fi.`}</Paragraph>
    </Section>

    <Header>{t`2. Data Collection and Purpose of Data Processing`}</Header>
    <Section>
      <Paragraph>{t`We process the following data about you for the purposes outlined below:`}</Paragraph>
      <Title>{t`2.1 Websites`}</Title>
      <Paragraph>{t`When you visit our Websites, we collect data that is necessary for the functionality and security of our Websites.`}</Paragraph>
      <Paragraph>
        {t`The data collected includes: IP address; information about the operating system of your end device; cookies; referrer URL; amount of data transferred; date, region, and time of the server request; websites accessed or from which access is made; browser type and version; name of your Internet provider; protocols; etc.`}
      </Paragraph>
    </Section>

    <Section>
      <Title>{t`2.2 User Account`}</Title>
      <Paragraph>
        {t`Some of our services (especially on https://news.curve.finance/ and https://gov.curve.finance/) can only be used with a user account. We process the data collected in this context in order to provide our services and to ensure their functionality and security.`}
      </Paragraph>
      <Paragraph>
        {t`The data collected includes: name; first name; username; email address; password; information regarding your consent to the Terms of Service; your acknowledgement of this Privacy Notice; etc.`}
      </Paragraph>
    </Section>

    <Section>
      <Title>{t`2.3 Services`}</Title>
      <Paragraph>{t`We process your data in order to conclude, execute and manage a contract with you and to provide our services to you.`}</Paragraph>
      <Paragraph>
        {t`The data collected includes: contact details and other information provide by you; information when using our services; information regarding a possible contract conclusion and about the contract conclusion (e.g. services used and provided to you etc.); information about the execution and administration of the contracts; information on complaints; etc.`}
      </Paragraph>
    </Section>

    <Section>
      <Title>{t`2.4 Marketing and Innovation`}</Title>
      <Paragraph>
        {t`We process your data for marketing and business activities in relation to Curve, in particular to further develop the Websites and other platforms on which we operate. In addition, we and selected third parties may use your data to show you personalised content or advertising if and to the extent that you give us your consent, provided this is required by applicable law. You can object to such marketing activities or withdraw your consent at any time (see also Section 10 below).`}
      </Paragraph>
      <Paragraph>{t`All of the above data may be used for this purpose.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`2.5 Communication`}</Title>
      <Paragraph>
        {t`When you contact us by email, telephone, letter, or other means of communication, we collect the data exchanged between you and us for the purposes of communicating with you and providing our services to you, in particular to respond to your enquiries. By providing us with this data, you acknowledge that we use your data in accordance with this Privacy Notice.`}
      </Paragraph>
      <Paragraph>{t`The data collected includes: contact details; type, manner, place and time of communication; content of communication; etc.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`2.6 Newsletter`}</Title>
      <Paragraph>
        {t`If you subscribe to our newsletter, we process the information provided by you (e.g. contact details) in order to provide you with our newsletter. You can unsubscribe from our newsletter at any time by using the option to unsubscribe contained in the newsletter or by sending us an email to the address mentioned above.`}
      </Paragraph>
      <Paragraph>{t`The data collected includes: email address.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`2.7 Safety or Security Reasons`}</Title>
      <Paragraph>
        {t`We process your data to protect our IT and other infrastructure. For example, we process data for monitoring, analysis and testing of our networks and IT infrastructures including access controls.`}
      </Paragraph>
      <Paragraph>{t`All of the above data may be used for this purpose.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`2.8 Compliance with Law and Legal Procedures`}</Title>
      <Paragraph>
        {t`We process your data to comply with legal requirements (e.g. to combat money laundering and terrorist financing (KYC), to fulfil tax obligations, etc.), and we might have to request further information from you to comply with such requirements or as otherwise required by law and legal authorities. Furthermore, we may process your data for the enforcement of legal claims and for the defence in legal disputes and official proceedings.`}
      </Paragraph>
      <Paragraph>{t`All of the above data may be used for this purpose.`}</Paragraph>
    </Section>

    <Section>
      <Title>{t`2.9 Risk Management, Corporate Governance and Business Development`}</Title>
      <Paragraph>
        {t`We process your data as part of our risk management and corporate government in order to protect us from criminal or abusive activity. As part of our business development, we might sell businesses, parts of businesses or companies to others or acquire them from others or enter into partnerships and this might result in the exchange and processing of data based on your consent, if necessary.`}
      </Paragraph>
      <Paragraph>{t`All of the above data may be used for this purpose.`}</Paragraph>
    </Section>

    {/* <Section>
      <Title>{t`2.10 Cookies`}</Title>
      <Paragraph>
        {t`Our Websites use cookies, and we may also allow certain third parties to do so (see also Section 2.11 below). Cookies are text files that are stored on your device (computer, laptop, smartphone, etc.) and that are necessary for the use of the Websites as such or certain functions or that enable the analysis of the use of our Websites.`}
      </Paragraph>
      <Paragraph>
        {t`Depending on the purpose of these cookies, we may ask for your express prior consent before cookies are used. You can access your current settings by clicking on the "[Change Your Cookies]" button at our Websites and withdraw your consent under the same link at any time.`}
      </Paragraph>
      <Paragraph>
        {t`When you use our Websites, you can also set your browser to block or deceive certain types of cookies or alternative technologies, or to delete existing cookies. You can also add software to your browser that blocks certain third-party tracking. You can find more information on the help pages of your browser (usually with the keyword "Privacy") or on the websites of the third parties set out in our consent management tool.`}
      </Paragraph>
    </Section> */}

    <Section>
      <Title>{t`2.10 Tools`}</Title>
      <Paragraph>{t`We use the following tool(s) to ensure a tailored design and the continuous optimization of our Websites:`}</Paragraph>
      <Paragraph>
        <List type="disc">
          <Typography component="li" variant="bodyMRegular">
            <Bold>{t`Integration of YouTube Videos:`}</Bold>
            <br />

            {t`We integrate videos into our Websites that are stored on https://www.youtube.com/ and can be played directly from our Websites. These are all integrated in "extended data protection mode", i.e. no data about you as a user is transmitted to YouTube provided that you do not play the videos, however, if you play the videos, the data mentioned below is transferred. We have no influence on this data transfer. The legal basis for the display of the videos is your consent, i.e. the transfer only takes place after your consent.`}
            <br />

            {t`By visiting the website, YouTube receives the information that you have called up the corresponding subpage of our Websites. In addition, the above-mentioned basic data (such as IP-address and timestamp) are transmitted. This occurs regardless of whether YouTube provides a user account through which you are logged in or whether there is no user account. If you are logged in to Google, your data will be directly assigned to your account. If you do not want the assignment with your profile at YouTube, you must log out before activating the button. YouTube stores your data as user profiles and uses them for its own purposes, such as advertising, market research and/or needs-based design of its website. Such an evaluation is carried out in particular (even for users who are not logged in) to provide needs-based advertising and to inform other users of the social network about your activities on our Websites. You have the right to object to the creation of these user profiles. You must contact YouTube to exercise this right.`}
            <br />
            {t`The information collected is stored on Google servers, around the world including servers in the US. For these cases, the provider complies, according to its own information, with the EU-U.S. and Swiss-U.S. Data Privacy Frameworks and the UK Extension to the EU-U.S. Data Privacy Framework and/or relies on Standard Contractual Clauses (SCCs) for providing appropriate data protection safeguards. For more information, please refer to Google's privacy policy: `}
            <Link color="textSecondary" href="https://policies.google.com/privacy?hl=en" target="_blank">
              {t`Privacy Policy – Privacy & Terms – Google`}
            </Link>
            {t`.`}
          </Typography>
          <Typography component="li" variant="bodyMRegular">
            <Bold>{t`Integration of Twitter/X Posts:`}</Bold>
            <br />
            {t`We use Twitter/X services on our Websites. This allows us to display Twitter/X posts directly on our site. The service provider is X Internet Unlimited Company (based in Ireland), which relies on X Corp. (based in the USA) as its data processor (together referred to as `}
            <Bold>{t`"X"`}</Bold>
            {t`).`}
            <br />
            {t`When you click on Twitter/X posts, X receives the information that you have accessed the corresponding subpage of our Websites. In addition, the basic data mentioned above (such as your IP address and a timestamp) is transmitted. X stores your data as user profiles and uses it for advertising, market research, and/or to tailor its website to user needs. Such analysis is carried out in particular to deliver personalized advertising and to inform other users of the social network about your activity on our Websites. You have the right to object to the creation of these user profiles; to exercise this right, you must contact X directly.`}
            <br />
            {t`The information collected is stored on X's servers, including those in the United States, a country that, from the perspective of Switzerland and the EU, does not offer an adequate level of data protection. In such cases, X participates in the EU-U.S. Data Privacy Framework, the Swiss-U.S. Data Privacy Framework and the UK Extension to the EU-U.S. Data Privacy Framework and/or enters into so-called Standard Contractual Clauses with its customers to ensure an adequate level of data protection.`}
            <br />
            {t`For more information, please refer to X's privacy policy: `}
            <Link color="textSecondary" href="https://x.com/en/privacy" target="_blank">
              {t`X Privacy Policy`}
            </Link>
            {t`.`}
          </Typography>
        </List>
      </Paragraph>
    </Section>

    <Section>
      <Title>{t`2.11 Third-Party Offerings`}</Title>
      <Paragraph>
        {t`Our Websites may contain third-party offerings. Please note that when you use such link, your data such as IP address, personal browser settings, etc., are transmitted to these third parties. We have no control over, do not review and cannot be responsible for these third-party websites or their content. Please be aware that the terms of this Privacy Notice do not apply to these third-party websites or their content, or to any collection of your data after you click on links to such third-party websites. We encourage you to read the privacy notices of every website you visit. Any links to third-party websites or locations are for your convenience and do not signify our endorsement of such third parties or their products, content, or websites.`}
      </Paragraph>
    </Section>

    <Section>
      <Title>{t`2.12 Plug-Ins`}</Title>
      <Paragraph>
        {t`We do not use plug-ins on our Websites. If our Websites contains icons from other third-party providers (e.g. Twitter/X, Discord, YouTube, Telegram, Github, Dune), we only use theses for passive linking to the pages of the respective providers.`}
      </Paragraph>
    </Section>

    <Section>
      <Title>{t`2.13 Third-Party Platforms`}</Title>
      <Paragraph>
        {t`We operate accounts on third-party platforms (e.g. Twitter/X, Discord, YouTube, Telegram, Github, Dune, Google Colab). If you communicate with us via our accounts or otherwise interact with our accounts on these third-party platforms, your data will also be processed according to the privacy notices of the respective platform. Please find further information on the purpose and scope of data collection and processing by the third-party providers in their respective privacy notices.`}
      </Paragraph>
    </Section>

    <Header>{t`3. Legal Basis for Data Processing`}</Header>
    <Section>
      <Paragraph>
        {t`Insofar as we have asked for your consent, we process your data on the basis of this consent. You can withdraw your consent at any time with effect for the future by sending us a written notification (email to: enquiries@curve.fi). The withdrawal of your consent affects neither the legality of the processing that we carried out before your withdrawal nor the processing of your data on the basis of other processing grounds.`}
      </Paragraph>
      <Paragraph>
        {t`If we do not need your consent, we will not obtain it and we will process your data for other reasons, such as the initiation/execution of a contract or a business relationship with you, a legal obligation, a vital interest of the data subject or another natural person, or to perform a public task. We may also process your personal data if we have a legitimate interest in doing so, which includes, for example, complying with applicable law and marketing our products and services, the interest in better understanding our markets and in safely and efficiently managing and developing our company, including its activities.`}
      </Paragraph>
    </Section>

    <Header>{t`4. Transfer of Data to Third Parties`}</Header>
    <Section>
      <Paragraph>{t`As part of our data processing, we may share your data with third parties, in particular to the following categories of recipients:`}</Paragraph>
      <Paragraph>
        <List type="disc">
          <Typography component="li" variant="bodyMRegular">
            <Bold>{t`Service Providers`}</Bold>
            <br />
            {t`We may share your information with service providers and business partners around the world with whom we collaborate to fulfil the above purposes (e.g. IT provider; advertising service provider; security companies; banks; telecommunication companies; credit information agencies; address verification provider; lawyers; etc.) or who we engage to process data for any of the purposes listed above on our behalf and in accordance with our instructions only.`}
          </Typography>
          <Typography component="li" variant="bodyMRegular">
            <Bold>{t`Contractual Partners`}</Bold>
            <br />
            {t`If required by the respective contract, we will pass on your data to other contractual partners, dealers, subcontractors, etc.`}
          </Typography>
          <Typography component="li" variant="bodyMRegular">
            <Bold>{t`Legal Authorities`}</Bold>
            <br />
            {t`We may pass on data to offices, courts, and other authorities if we are legally obliged or entitled to do so or if this appears necessary to protect our interests. The authorities are responsible for processing data about you that they receive from us.`}
          </Typography>
        </List>
      </Paragraph>
    </Section>

    <Header>{t`5. Disclosure of Data Abroad`}</Header>
    <Section>
      <Paragraph>
        {t`The data that we collect from you may be transferred to, processed, and stored in, a country outside the European Economic Area (EEA) or Switzerland. In view of the EEA or Switzerland the law in some of those countries may not offer an adequate level of data protection. We only transfer data to these countries when it is necessary for the performance of a contract or for the exercise or defence of legal claims, or if such transfer is based on your explicit consent or subject to safeguards that assure the protection of your data, such as the EU-US Data Privacy Framework, the Swiss-US Data Privacy Framework and/or the Standard Contractual Clauses approved by the European Commission (SCCs), adjusted according to Swiss law, all of the aforementioned if applicable and required.`}
      </Paragraph>
    </Section>

    <Header>{t`6. Profiling and Automated Decision Taking`}</Header>
    <Section>
      <Paragraph>
        {t`We might analyse aspects of your individual's personality, behaviour, interest and habits make predictions or decisions about them for the purposes laid out in Section IV, e.g. to perform statistical analysis or to prevent misuse and security risks. This analysis identifies correlations between different behaviours and characteristics to create profiles for individuals. For example, we may use profiling to determine in which products or services you might be interested. We may also use profiling to assess your creditworthiness. We do not use profiling that can produce legal effects concerning you or similarly significantly affect you without human review.`}
      </Paragraph>
      <Paragraph>
        {t`In certain circumstances, automated decision taking might be necessary for reasons of efficiency and consistency. In such cases, we will inform you accordingly and take the measures required by applicable law.`}
      </Paragraph>
    </Section>

    <Header>{t`7. On-Chain Data`}</Header>
    <Section>
      <Paragraph>
        {t`When you use blockchains, you acknowledge that your wallet address and other data/information provided by your transactions, which are considered personal data if relating to an identified or identifiable natural person, are permanently and publicly stored on-chain, which means such data is publicly available to anyone. Neither we, nor any third party, has any power to delete such data published by its users to the blockchain. If you want to ensure that your privacy rights are not affected in any way, you should not transact on blockchains as certain rights may not be available or exercisable by you or us due to the technological infrastructure of the blockchain.`}
      </Paragraph>
      <Paragraph>{t`Please also note that we do not have access to the third-party wallet connected to our Websites.`}</Paragraph>
      <Paragraph>{t`You hereby release and indemnify us of any liability associated with data that you transferred to the blockchain.`}</Paragraph>
    </Section>

    <Header>{t`8. Retention and Storage of Data`}</Header>
    <Section>
      <Paragraph>
        {t`We only process your data for as long as necessary to fulfil the purposes we collected it for, including for the purposes of complying with legal retention requirements and where required to assert or defend against legal claims, until the end of the relevant retention period or until the claims in question have been settled. Upon expiry of the applicable retention period, we will securely destroy your data in accordance with applicable laws and regulations.`}
      </Paragraph>
    </Section>

    <Header>{t`9. Data Security`}</Header>
    <Section>
      <Paragraph>
        {t`We take appropriate organizational and technical security measures to prevent your data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. However, we and your data can still become victims of cyber-attacks, cybercrime, brute force, hacker attacks and further fraudulent and malicious activity including but not limited to viruses, forgeries, malfunctions, and interruptions which is out of our control and responsibility. We have also put in place procedures to deal with any suspected data breach and will notify you and any applicable regulator of a breach where we are legally required to do so.`}
      </Paragraph>
    </Section>

    <Header>{t`10. Your Rights`}</Header>
    <Section>
      <Paragraph>
        {t`In connection with our processing of your data, you have various rights under applicable data protection law: the right to `}
        <Bold>{t`information`}</Bold>
        {t` about how we process which personal data about you, the right to `}
        <Bold>{t`rectification`}</Bold>
        {t`, the right to `}
        <Bold>{t`erasure`}</Bold>
        {t`, the right to `}
        <Bold>{t`restriction`}</Bold>
        {t` of processing, the right to `}
        <Bold>{t`data portability`}</Bold>
        {t`, the right to `}
        <Bold>{t`withdrawal`}</Bold>
        {t` of a previously given consent, the right to file a `}
        <Bold>{t`complaint`}</Bold>
        {t` with the competent data protection authority if you believe that we are not processing your personal data in accordance with data protection requirements, and the right to `}
        <Bold>{t`object`}</Bold>
        {t` to a particular processing. However, we ask that you please contact us first if you believe that we are not processing your personal data in accordance with your wishes, so that we can address your concerns and implement appropriate changes.`}
      </Paragraph>
      <Paragraph>
        {t`Please note that we reserve the right to enforce legal restrictions, if necessary, e.g. if we are obliged to store or process certain data, have an overriding interest (insofar as we can invoke such interests) or need the data to assert claims. If the exercise of certain rights involves costs for you, we will inform you in advance. We have already referred to the possibility of withdrawing consent in Section 3 above. It is important to note that exercising these rights may conflict with your contractual obligations and could result in consequences such as early termination of the contract or associated costs. Should this occur, we will inform you in advance, unless this has already been contractually agreed.`}
      </Paragraph>
      <Paragraph>
        {t`If you wish to exercise the rights mentioned above, please contact us at enquiries@curve.fi or at the contact details provided in Section 1, unless otherwise indicated or agreed. Please note that we may need to verify your identity in order to prevent misuse, e.g. by means of a copy of your ID card or passport, unless identification is otherwise possible.`}
      </Paragraph>
      <Paragraph>
        {t`In addition, every data subject has the opportunity to assert their rights in court or to file a complaint with the relevant data protection authority. In Switzerland, the relevant data protection authority is the Federal Data Protection and Information Commissioner (`}
        <Link color="textSecondary" href="http://www.edoeb.admin.ch" target="_blank">
          {t`http://www.edoeb.admin.ch`}
        </Link>
        {t`).`}
      </Paragraph>
    </Section>

    <Header>{t`Amendment of this Privacy Notice`}</Header>
    <Section>
      <Paragraph>
        {t`Due to continuous development of our Websites and the contents thereof, changes in law or regulatory requirements, we might need to change this Privacy Notice from time to time. Our current Privacy Notice can be found on our Websites.`}
      </Paragraph>
    </Section>
  </>
)
