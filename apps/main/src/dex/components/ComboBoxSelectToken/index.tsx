import React, { useCallback, useEffect, useState } from 'react'
import { useFilter } from 'react-aria'
import { useOverlayTriggerState } from 'react-stately'
import styled from 'styled-components'
import { delayAction } from '@/dex/utils'
import useStore from '@/dex/store/useStore'
import ComboBox from '@/dex/components/ComboBoxSelectToken/ComboBox'
import ComboBoxSelectedToken from '@/dex/components/ComboBoxSelectToken/ComboBoxSelectedToken'
import ComboBoxSelectedTokenButton from '@/dex/components/ComboBoxSelectToken/ComboBoxSelectedTokenButton'
import ModalDialog from '@ui/Dialog'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { Token } from '@/dex/types/main.types'
import { filterTokens } from '@ui-kit/utils'

const ComboBoxTokens = ({
  disabled,
  imageBaseUrl,
  listBoxHeight,
  selectedToken,
  showBalances,
  showCheckboxHideSmallPools,
  showSearch,
  testId,
  title,
  tokens = [],
  onOpen,
  onSelectionChange,
}: {
  disabled?: boolean
  imageBaseUrl: string
  listBoxHeight?: string
  selectedToken: Token | undefined
  showBalances?: boolean
  showCheckboxHideSmallPools?: boolean
  showSearch?: boolean
  testId?: string
  title: string
  tokens: Token[] | undefined
  onOpen?: () => void
  onSelectionChange: (selectedAddress: React.Key) => void
}) => {
  const { endsWith } = useFilter({ sensitivity: 'base' })
  const overlayTriggerState = useOverlayTriggerState({})

  const filterValue = useStore((state) => state.selectToken.filterValue)
  const isMobile = useStore((state) => state.isMobile)
  const setStateByKey = useStore((state) => state.selectToken.setStateByKey)

  const [result, setResult] = useState<Token[] | undefined>()

  const handleInpChange = useCallback(
    (filterValue: string, tokens: Token[] | undefined) => {
      setStateByKey('filterValue', filterValue)
      const result = filterValue && tokens && tokens.length > 0 ? filterTokens(filterValue, tokens, endsWith) : tokens
      setResult(result)
    },
    [endsWith, setStateByKey],
  )

  const handleOnSelectChange = (tokenAddress: React.Key) => {
    onSelectionChange(tokenAddress)
    handleClose()
  }

  const handleOpen = () => {
    if (typeof onOpen === 'function') onOpen()

    setResult(tokens)
    setStateByKey('filterValue', '')
    overlayTriggerState.open()
  }

  const handleClose = () => {
    if (isMobile) {
      delayAction(overlayTriggerState.close)
    } else {
      overlayTriggerState.close()
    }
  }

  // update result if tokens list changed.
  useEffect(() => {
    if (Array.isArray(tokens) && tokens.length > 0) {
      if (filterValue) {
        handleInpChange(filterValue, tokens)
      } else {
        setResult(tokens)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens])

  return selectedToken ? (
    <>
      <ComboBoxSelectedTokenButton isDisabled={disabled} testId={testId} onPress={handleOpen} fillWidth>
        <ComboBoxSelectedToken imageBaseUrl={imageBaseUrl} selected={selectedToken} testId={testId} />
      </ComboBoxSelectedTokenButton>
      {overlayTriggerState.isOpen && (
        <ModalDialog
          testId={testId}
          title={title}
          noContentPadding
          state={{ ...overlayTriggerState, close: handleClose }}
        >
          <ComboBox
            testId={testId}
            dialogClose={handleClose}
            imageBaseUrl={imageBaseUrl}
            listBoxHeight={listBoxHeight}
            result={result}
            selectedToken={selectedToken.address}
            showBalances={showBalances}
            showCheckboxHideSmallPools={showCheckboxHideSmallPools}
            showInpSearch={showSearch}
            tokens={tokens}
            handleInpChange={handleInpChange}
            handleOnSelectChange={handleOnSelectChange}
          />
        </ModalDialog>
      )}
    </>
  ) : (
    <StyledSpinnerWrapper vSpacing={1}>
      <Spinner size={15} />
    </StyledSpinnerWrapper>
  )
}

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  height: 100%;
  border: 0.5px solid var(--input_button--border-color);
  box-shadow: inset -2px -2px 0 0.25px var(--box--primary--shadow-color);
`

export default ComboBoxTokens
