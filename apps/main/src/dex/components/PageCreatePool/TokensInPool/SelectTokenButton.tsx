import { type Key, useEffect, useMemo, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { STABLESWAP } from '@/dex/components/PageCreatePool/constants'
import { CreateToken } from '@/dex/components/PageCreatePool/types'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useBasePools } from '@/dex/queries/base-pools.query'
import { useStore } from '@/dex/store/useStore'
import { ChainId, CurveApi } from '@/dex/types/main.types'
import { delayAction } from '@/dex/utils'
import { useButton } from '@react-aria/button'
import { useFilter } from '@react-aria/i18n'
import { useOverlayTriggerState } from '@react-stately/overlays'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { Checkbox } from '@ui/Checkbox'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { Chip } from '@ui/Typography'
import { TokenList } from '@ui-kit/features/select-token/ui/modal/TokenList'
import { TokenSelectorModal } from '@ui-kit/features/select-token/ui/modal/TokenSelectorModal'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { type Address, filterTokens, shortenAddress } from '@ui-kit/utils'

type Props = {
  curve: CurveApi
  chainId: ChainId
  disabledKeys?: string[]
  haveSigner: boolean
  blockchainId: string
  selectedAddress: string
  tokens: CreateToken[]
  onSelectionChange: (selectedAddress: Key) => void
}

export const SelectTokenButton = ({
  curve,
  disabledKeys,
  chainId,
  blockchainId,
  selectedAddress,
  tokens = [],
  onSelectionChange,
}: Props) => {
  const { data: network } = useNetworkByChain({ chainId })
  const visibleTokens = useRef<{ [k: string]: boolean }>({})
  const overlayTriggerState = useOverlayTriggerState({})
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const { buttonProps: openButtonProps } = useButton({ onPress: () => overlayTriggerState.open() }, openButtonRef)
  const { endsWith } = useFilter({ sensitivity: 'base' })

  const isMobile = useIsMobile()
  const nativeToken = curve.getNetworkConstants().NATIVE_TOKEN

  const userAddedTokens = useStore((state) => state.createPool.userAddedTokens)
  const updateUserAddedTokens = useStore((state) => state.createPool.updateUserAddedTokens)

  const { data: basePools = [], isLoading: basePoolsLoading } = useBasePools({ chainId })
  const swapType = useStore((state) => state.createPool.swapType)

  const [error, setError] = useState<string>()
  const [filterValue, setFilterValue] = useState('')
  const [filterBasepools, setFilterBasepools] = useState(false)

  const favorites = [
    {
      address: nativeToken?.wrappedAddress ?? '',
      symbol: nativeToken?.wrappedSymbol ?? '',
    },
    ...network.createQuickList,
  ].map(({ address, symbol }) => ({
    chain: blockchainId,
    address: address as Address,
    symbol,
  }))

  if (!overlayTriggerState.isOpen) {
    // eslint-disable-next-line react-hooks/refs
    visibleTokens.current = {}
  }

  // handles search/filtering
  const options = useMemo(() => {
    const allTokens = filterBasepools
      ? tokens.filter((item) =>
          basePools.some((basepool) => basepool.token.toLowerCase() === item.address.toLowerCase()),
        )
      : tokens

    const filteredResults = filterTokens(filterValue, allTokens, endsWith)

    return filteredResults.map((token) => ({
      chain: blockchainId,
      address: token.address as Address,
      symbol: token.symbol,
      label: [token.basePool && 'Base pool', token.userAddedToken && 'User added'].filter(Boolean).join(' - '),
      volume: token.volume,
    }))
  }, [filterBasepools, tokens, filterValue, endsWith, basePools, blockchainId])

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
          const isBasePool = !!basePools?.some((basepool) => basepool.token.toLowerCase() === filterValueLowerCase)

          updateUserAddedTokens(filterValueLowerCase, token[0].symbol, false, isBasePool)
        } catch (error) {
          console.warn(error)
          setError(error)
        }
      }
    }
    void updateUserAddedToken()
  }, [basePools, chainId, curve, filterValue, options, updateUserAddedTokens, userAddedTokens])

  const selectedToken = useMemo(
    () => (selectedAddress ? tokens.find((userToken) => userToken.address === selectedAddress) : null),
    [selectedAddress, tokens],
  )

  const handleClose = () => {
    setFilterValue('')
    setError(undefined)
    if (isMobile) {
      delayAction(overlayTriggerState.close)
    } else {
      overlayTriggerState.close()
    }
  }

  return chainId || basePoolsLoading ? (
    <>
      <ComboBoxButton {...openButtonProps} ref={openButtonRef} variant={'filled'} fillWidth>
        {selectedToken ? (
          <>
            <ButtonTokenIcon
              blockchainId={blockchainId}
              tooltip={selectedToken.symbol}
              address={selectedToken.address}
            />
            <LabelTextWrapper>
              <SelectedLabelText>
                {selectedToken.symbol}{' '}
                {selectedToken.basePool && swapType === STABLESWAP && <BasepoolLabel>{t`BASE`}</BasepoolLabel>}
              </SelectedLabelText>
            </LabelTextWrapper>
            <SelectedLabelAddress>{shortenAddress(selectedToken.address)}</SelectedLabelAddress>
          </>
        ) : (
          <LabelTextWrapper>
            <PlaceholderSelectedLabelText>{t`Select a token`}</PlaceholderSelectedLabelText>
          </LabelTextWrapper>
        )}
      </ComboBoxButton>
      {overlayTriggerState.isOpen && (
        <TokenSelectorModal isOpen compact={false} onClose={handleClose}>
          <TokenList
            tokens={options}
            favorites={favorites}
            error={error}
            disabledTokens={disabledKeys}
            disableSorting
            onToken={({ address }) => {
              onSelectionChange(address)
              setFilterBasepools(false)
              handleClose()
            }}
            onSearch={(val) => {
              setFilterValue(val)
              setError(undefined)
            }}
          >
            {swapType === STABLESWAP && (
              <Checkbox
                key={'filter-basepools'}
                isDisabled={basePools.length === 0}
                className={filterBasepools ? 'active' : ''}
                isSelected={filterBasepools}
                onChange={() => setFilterBasepools(!filterBasepools)}
              >
                View Basepools
              </Checkbox>
            )}
          </TokenList>
        </TokenSelectorModal>
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
