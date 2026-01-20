import { useEffect, useMemo, useRef } from 'react'
import { styled } from 'styled-components'
import { DeployGaugeButton } from '@/dex/components/PageDeployGauge/components/DeployGaugeButton'
import { DeployMainnet } from '@/dex/components/PageDeployGauge/DeployMainnet'
import { DeploySidechain } from '@/dex/components/PageDeployGauge/DeploySidechain'
import { ProcessSummary } from '@/dex/components/PageDeployGauge/ProcessSummary'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useChainId } from '@/dex/hooks/useChainId'
import { useStore } from '@/dex/store/useStore'
import { type NetworkUrlParams } from '@/dex/types/main.types'
import { useButton } from '@react-aria/button'
import { useOverlayTriggerState } from '@react-stately/overlays'
import { BoxHeader, Box } from '@ui/Box'
import { ModalDialog } from '@ui/Dialog/ModalDialog'
import { Icon } from '@ui/Icon/Icon'
import { IconButton } from '@ui/IconButton'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { Switch } from '@ui/Switch/Switch'
import { isLoading, useCurve } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

export const DeployGauge = (props: NetworkUrlParams) => {
  const { curveApi = null, connectState } = useCurve()
  const chainId = useChainId(props.network)
  const {
    data: { isLite = false },
  } = useNetworkByChain({ chainId })

  const curveNetworks = useStore((state) => state.deployGauge.curveNetworks)
  const setCurveNetworks = useStore((state) => state.deployGauge.setCurveNetworks)
  const sidechainGauge = useStore((state) => state.deployGauge.sidechainGauge)
  const setSidechainGauge = useStore((state) => state.deployGauge.setSidechainGauge)
  const poolAddress = useStore((state) => state.deployGauge.poolAddress)
  const lpTokenAddress = useStore((state) => state.deployGauge.lpTokenAddress)
  const currentSidechain = useStore((state) => state.deployGauge.currentSidechain)
  const currentPoolType = useStore((state) => state.deployGauge.currentPoolType)
  const sidechainNav = useStore((state) => state.deployGauge.sidechainNav)
  const setSidechainNav = useStore((state) => state.deployGauge.setSidechainNav)
  const deploymentStatus = useStore((state) => state.deployGauge.deploymentStatus)

  const overlayTriggerState = useOverlayTriggerState({})
  const openButtonRef = useRef<HTMLButtonElement>(null)
  useButton({ onPressEnd: () => overlayTriggerState.open() }, openButtonRef)

  const validateDeployButton = useMemo(() => {
    // validate sidechain gauge deployment
    if (sidechainGauge && deploymentStatus.sidechain.status !== 'SUCCESS' && sidechainNav === 0) {
      return lpTokenAddress.length === 42 && currentPoolType !== null && chainId !== 1
    }
    // validate sidechain mirror gauge deployment
    if (sidechainGauge && deploymentStatus.mirror.status !== 'SUCCESS' && sidechainNav === 1) {
      return lpTokenAddress.length === 42 && currentSidechain !== null && currentPoolType !== null && chainId === 1
    }

    // validate mainnet gauge deployment
    return poolAddress.length === 42 && currentPoolType !== null
  }, [
    chainId,
    currentPoolType,
    currentSidechain,
    deploymentStatus.mirror.status,
    deploymentStatus.sidechain.status,
    lpTokenAddress.length,
    poolAddress.length,
    sidechainGauge,
    sidechainNav,
  ])

  useEffect(() => {
    setCurveNetworks()
  }, [setCurveNetworks])

  return (
    <Wrapper flex>
      <Container variant="primary" shadowed flex flexColumn>
        <StyledBoxHeader className="title-text">
          {sidechainGauge ? t`Deploy Sidechain Gauge` : t`Deploy Mainnet Gauge`}
          {!isLite && (
            <Switch
              isSelected={sidechainGauge}
              onChange={setSidechainGauge}
              aria-label={t`Toggle between mainnet and sidechain gauge deployment`}
            />
          )}
        </StyledBoxHeader>
        {chainId && Object.keys(curveNetworks).length !== 0 ? (
          <>
            {sidechainGauge && !isLite && (
              <NavBox flex flexJustifyContent="space-between" flexAlignItems="center">
                {sidechainNav === 0 ? (
                  <>
                    <Box flex flexAlignItems="center">
                      <NavTitle>{t`Step 1`}</NavTitle>
                      <InfoButton size="small" onClick={() => overlayTriggerState.open()} ref={openButtonRef}>
                        <Icon name={'InformationSquare'} size={16} />
                      </InfoButton>
                    </Box>
                    <StyledIconButton size="small" onClick={() => setSidechainNav(1)}>
                      <Icon name={'ChevronRight'} size={16} />
                    </StyledIconButton>
                  </>
                ) : (
                  <>
                    <Box flex flexAlignItems="center">
                      <NavTitle>{t`Step 2`}</NavTitle>
                      <InfoButton size="small" onClick={() => overlayTriggerState.open()} ref={openButtonRef}>
                        <Icon name={'InformationSquare'} size={16} />
                      </InfoButton>
                    </Box>
                    <StyledIconButton size="small" onClick={() => setSidechainNav(0)}>
                      <Icon name={'ChevronLeft'} size={16} />
                    </StyledIconButton>
                  </>
                )}
              </NavBox>
            )}
            <Content flex flexColumn>
              {!sidechainGauge && <DeployMainnet chainId={chainId} />}
              {sidechainGauge && <DeploySidechain chainId={chainId} />}
            </Content>
            <ButtonWrapper>
              <DeployGaugeButton
                disabled={!validateDeployButton}
                chainId={chainId}
                curve={curveApi}
                pageLoaded={!isLoading(connectState)}
              />
            </ButtonWrapper>
          </>
        ) : isLoading(connectState) || curveNetworks[chainId] !== undefined ? (
          <SpinnerWrapper>
            <Spinner />
          </SpinnerWrapper>
        ) : (
          <NetworkNotSupportedMessage>{t`Gauge deployment is not supported on this network.`}</NetworkNotSupportedMessage>
        )}
      </Container>
      {chainId && sidechainGauge && curveNetworks[chainId] !== undefined && (
        <>
          {overlayTriggerState.isOpen && (
            <ModalDialog
              title={'Steps'}
              isOpen
              isDismissable
              onClose={() => overlayTriggerState.close()}
              maxWidth="19.875rem"
              noContentPadding
              state={overlayTriggerState}
            >
              <ProcessSummary chainId={chainId} isLite={isLite} />
            </ModalDialog>
          )}
          <ProcessSummaryWrapper>
            <ProcessSummary chainId={chainId} isLite={isLite} />
          </ProcessSummaryWrapper>
        </>
      )}
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  margin-bottom: auto;
  @media (min-width: 25rem) {
    justify-content: center;
    margin: var(--spacing-4) auto;
  }
  @media (min-width: 28.125rem) {
    margin: var(--spacing-5) var(--spacing-3);
  }
`

const ProcessSummaryWrapper = styled.div`
  display: none;
  @media (min-width: 39.375rem) {
    display: flex;
  }
`

const Container = styled(Box)`
  width: 100%;
  background-color: var(--box--primary--content--background-color);
  margin-bottom: auto;
  @media (min-width: 28rem) {
    width: inherit;
    min-width: 23.3125rem;
  }
  @media (min-width: 39.375rem) {
    margin-right: var(--spacing-3);
    max-width: 23.3125rem;
  }
`

const StyledBoxHeader = styled(BoxHeader)`
  padding-left: var(--spacing-3);
  padding-right: var(--spacing-2);
  background-color: var(--box_header--primary--background-color);
`

const NavBox = styled(Box)`
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--box--primary--background);
`

const NavTitle = styled.h5`
  opacity: 1;
`

const Content = styled(Box)`
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-4) var(--spacing-3);
  background-color: var(--box--primary--content--background-color);
  height: 100%;
`

const ButtonWrapper = styled(Box)`
  background-color: var(--box--primary--background);
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-3);
  margin-top: auto;
`

const StyledIconButton = styled(IconButton)`
  align-items: center;
  display: inline-flex;

  color: var(--box--primary--color);
  background-color: transparent;
  border: 1px solid transparent;
  font-weight: var(--bold);
  opacity: 1;
  &:hover {
    color: var(--button_icon--hover--color);
    background-color: var(--button_icon--hover--background-color);
  }
`

const InfoButton = styled(StyledIconButton)`
  display: flex;
  @media (min-width: 39.375rem) {
    display: none;
  }
`

const NetworkNotSupportedMessage = styled.p`
  font-size: var(--font-size-2);
  padding: var(--spacing-4) var(--spacing-3);
  margin: auto;
  max-width: 17.5rem;
  text-align: center;
`
