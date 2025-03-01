import { CreateToken } from '@/dex/components/PageCreatePool/types'
import { t } from '@ui-kit/lib/i18n'
import { useButton } from '@react-aria/button'
import { useFilter } from '@react-aria/i18n'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useOverlayTriggerState } from '@react-stately/overlays'
import styled from 'styled-components'
import { delayAction, shortenTokenAddress } from '@/dex/utils'
import useStore from '@/dex/store/useStore'
import { STABLESWAP } from '@/dex/components/PageCreatePool/constants'
import Box from '@ui/Box'
import Button from '@ui/Button'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { Chip } from '@ui/Typography'
import Checkbox from '@ui/Checkbox'
import { ChainId, CurveApi } from '@/dex/types/main.types'
import { type Address, filterTokens } from '@ui-kit/utils'
import { TokenSelectorModal } from '@ui-kit/features/select-token/ui/modal/TokenSelectorModal'

type Props = {
  curve: CurveApi
  chainId: ChainId
  disabledKeys?: string[]
  haveSigner: boolean
  blockchainId: string
  selectedAddress: string
  tokens: CreateToken[]
  onSelectionChange: (selectedAddress: React.Key) => void
}

const SelectTokenButton = ({
  curve,
  disabledKeys,
  chainId,
  blockchainId,
  selectedAddress,
  tokens = [],
  onSelectionChange,
}: Props) => {
  const networks = useStore((state) => state.networks.networks)
  const visibleTokens = useRef<{ [k: string]: boolean }>({})
  const overlayTriggerState = useOverlayTriggerState({})
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const { buttonProps: openButtonProps } = useButton({ onPress: () => overlayTriggerState.open() }, openButtonRef)
  const { endsWith } = useFilter({ sensitivity: 'base' })

  const isMobile = useStore((state) => state.isMobile)
  const nativeToken = useStore((state) => state.networks.nativeToken[chainId])

  const userAddedTokens = useStore((state) => state.createPool.userAddedTokens)
  const updateUserAddedTokens = useStore((state) => state.createPool.updateUserAddedTokens)

  const { basePools, basePoolsLoading } = useStore((state) => state.pools)
  const { swapType } = useStore((state) => state.createPool)

  const [error, setError] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const [filterBasepools, setFilterBasepools] = useState(false)

  const favorites = [
    {
      address: nativeToken?.wrappedAddress ?? '',
      symbol: nativeToken?.wrappedSymbol ?? '',
    },
    ...networks[chainId].createQuickList,
  ].map(({ address, symbol }) => ({
    chain: blockchainId,
    address: address as Address,
    symbol,
  }))

  if (!overlayTriggerState.isOpen) {
    visibleTokens.current = {}
  }

  // handles search/filtering
  const options = useMemo(() => {
    const allTokens = filterBasepools
      ? tokens.filter((item) =>
          basePools[chainId].some((basepool) => basepool.token.toLowerCase() === item.address.toLowerCase()),
        )
      : tokens

    const filteredResults = filterTokens(filterValue, allTokens, endsWith)

    return filteredResults.map((token) => ({
      chain: blockchainId,
      address: token.address as Address,
      symbol: token.symbol,
      label: [token.basePool ? 'Base pool' : '', token.userAddedToken ? 'User added' : '']
        .filter((x) => x !== '')
        .join(' - '),
      volume: token.volume,
    }))
  }, [filterBasepools, tokens, filterValue, endsWith, basePools, chainId, blockchainId])

  useEffect(() => {
    async function updateUserAddedToken() {
      const filterValueLowerCase = filterValue.toLocaleLowerCase()

      // If user input is an address and there's 0 results, add user token
      if (
        filterValueLowerCase.length === 42 &&
        options.length === 0 &&
        !(userAddedTokens ?? []).some((x) => x.address.toLocaleLowerCase() === filterValueLowerCase)
      ) {
        try {
          const token = await curve.getCoinsData([filterValueLowerCase])
          const isBasePool = basePools[chainId].some(
            (basepool) => basepool.token.toLowerCase() === filterValueLowerCase,
          )

          updateUserAddedTokens(filterValueLowerCase, token[0].symbol, false, isBasePool)
        } catch (error) {
          console.log(error)
          setError(error)
        }
      }
    }
    updateUserAddedToken()
  }, [basePools, chainId, curve, filterValue, options, updateUserAddedTokens, userAddedTokens])

  const selectedToken = useMemo(
    () => (selectedAddress ? tokens.find((userToken) => userToken.address === selectedAddress) : null),
    [selectedAddress, tokens],
  )

  const handleClose = () => {
    setFilterValue('')
    setError('')
    isMobile ? delayAction(overlayTriggerState.close) : overlayTriggerState.close()
  }

  return chainId || basePoolsLoading ? (
    <>
      <ComboBoxButton {...openButtonProps} ref={openButtonRef} variant={'filled'} fillWidth>
        {selectedToken ? (
          <>
            <ButtonTokenIcon
              blockchainId={blockchainId}
              symbol={selectedToken.symbol}
              address={selectedToken.address}
            />
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
        <TokenSelectorModal
          tokens={options}
          favorites={favorites}
          balances={{}}
          tokenPrices={{}}
          showSearch={true}
          showSettings={true}
          isOpen={true}
          compact={false}
          error={error}
          disabledTokens={disabledKeys ?? []}
          disableSorting={true}
          customOptions={
            <Checkbox
              key={'filter-basepools'}
              isDisabled={basePools[chainId]?.length === 0}
              className={filterBasepools ? 'active' : ''}
              isSelected={filterBasepools}
              onChange={() => setFilterBasepools(!filterBasepools)}
            >
              View Basepools
            </Checkbox>
          }
          onClose={handleClose}
          onToken={({ address }) => {
            onSelectionChange(address)
            setFilterBasepools(false)
            handleClose()
          }}
          onSearch={(val) => {
            setFilterValue(val)
            setError('')
          }}
        />
      )}
    </>
  ) : (
    <StyledSpinnerWrapper vSpacing={1}>
      <Spinner size={15} />
    </StyledSpinnerWrapper>
  )
}

const ButtonTokenIcon = styled(TokenIcon)`
  margin-right: 0.25rem;
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

  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  &:hover {
    color: var(--button--color);
    border: 1px solid var(--button--background-color);
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

export default SelectTokenButton
