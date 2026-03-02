import { styled } from 'styled-components'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { ExternalLink } from '@ui/Link'
import { t } from '@ui-kit/lib/i18n'

export const InfoBox = () => (
  <StyledAlertBox alertType="info">
    <Box flex flexColumn>
      <InfoText>
        {t`
          The address that deploys a gauge is set as the gauge manager.
        `}
      </InfoText>
      <InfoText>
        {t`
          Only the gauge manager can set reward tokens and set reward tokens distributor address.
        `}
      </InfoText>
      <StyledExternalLink
        $noStyles
        href="https://docs.curve.finance/protocol/gauge/guides/adding-permissionless-rewards"
      >
        {t`Learn more`}
      </StyledExternalLink>
    </Box>
  </StyledAlertBox>
)

const StyledAlertBox = styled(AlertBox)`
  display: flex;
  flex-direction: row;
  max-width: 20rem;
  margin: var(--spacing-2) auto 0;
`

const InfoText = styled.p`
  font-size: var(--font-size-2);
  margin-bottom: var(--spacing-2);
`

const StyledExternalLink = styled(ExternalLink)`
  color: var(--white);
  &:hover {
    text-decoration: none;
  }
`
