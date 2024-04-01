import { CreateToken, CreateQuickListToken } from '@/components/PageCreatePool/types'

import { t } from '@lingui/macro'
import { useButton } from '@react-aria/button'
import { useFilter } from '@react-aria/i18n'
import { useMemo, useRef, useState } from 'react'
import { useOverlayTriggerState } from '@react-stately/overlays'
import { Item } from '@react-stately/collections'
import styled from 'styled-components'
import Fuse from 'fuse.js'

import { breakpoints } from '@/ui/utils/responsive'
import { delayAction, shortenTokenAddress } from '@/utils'
import useStore from '@/store/useStore'
import networks from '@/networks'
import { STABLESWAP } from '@/components/PageCreatePool/constants'

import ComboBox from '@/components/PageCreatePool/SelectTokenModal/ComboBox'
import Box from '@/ui/Box'
import Button from '@/ui/Button'
import ModalDialog from '@/components/PageCreatePool/ConfirmModal/ModalDialog'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import TokenIcon from '@/components/TokenIcon'
import { Chip } from '@/ui/Typography'

type Props = {
  curve: CurveApi
  chainId: ChainId
  disabledKeys?: string[]
  haveSigner: boolean
  imageBaseUrl: string
  selectedAddress: string
  tokens: CreateToken[]
  onSelectionChange: (selectedAddress: React.Key) => void
}

type TokenQueryType = '' | 'LOADING' | 'ERROR'

const ComboBoxTokenPicker = ({
  curve,
  disabledKeys,
  chainId,
  imageBaseUrl,
  selectedAddress,
  tokens,
  onSelectionChange,
}: Props) => {
  const visibleTokens = useRef<{ [k: string]: boolean }>({})
  const overlayTriggerState = useOverlayTriggerState({})
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const { buttonProps: openButtonProps } = useButton({ onPress: () => overlayTriggerState.open() }, openButtonRef)
  const { endsWith } = useFilter({ sensitivity: 'base' })

  const isMobile = useStore((state) => state.isMobile)
  const isMdUp = useStore((state) => state.isMdUp)
  const updateUserAddedTokens = useStore((state) => state.createPool.updateUserAddedTokens)
  const { loading } = useStore((state) => state.tokens)
  const { basePools, basePoolsLoading } = useStore((state) => state.pools)
  const { swapType } = useStore((state) => state.createPool)

  const [filterValue, setFilterValue] = useState('')
  const [tokenQueryStatus, settokenQueryStatus] = useState<TokenQueryType>('')

  if (!overlayTriggerState.isOpen) {
    visibleTokens.current = {}
  }

  const verifyTokens = async () => {
    try {
      const token = await curve.getCoinsData([filterValue])
      const isBasePool = basePools[chainId].some(
        (basepool) => basepool.token.toLowerCase() === filterValue.toLowerCase()
      )
      updateUserAddedTokens(filterValue, token[0].symbol, false, isBasePool)
    } catch (error) {
      console.log('error')
      settokenQueryStatus('ERROR')
    }
  }

  // handles search/filtering
  const items = useMemo(() => {
    const filteredTokens = disabledKeys
      ? tokens.filter((item) => !disabledKeys.some((i) => i.toLowerCase() === item.address.toLowerCase()))
      : tokens
    const fuse = new Fuse<CreateToken>(filteredTokens, {
      ignoreLocation: true,
      threshold: 0.01,
      keys: ['symbol', 'address'],
    })

    const result = fuse.search(filterValue)

    const checkedResult =
      filterValue.length !== 42
        ? result
        : result.length !== 0 && result[0].item.address.toLowerCase() === filterValue.toLowerCase()
        ? result
        : []

    settokenQueryStatus('')
    if (filterValue.length === 42 && checkedResult.length === 0) {
      settokenQueryStatus('LOADING')
      verifyTokens()
    }

    if (filterValue.length === 0) {
      return filteredTokens
    } else if (checkedResult.length > 0) {
      return checkedResult.map((r) => r.item)
    } else {
      return tokens.filter((item) => endsWith(item.address, filterValue))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue, tokens, disabledKeys])

  const selectedToken = useMemo(() => {
    return selectedAddress ? tokens.find((userToken) => userToken.address === selectedAddress) : null
  }, [selectedAddress, tokens])

  const handleClose = () => {
    setFilterValue('')
    isMobile ? delayAction(overlayTriggerState.close) : overlayTriggerState.close()
  }

  const handleOnSelectChange = (tokenAddress: React.Key) => {
    if (tokenAddress) onSelectionChange(tokenAddress)
    handleClose()
  }

  return chainId || basePoolsLoading ? (
    <>
      <ComboBoxButton {...openButtonProps} ref={openButtonRef} variant={'filled'} fillWidth>
        {selectedToken ? (
          <>
            <ButtonTokenIcon imageBaseUrl={imageBaseUrl} token={selectedToken.symbol} address={selectedToken.address} />
            <LabelTextWrapper>
              <SelectedLabelText>
                {selectedToken.symbol}{' '}
                {selectedToken.basePool && swapType === STABLESWAP && <BasepoolLabel>{t`BASE`}</BasepoolLabel>}
              </SelectedLabelText>
            </LabelTextWrapper>
            <SelectedLabelAddress>{shortenTokenAddress(selectedToken.address)}</SelectedLabelAddress>
          </>
        ) : (
          <LabelTextWrapper>
            <PlaceholderSelectedLabelText>{t`Select a token`}</PlaceholderSelectedLabelText>
          </LabelTextWrapper>
        )}
      </ComboBoxButton>
      {overlayTriggerState.isOpen && (
        <StyledModalDialog
          title=""
          isOpen
          isDismissable
          maxWidth="29rem"
          state={{ ...overlayTriggerState, close: handleClose }}
        >
          <ComboBox
            label=""
            showSearch
            aria-label={t`Search by name or paste address`}
            activeKey={selectedAddress}
            allowsCustomValue={!isMdUp}
            disabledKeys={disabledKeys}
            items={items}
            inputValue={filterValue}
            isListboxOpenPermanently
            listBoxHeight="500px"
            menuTrigger="focus"
            onClose={handleClose}
            defaultInputValue={filterValue}
            onInputChange={setFilterValue}
            placeholder={t`Search by token name or address`}
            quickList={
              networks[chainId].createQuickList.length !== 0 && (
                <QuickListWrapper>
                  {networks[chainId].createQuickList.map(({ address, symbol }: CreateQuickListToken) => (
                    <QuickListButton
                      key={address}
                      disabled={disabledKeys?.some((item) => item.toLowerCase() === address.toLowerCase())}
                      variant="icon-outlined"
                      onClick={() => handleOnSelectChange(address)}
                    >
                      <StyledQuickListTokenIcon
                        address={address}
                        imageBaseUrl={imageBaseUrl}
                        token={symbol}
                        size="sm"
                      />{' '}
                      {symbol}
                    </QuickListButton>
                  ))}
                </QuickListWrapper>
              )
            }
            onSelectionChange={handleOnSelectChange}
          >
            {tokenQueryStatus === '' ? (
              items.length > 0 ? (
                (item: CreateToken) => (
                  <Item key={item.address} textValue={item.symbol}>
                    <ItemWrapper>
                      <TokenIcon
                        imageBaseUrl={imageBaseUrl}
                        token={item.symbol}
                        address={item.ethAddress || item.address}
                      />
                      <LabelTextWrapper>
                        <LabelText>
                          {item.symbol}{' '}
                          {item.basePool && swapType === STABLESWAP && <BasepoolLabel>{t`BASE`}</BasepoolLabel>}
                        </LabelText>
                        {item.userAddedToken && <UserAddedText>User added</UserAddedText>}
                      </LabelTextWrapper>
                      <SelectedLabelAddress>{shortenTokenAddress(item.address)}</SelectedLabelAddress>
                    </ItemWrapper>
                  </Item>
                )
              ) : loading || basePoolsLoading ? (
                <Item key={'LOADING'} textValue={'LOADING'}>
                  <StyledSearchSpinnerWrapper vSpacing={1}>
                    <Spinner size={15} />
                  </StyledSearchSpinnerWrapper>
                </Item>
              ) : (
                <Item key={'no-results'} textValue={'No Results'}>
                  <ItemWrapper>
                    <LabelTextWrapper>
                      <ErrorText>{t`Search generated no results`}</ErrorText>
                    </LabelTextWrapper>
                  </ItemWrapper>
                </Item>
              ) // loading
            ) : tokenQueryStatus === 'LOADING' ? (
              <Item key={'LOADING'} textValue={'LOADING'}>
                <StyledSearchSpinnerWrapper vSpacing={1}>
                  <Spinner size={15} />
                </StyledSearchSpinnerWrapper>
              </Item>
            ) : (
              // no search resuslts
              <Item key={'ERROR'} textValue={'ERROR'}>
                <ItemWrapper>
                  <LabelTextWrapper>
                    <ErrorText>{t`No token found for address ${shortenTokenAddress(filterValue)}`}</ErrorText>
                  </LabelTextWrapper>
                </ItemWrapper>
              </Item>
            )}
          </ComboBox>
        </StyledModalDialog>
      )}
    </>
  ) : (
    <StyledSpinnerWrapper vSpacing={1}>
      <Spinner size={15} />
    </StyledSpinnerWrapper>
  )
}

ComboBoxTokenPicker.defaultProps = {
  tokens: [],
  tokensMapper: {},
}

const ItemWrapper = styled.div`
  align-items: center;
  display: grid;
  grid-column-gap: var(--spacing-2);
  grid-template-columns: auto 1fr auto;
  width: 100%;
`

const StyledQuickListTokenIcon = styled(TokenIcon)`
  margin-right: 0.25rem;
`

const ButtonTokenIcon = styled(TokenIcon)`
  margin-right: 0.25rem;
`

const QuickListButton = styled(Button)`
  margin: 0.25rem;
  padding: 0.5rem 0.9rem 0.5rem 0.75rem;
  text-transform: none;
`

const QuickListWrapper = styled.div`
  display: none;
  @media (min-width: 28.125rem) {
    display: flex;
    margin: 0 0.75rem;
    flex-wrap: wrap;
  }
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  display: flex;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-narrow);
  height: 100%;

  text-transform: var(--input_button--text-transform);

  background: var(--layout--home--background-color);
  color: var(--page--text-color);
  border: 1px solid var(--nav_button--border-color);
  box-shadow: 3px 3px 0 var(--box--primary--shadow-color);
`

const StyledSearchSpinnerWrapper = styled(SpinnerWrapper)`
  display: flex;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-narrow);
  height: 100%;

  text-transform: var(--input_button--text-transform);

  color: var(--page--text-color);
`

const SelectedLabelText = styled.span`
  overflow: hidden;
  display: flex;
  justify-content: center;

  font-size: var(--font-size-3);
  font-weight: var(--semi-bold);
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const SelectedLabelAddress = styled.span`
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  line-height: 1;
  margin-left: auto;
`

const PlaceholderSelectedLabelText = styled(SelectedLabelText)`
  font-weight: var(--semi-bold);
  font-size: var(--font-size-2);
`

const LabelText = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;

  font-size: var(--font-size-4);
  font-weight: var(--font-weight--bold);
  line-height: 1;
  text-overflow: ellipsis;
`

const UserAddedText = styled.div`
  font-size: var(--font-size-1);
`

const ErrorText = styled.div`
  font-size: var(--font-size-2);
  text-align: center;
  margin: auto;
`

const LabelTextWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-top: var(--spacing-1);
  padding-bottom: var(--spacing-1);
`

const ComboBoxButton = styled(Button)`
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

const StyledModalDialog = styled(ModalDialog)`
  position: fixed;
  width: 100%;

  @media (min-width: ${breakpoints.lg}rem) {
    position: relative;
  }
`

const BasepoolLabel = styled(Chip)`
  margin: auto 0 auto var(--spacing-1);
  font-weight: var(--bold);
  font-size: var(--font-size-1);
  padding: 2px;
  background-color: var(--warning-400);
  color: var(--black);
  letter-spacing: 0;
  height: 15px;
`

export default ComboBoxTokenPicker
