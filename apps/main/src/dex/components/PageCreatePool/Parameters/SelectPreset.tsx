import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { SelectButton } from '@/dex/components/PageCreatePool/components/SelectButton'
import { ModalDialog } from '@/dex/components/PageCreatePool/ConfirmModal/ModalDialog'
import { CRYPTOSWAP, FXSWAP, POOL_PRESETS, STABLESWAP } from '@/dex/components/PageCreatePool/constants'
import { useStore } from '@/dex/store/useStore'
import type { UrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { useButton } from '@react-aria/button'
import { useOverlayTriggerState } from '@react-stately/overlays'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { ExternalLink } from '@ui/Link'
import { breakpoints } from '@ui/utils/responsive'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { DEX_ROUTES } from '@ui-kit/shared/routes'

type Props = {
  setStableFeeValue: Dispatch<SetStateAction<string>>
  setMidValue: Dispatch<SetStateAction<string>>
  setOutValue: Dispatch<SetStateAction<string>>
}

export const SelectPreset = ({ setStableFeeValue, setMidValue, setOutValue }: Props) => {
  const swapType = useStore((state) => state.createPool.swapType)
  const poolPresetIndex = useStore((state) => state.createPool.poolPresetIndex)
  const updatePoolPresetIndex = useStore((state) => state.createPool.updatePoolPresetIndex)
  const tokenAmount = useStore((state) => state.createPool.tokensInPool.tokenAmount)

  const overlayTriggerState = useOverlayTriggerState({})

  const params = useParams<UrlParams>()
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const { buttonProps: openButtonProps } = useButton({ onPressEnd: () => overlayTriggerState.open() }, openButtonRef)

  const [isButtonDisabled, setIsButtonDisabled] = useState(true)

  // prevent modal button from being pressed when opened
  useEffect(() => {
    if (overlayTriggerState.isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsButtonDisabled(true)
      const timer = setTimeout(() => {
        setIsButtonDisabled(false)
      }, 10)
      return () => clearTimeout(timer)
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
                    descriptionName={t(POOL_PRESETS[0].descriptionName)}
                    description={t(POOL_PRESETS[0].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(0)
                      setStableFeeValue(t(POOL_PRESETS[0].defaultParams.stableSwapFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
                <SelectButtonWrapper>
                  <SelectButton
                    selected={poolPresetIndex === 1}
                    name={POOL_PRESETS[1].name}
                    descriptionName={t(POOL_PRESETS[1].descriptionName)}
                    description={t(POOL_PRESETS[1].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(1)
                      setStableFeeValue(t(POOL_PRESETS[1].defaultParams.stableSwapFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
                <SelectButtonWrapper>
                  <SelectButton
                    selected={poolPresetIndex === 2}
                    name={POOL_PRESETS[2].name}
                    descriptionName={t(POOL_PRESETS[2].descriptionName)}
                    description={t(POOL_PRESETS[2].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(2)
                      setStableFeeValue(t(POOL_PRESETS[2].defaultParams.stableSwapFee))
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
                    selected={poolPresetIndex === 3}
                    name={POOL_PRESETS[3].name}
                    descriptionName={t(POOL_PRESETS[3].descriptionName)}
                    description={t(POOL_PRESETS[3].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(3)
                      setMidValue(t(POOL_PRESETS[3].defaultParams.midFee))
                      setOutValue(t(POOL_PRESETS[3].defaultParams.outFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
                <SelectButtonWrapper>
                  <SelectButton
                    selected={poolPresetIndex === 4}
                    name={POOL_PRESETS[4].name}
                    descriptionName={t(POOL_PRESETS[4].descriptionName)}
                    description={t(POOL_PRESETS[4].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(4)
                      setMidValue(t(POOL_PRESETS[4].defaultParams.midFee))
                      setOutValue(t(POOL_PRESETS[4].defaultParams.outFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
                <SelectButtonWrapper>
                  <SelectButton
                    selected={poolPresetIndex === 5}
                    name={POOL_PRESETS[5].name}
                    descriptionName={t(POOL_PRESETS[5].descriptionName)}
                    description={t(POOL_PRESETS[5].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(5)
                      setMidValue(t(POOL_PRESETS[5].defaultParams.midFee))
                      setOutValue(t(POOL_PRESETS[5].defaultParams.outFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
                <SelectButtonWrapper>
                  <SelectButton
                    selected={poolPresetIndex === 6}
                    name={POOL_PRESETS[6].name}
                    descriptionName={t(POOL_PRESETS[6].descriptionName)}
                    description={t(POOL_PRESETS[6].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(6)
                      setMidValue(t(POOL_PRESETS[6].defaultParams.midFee))
                      setOutValue(t(POOL_PRESETS[6].defaultParams.outFee))
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
                    selected={poolPresetIndex === 7}
                    name={POOL_PRESETS[7].name}
                    descriptionName={t(POOL_PRESETS[7].descriptionName)}
                    description={t(POOL_PRESETS[7].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(7)
                      setMidValue(t(POOL_PRESETS[7].defaultParams.midFee))
                      setOutValue(t(POOL_PRESETS[7].defaultParams.outFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
                <SelectButtonWrapper>
                  <SelectButton
                    selected={poolPresetIndex === 8}
                    name={POOL_PRESETS[8].name}
                    descriptionName={t(POOL_PRESETS[8].descriptionName)}
                    description={t(POOL_PRESETS[8].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(8)
                      setMidValue(t(POOL_PRESETS[8].defaultParams.midFee))
                      setOutValue(t(POOL_PRESETS[8].defaultParams.outFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
              </>
            )}
            {swapType === FXSWAP && tokenAmount === 2 && (
              <>
                <SelectButtonWrapper>
                  <SelectButton
                    selected={poolPresetIndex === 9}
                    name={POOL_PRESETS[9].name}
                    descriptionName={t(POOL_PRESETS[9].descriptionName)}
                    description={t(POOL_PRESETS[9].description)}
                    handleClick={() => {
                      updatePoolPresetIndex(9)
                      setMidValue(t(POOL_PRESETS[9].defaultParams.midFee))
                      setOutValue(t(POOL_PRESETS[9].defaultParams.outFee))
                      overlayTriggerState.close()
                    }}
                    paddingSize={'small'}
                  />
                </SelectButtonWrapper>
              </>
            )}
            {swapType === FXSWAP ? (
              <PresetMessage>
                {t`FXSwap pools are experimental and still evolving. Can't find the right preset?`}
                <StyledExternalLink
                  href="https://quiver-meadow-354.notion.site/27f599aae0648017bae7d050934d5493"
                  target="_blank"
                >
                  {t`Reach out to the team.`}
                </StyledExternalLink>
              </PresetMessage>
            ) : (
              <PresetMessage>
                {t`Can't find the pool preset you want? Check out`}
                <StyledExternalLink
                  target="_blank"
                  href={getPath(params, DEX_ROUTES.PAGE_POOLS)}
                >{t`existing pools`}</StyledExternalLink>
                {t`with similar assets for inspiration (or use`}
                <StyledExternalLink href="https://github.com/curveresearch/curvesim" target="_blank">
                  curvesim
                </StyledExternalLink>
                {t`to sim).`}
              </PresetMessage>
            )}
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

  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  &:hover {
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
  color: var(--page--text-color);
  font-weight: var(--bold);
  margin: 0 var(--spacing-1);
  &:hover {
    cursor: pointer;
  }
`
