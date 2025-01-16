import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useEffect, useMemo, useRef } from 'react'
import { useOverlayTriggerState } from '@react-stately/overlays'
import { useButton } from '@react-aria/button'

import { curveProps } from '@/dex/lib/utils'
import useStore from '@/dex/store/useStore'

import DeploySidechain from '@/dex/components/PageDeployGauge/DeploySidechain'
import DeployMainnet from '@/dex/components/PageDeployGauge/DeployMainnet'
import ProcessSummary from '@/dex/components/PageDeployGauge/ProcessSummary'
import DeployGaugeButton from '@/dex/components/PageDeployGauge/components/DeployGaugeButton'

import Box, { BoxHeader } from '@/ui/Box'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import Switch from '@/ui/Switch/Switch'
import IconButton from '@/ui/IconButton'
import Icon from '@/ui/Icon/Icon'
import ModalDialog from '@/ui/Dialog/ModalDialog'

type Props = {
  curve: CurveApi
}

const DeployGauge = ({ curve }: Props) => {
  const networks = useStore((state) => state.networks.networks)
  const { chainId } = curveProps(curve, networks) as { chainId: ChainId; haveSigner: boolean }
  const isLite = networks[chainId]?.isLite ?? false

  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const {
    curveNetworks,
    setCurveNetworks,
    sidechainGauge,
    setSidechainGauge,
    poolAddress,
    lpTokenAddress,
    currentSidechain,
    currentPoolType,
    sidechainNav,
    setSidechainNav,
    deploymentStatus,
  } = useStore((state) => state.deployGauge)

  const overlayTriggerState = useOverlayTriggerState({})
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const { buttonProps: openButtonProps } = useButton({ onPressEnd: () => overlayTriggerState.open() }, openButtonRef)

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
              <DeployGaugeButton disabled={!validateDeployButton} chainId={chainId} curve={curve} />
            </ButtonWrapper>
          </>
        ) : isLoadingApi || curveNetworks[chainId] !== undefined ? (
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
  @media (min-width: 25rem) {
    width: inherit;
    min-width: var(--transfer-min-width);
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
  :hover {
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

export default DeployGauge
