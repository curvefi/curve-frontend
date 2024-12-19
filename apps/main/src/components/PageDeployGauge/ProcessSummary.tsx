import styled from 'styled-components'
import { t } from '@lingui/macro'
import useStore from '@/store/useStore'
import { shortenTokenAddress } from '@/utils'
import { useNavigate } from 'react-router-dom'
import ExternalLink from '@/ui/Link/ExternalLink'
import Icon from '@/ui/Icon'
import Box from '@/ui/Box'
import InternalLinkButton from '@/ui/InternalLinkButton'
import InfoBox from '@/components/PageDeployGauge/InfoBox'
import Spinner from '@/ui/Spinner'

type Props = {
  chainId: ChainId
  isLite: boolean
}

const ProcessSummary = ({ chainId, isLite }: Props) => {
  const { deploymentStatus, linkPoolAddress, currentSidechain } = useStore((state) => state.deployGauge)
  const networks = useStore((state) => state.networks.networks)

  const navigate = useNavigate()
  const sidechain: ChainId = currentSidechain !== null ? currentSidechain : 1

  return (
    <Box flex flexColumn>
      {!isLite && (
        <Wrapper variant="secondary">
          <Content>
            <Step>
              <StepTitle>
                <p>{t`Step 1:`}</p>
              </StepTitle>
              {(deploymentStatus.sidechain.status === '' ||
                deploymentStatus.sidechain.status === 'CONFIRMING' ||
                deploymentStatus.sidechain.status === 'ERROR') && <StepText>{t`Deploy gauge on sidechain`}</StepText>}
              {deploymentStatus.sidechain.status === 'LOADING' && (
                <Box flex flexAlignItems="center">
                  <StyledSpinner size={14} />
                  <StepText>{t`Deploying sidechain gauge...`}</StepText>
                </Box>
              )}
              {deploymentStatus.sidechain.status === 'SUCCESS' && deploymentStatus.sidechain.transaction && (
                <SuccessfulTransactionInfo>
                  <Box flex flexAlignItems="center">
                    <StyledCheckmark name={'CheckmarkFilled'} size={16} aria-label={t`Checkmark filled`} />
                    <SuccessMessage>{t`Sidechain gauge successfully deployed`}</SuccessMessage>
                  </Box>
                  <Transaction
                    variant={'contained'}
                    href={networks[sidechain].scanTxPath(deploymentStatus.sidechain.transaction.hash)}
                  >
                    <p>{t`Transaction:`}</p>
                    {shortenTokenAddress(deploymentStatus.sidechain.transaction.hash)}
                    <StyledIcon name={'Launch'} size={16} />
                  </Transaction>
                </SuccessfulTransactionInfo>
              )}
            </Step>
            <Step>
              <StepTitle>
                <p>{t`Step 2:`}</p>
              </StepTitle>
              {(deploymentStatus.mirror.status === '' ||
                deploymentStatus.mirror.status === 'CONFIRMING' ||
                deploymentStatus.mirror.status === 'ERROR') && (
                <StepText>{t`Deploy mirror gauge on Ethereum using the same sidechain LP token address`}</StepText>
              )}
              {deploymentStatus.mirror.status === 'LOADING' && (
                <Box flex flexAlignItems="center">
                  <StyledSpinner size={14} />
                  <StepText>{t`Deploying mirror gauge...`}</StepText>
                </Box>
              )}
              {deploymentStatus.mirror.status == 'SUCCESS' && deploymentStatus.mirror.transaction && (
                <SuccessfulTransactionInfo>
                  <Box flex flexAlignItems="center">
                    <StyledCheckmark name={'CheckmarkFilled'} size={16} aria-label={t`Checkmark filled`} />
                    <SuccessMessage>{t`Mirror gauge successfully deployed`}</SuccessMessage>
                  </Box>
                  <Transaction
                    variant={'contained'}
                    href={networks[chainId].scanTxPath(deploymentStatus.mirror.transaction.hash)}
                  >
                    <p>{t`Transaction:`}</p>
                    {shortenTokenAddress(deploymentStatus.mirror.transaction.hash)}
                    <StyledIcon name={'Launch'} size={16} />
                  </Transaction>
                </SuccessfulTransactionInfo>
              )}
            </Step>
            <Step>
              <Disclaimer>{t`Step 1 and Step 2 must be completed using the same wallet`}</Disclaimer>
            </Step>
            {deploymentStatus.mirror.status === 'SUCCESS' && linkPoolAddress !== '' && (
              <LinkContainer>
                <InternalLinkButton onClick={() => navigate(linkPoolAddress)} title={t`Visit the pool`} />
              </LinkContainer>
            )}
          </Content>
        </Wrapper>
      )}
      <InfoBox />
    </Box>
  )
}

const Wrapper = styled(Box)`
  max-width: 20rem;
  border: none;
  @media (max-width: 39.375rem) {
    width: 100%;
    max-width: 100%;
    background-color: var(--dialog--background-color);
  }
`

const Content = styled.div`
  padding: var(--spacing-2) var(--spacing-4) var(--spacing-4);
  @media (min-width: 39.375rem) {
    padding: var(--spacing-3) var(--spacing-3);
  }
  @media (min-width: 40.625rem) {
    padding: var(--spacing-3) var(--spacing-4);
  }
`

const Step = styled(Box)`
  margin-top: var(--spacing-3);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--box--primary--background);
  &:last-child {
    border-bottom: none;
  }
`

const StepTitle = styled.div`
  margin-bottom: var(--spacing-1);
  display: flex;
  align-items: center;
  p {
    font-size: var(--font-size-1);
    font-weight: var(--bold);
    opacity: 0.7;
  }
`

const StepText = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
`

const Disclaimer = styled.p`
  font-size: var(--font-size-1);
  font-style: italic;
`

const StyledCheckmark = styled(Icon)`
  color: var(--primary-400);
  margin-right: var(--spacing-1);
`

const SuccessMessage = styled.h5`
  margin-left: var(--spacing-1);
`

const Transaction = styled(ExternalLink)`
  display: flex;
  align-items: center;
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  color: var(--page--text-color);
  text-transform: none;
  text-decoration: none;
  margin-top: var(--spacing-3);
  background-color: var(--page--background-color);
  padding: var(--spacing-2);
  p {
    margin-right: auto;
    font-weight: var(--bold);
  }
`

const StyledIcon = styled(Icon)`
  margin: auto 0 auto var(--spacing-1);
`

const SuccessfulTransactionInfo = styled.div`
  margin-top: var(--spacing-3);
`

const LinkContainer = styled.div`
  margin: var(--spacing-3) 0;
  display: flex;
  justify-content: center;
`

const StyledSpinner = styled(Spinner)`
  margin-right: var(--spacing-1);
`

export default ProcessSummary
