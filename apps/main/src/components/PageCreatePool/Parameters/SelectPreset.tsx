import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useButton } from '@react-aria/button'
import { useOverlayTriggerState } from '@react-stately/overlays'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { getPath } from '@/utils/utilsRouter'

import { breakpoints } from '@/ui/utils/responsive'
import useStore from '@/store/useStore'

import { POOL_PRESETS, STABLESWAP, CRYPTOSWAP } from '@/components/PageCreatePool/constants'

import Box from '@/ui/Box'
import Button from '@/ui/Button'
import ModalDialog from '@/components/PageCreatePool/ConfirmModal/ModalDialog'
import SelectButton from '@/components/PageCreatePool/components/SelectButton'
import { ExternalLink } from '@/ui/Link'

type Props = {
  setStableFeeValue: React.Dispatch<React.SetStateAction<string>>
  setMidValue: React.Dispatch<React.SetStateAction<string>>
  setOutValue: React.Dispatch<React.SetStateAction<string>>
}

const SelectPreset = ({ setStableFeeValue, setMidValue, setOutValue }: Props) => {
  const { i18n } = useLingui()
  const swapType = useStore((state) => state.createPool.swapType)
  const poolPresetIndex = useStore((state) => state.createPool.poolPresetIndex)
  const updatePoolPresetIndex = useStore((state) => state.createPool.updatePoolPresetIndex)
  const tokenAmount = useStore((state) => state.createPool.tokensInPool.tokenAmount)

  const navigate = useNavigate()
  const params = useParams()

  const overlayTriggerState = useOverlayTriggerState({})
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const { buttonProps: openButtonProps } = useButton({ onPressEnd: () => overlayTriggerState.open() }, openButtonRef)

  const [isButtonDisabled, setIsButtonDisabled] = useState(true)

  // prevent modal button from being pressed when opened
  useEffect(() => {
    if (overlayTriggerState.isOpen) {
      setIsButtonDisabled(true)
      setTimeout(() => {
        setIsButtonDisabled(false)
      }, 10)
    }
  }, [overlayTriggerState.isOpen])

  return (
    <>
      <Box>
        <TitleRow flex flexAlignItems={'center'}>
          <SectionLabel>{t`Pool Parameters Presets`}</SectionLabel>
        </TitleRow>
      </Box>
      <PoolPresetButton {...openButtonProps} ref={openButtonRef} variant={'filled'} fillWidth>
        {poolPresetIndex !== null ? (
          <LabelTextWrapper>
            <SelectedLabelText>{POOL_PRESETS[poolPresetIndex].name}</SelectedLabelText>
          </LabelTextWrapper>
        ) : (
          <LabelTextWrapper>
            <PlaceholderSelectedLabelText>{t`Select preset`}</PlaceholderSelectedLabelText>
          </LabelTextWrapper>
        )}
      </PoolPresetButton>
      {overlayTriggerState.isOpen && (
        <StyledModalDialog
          title={t`Select preset`}
          isOpen
          isDismissable
          onClose={() => overlayTriggerState.close()}
          maxWidth="29rem"
          state={overlayTriggerState}
        >
          <SelectPresetWrapper clickDisabled={isButtonDisabled}>
            {swapType === STABLESWAP && (
              <>
                {' '}
                <SelectButtonWrapper>
                  <SelectButton
                    selected={poolPresetIndex === 0}
                    name={POOL_PRESETS[0].name}
                    descriptionName={i18n._(POOL_PRESETS[0].descriptionName)}
                    description={i18n._(POOL_PRESETS[0].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(0)
                      setStableFeeValue(i18n._(POOL_PRESETS[0].defaultParams.stableSwapFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
                <SelectButtonWrapper>
                  <SelectButton
                    selected={poolPresetIndex === 1}
                    name={POOL_PRESETS[1].name}
                    descriptionName={i18n._(POOL_PRESETS[1].descriptionName)}
                    description={i18n._(POOL_PRESETS[1].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(1)
                      setStableFeeValue(i18n._(POOL_PRESETS[1].defaultParams.stableSwapFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
              </>
            )}
            {swapType === CRYPTOSWAP && tokenAmount === 2 && (
              <>
                <SelectButtonWrapper>
                  <SelectButton
                    selected={poolPresetIndex === 2}
                    name={POOL_PRESETS[2].name}
                    descriptionName={i18n._(POOL_PRESETS[2].descriptionName)}
                    description={i18n._(POOL_PRESETS[2].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(2)
                      setMidValue(i18n._(POOL_PRESETS[2].defaultParams.midFee))
                      setOutValue(i18n._(POOL_PRESETS[2].defaultParams.outFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
                <SelectButtonWrapper>
                  <SelectButton
                    selected={poolPresetIndex === 3}
                    name={POOL_PRESETS[3].name}
                    descriptionName={i18n._(POOL_PRESETS[3].descriptionName)}
                    description={i18n._(POOL_PRESETS[3].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(3)
                      setMidValue(i18n._(POOL_PRESETS[3].defaultParams.midFee))
                      setOutValue(i18n._(POOL_PRESETS[3].defaultParams.outFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
                <SelectButtonWrapper>
                  <SelectButton
                    selected={poolPresetIndex === 4}
                    name={POOL_PRESETS[4].name}
                    descriptionName={i18n._(POOL_PRESETS[4].descriptionName)}
                    description={i18n._(POOL_PRESETS[4].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(4)
                      setMidValue(i18n._(POOL_PRESETS[4].defaultParams.midFee))
                      setOutValue(i18n._(POOL_PRESETS[4].defaultParams.outFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
                <SelectButtonWrapper>
                  <SelectButton
                    selected={poolPresetIndex === 5}
                    name={POOL_PRESETS[5].name}
                    descriptionName={i18n._(POOL_PRESETS[5].descriptionName)}
                    description={i18n._(POOL_PRESETS[5].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(5)
                      setMidValue(i18n._(POOL_PRESETS[5].defaultParams.midFee))
                      setOutValue(i18n._(POOL_PRESETS[5].defaultParams.outFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
              </>
            )}
            {swapType === CRYPTOSWAP && tokenAmount === 3 && (
              <>
                <SelectButtonWrapper>
                  <SelectButton
                    selected={poolPresetIndex === 6}
                    name={POOL_PRESETS[6].name}
                    descriptionName={i18n._(POOL_PRESETS[6].descriptionName)}
                    description={i18n._(POOL_PRESETS[6].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(6)
                      setMidValue(i18n._(POOL_PRESETS[6].defaultParams.midFee))
                      setOutValue(i18n._(POOL_PRESETS[6].defaultParams.outFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
                <SelectButtonWrapper>
                  <SelectButton
                    selected={poolPresetIndex === 7}
                    name={POOL_PRESETS[7].name}
                    descriptionName={i18n._(POOL_PRESETS[7].descriptionName)}
                    description={i18n._(POOL_PRESETS[7].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(7)
                      setMidValue(i18n._(POOL_PRESETS[7].defaultParams.midFee))
                      setOutValue(i18n._(POOL_PRESETS[7].defaultParams.outFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
              </>
            )}
            <PresetMessage>
              {t`Can't find the pool preset you want? Check out`}
              <StyledExternalLink
                onClick={() => window.open(`#${getPath(params, '/pools')}`)}
              >{t`existing pools`}</StyledExternalLink>
              {t`with similar assets for inspiration (or use`}
              <StyledExternalLink href="https://github.com/curveresearch/curvesim">curvesim</StyledExternalLink>
              {t`to sim).`}
            </PresetMessage>
          </SelectPresetWrapper>
        </StyledModalDialog>
      )}
    </>
  )
}

const TitleRow = styled(Box)`
  display: flex;
  flex-direction: row;
`

const SectionLabel = styled.p`
  margin-bottom: var(--spacing-narrow);
  margin-left: var(--spacing-2);
  color: var(--box--primary--color);
  font-size: var(--font-size-2);
`

const PoolPresetButton = styled(Button)`
  display: flex;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-narrow);
  height: 100%;
  min-height: 2.75rem;

  text-transform: var(--input_button--text-transform);

  background: var(--dialog--background-color);
  color: var(--page--text-color);
  border: 1px solid var(--nav_button--border-color);
  box-shadow: 3px 3px 0 var(--box--primary--shadow-color);

  grid-template-columns: auto 1fr auto;

  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  :hover {
    color: var(--button--color);
    border: 1px solid var(--button--background-color);
  }
`

const LabelTextWrapper = styled(Box)`
  display: flex;
  overflow: hidden;
  justify-content: center;
  text-overflow: ellipsis;
  padding-top: var(--spacing-1);
  padding-bottom: var(--spacing-1);
  width: 100%;
`

const SelectedLabelText = styled.span`
  overflow: hidden;

  font-size: var(--font-size-3);
  font-weight: var(--semi-bold);
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: auto auto auto 0;
`

const PlaceholderSelectedLabelText = styled(SelectedLabelText)`
  font-weight: var(--semi-bold);
  font-size: var(--font-size-2);
`

const StyledModalDialog = styled(ModalDialog)`
  width: 100%;
  min-width: 95vw;

  @media (min-width: 28.125rem) {
    min-width: 28.125rem;
  }

  @media (min-width: ${breakpoints.lg}rem) {
    position: relative;
  }
`

const SelectPresetWrapper = styled.div<{ clickDisabled: boolean }>`
  margin: var(--spacing-3) var(--spacing-4) var(--spacing-4);
  ${(props) =>
    props.clickDisabled &&
    `
    pointer-events: none;
  `}
`

const SelectButtonWrapper = styled(Box)`
  margin-bottom: var(--spacing-3);
`

const PresetMessage = styled.div`
  font-size: var(--font-size-2);
  margin-top: var(--spacing-4);
`

const StyledExternalLink = styled(ExternalLink)`
  text-transform: none;
  color: var(--page--text-color);
  font-weight: var(--bold);
  margin: 0 var(--spacing-1);
  &:hover {
    cursor: pointer;
  }
`

const InternalLink = styled.a`
  color: var(--page--text-color);
  font-weight: var(--bold);
  text-decoration: underline;
`

export default SelectPreset
