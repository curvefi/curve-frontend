import { t } from '@lingui/macro'
import { useFilter } from 'react-aria'
import { useOverlayTriggerState, Item } from 'react-stately'
import cloneDeep from 'lodash/cloneDeep'
import styled from 'styled-components'
import React, { useCallback, useEffect, useMemo } from 'react'

import { delayAction } from '@/utils'
import { getTokensObjListStr } from '@/store/createQuickSwapSlice'
import useStore from '@/store/useStore'

import Checkbox from '@/ui/Checkbox'
import ComboBox from '@/ui/DialogComboBox'
import ComboBoxSelectedToken from '@/components/ComboBoxSelectToken/ComboBoxSelectedToken'
import ComboBoxSelectedTokenButton from '@/components/ComboBoxSelectToken/ComboBoxSelectedTokenButton'
import ComboBoxToken from '@/components/ComboBoxSelectToken/ComboBoxToken'
import ModalDialog from '@/ui/Dialog'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import isUndefined from 'lodash/isUndefined'

const ComboBoxTokens = ({
  disabled,
  disabledKeys,
  haveSigner,
  imageBaseUrl,
  listBoxHeight,
  selectedToken,
  showSearch,
  testId,
  title,
  tokens,
  onSelectionChange,
}: {
  disabled?: boolean
  disabledKeys?: string[]
  haveSigner?: boolean
  imageBaseUrl: string
  listBoxHeight?: string
  selectedToken: Token | undefined
  showSearch?: boolean
  testId?: string
  title: string
  tokens: (Token | undefined)[]
  onSelectionChange: (selectedAddress: React.Key) => void
}) => {
  const { endsWith } = useFilter({ sensitivity: 'base' })
  const overlayTriggerState = useOverlayTriggerState({})

  const filterValue = useStore((state) => state.selectToken.filterValue)
  const hideSmallPools = useStore((state) => state.poolList.formValues.hideSmallPools)
  const isMobile = useStore((state) => state.isMobile)
  const isMdUp = useStore((state) => state.isMdUp)
  const items = useStore((state) => state.selectToken.selectTokensResult)
  const showHideSmallPools = useStore((state) => state.poolList.showHideSmallPools)
  const poolListFormValues = useStore((state) => state.poolList.formValues)
  const setPoolListStateByKey = useStore((state) => state.poolList.setStateByKey)
  const setFilterValue = useStore((state) => state.selectToken.setFilterValue)

  const tokensStr = useMemo(() => getTokensObjListStr(tokens), [tokens])

  const updateFilterValue = useCallback(
    (filterValue: string, tokens: (Token | undefined)[]) => {
      if (tokens.every((token) => !isUndefined(token))) {
        setFilterValue(filterValue, tokens as Token[], { showSearch, endsWith })
      }
    },
    [endsWith, setFilterValue, showSearch]
  )

  const handleOpen = () => {
    updateFilterValue('', tokens)
    overlayTriggerState.open()
  }

  const handleClose = () => {
    if (isMobile) {
      delayAction(overlayTriggerState.close)
    } else {
      overlayTriggerState.close()
    }
  }

  const handleOnSelectChange = (tokenAddress: React.Key) => {
    if (tokenAddress) {
      onSelectionChange(tokenAddress)
    }
    handleClose()
  }

  const handleSelChangeHideSmallPools = (updatedHideSmallPools: boolean) => {
    setPoolListStateByKey('formValues', {
      ...cloneDeep(poolListFormValues),
      hideSmallPools: updatedHideSmallPools,
    })
  }

  // update items if tokens list changed.
  useEffect(() => {
    updateFilterValue(filterValue, tokens)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue, tokensStr])

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
            label=""
            aria-label={t`Search by token name or address`}
            activeKey={selectedToken.address}
            allowsCustomValue={!isMdUp}
            disabledKeys={disabledKeys}
            items={items}
            inputValue={filterValue}
            isListboxOpenPermanently
            listBoxHeight={listBoxHeight}
            menuTrigger="focus"
            onClose={handleClose}
            defaultInputValue={filterValue}
            onSelectionChange={handleOnSelectChange}
            placeholder={t`Search by token name or address`}
            showSearch={showSearch ?? true}
            updateFilterValue={(val) => updateFilterValue(val, tokens)}
            quickList={
              showHideSmallPools ? (
                <CustomSelectWrapper>
                  <Checkbox isSelected={hideSmallPools} onChange={handleSelChangeHideSmallPools}>
                    {t`Hide tokens from very small pools`}
                  </Checkbox>
                </CustomSelectWrapper>
              ) : null
            }
            testId={testId}
          >
            {(item: Token) => {
              return (
                <Item key={item.address} textValue={item.symbol}>
                  <ComboBoxToken haveSigner={haveSigner} imageBaseUrl={imageBaseUrl} testId={testId} {...item} />
                </Item>
              )
            }}
          </ComboBox>
        </ModalDialog>
      )}
    </>
  ) : (
    <StyledSpinnerWrapper vSpacing={1}>
      <Spinner size={15} />
    </StyledSpinnerWrapper>
  )
}

ComboBoxTokens.defaultProps = {
  haveSigner: false,
  showSearch: true,
  tokens: [],
}

const CustomSelectWrapper = styled.div`
  display: grid;
  margin: 0 0.75rem;
  grid-gap: var(--spacing-2);
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  height: 100%;
  border: 0.5px solid var(--input_button--border-color);
  box-shadow: inset -2px -2px 0px 0.25px var(--box--primary--shadow-color);
`
export default ComboBoxTokens
