import { Key } from 'react'
import { styled } from 'styled-components'
import { type Address } from 'viem'
import {
  STABLESWAP,
  CRYPTOSWAP,
  TOKEN_A,
  TOKEN_B,
  TOKEN_C,
  TOKEN_D,
  TOKEN_E,
  TOKEN_F,
  TOKEN_G,
  TOKEN_H,
  NG_ASSET_TYPE,
} from '@/dex/components/PageCreatePool/constants'
import { useAutoDetectErc4626 } from '@/dex/components/PageCreatePool/hooks/useAutoDetectErc4626'
import {
  CreateToken,
  TokenState,
  TokenId,
  SelectTokenFormValues,
  TokensInPoolState,
} from '@/dex/components/PageCreatePool/types'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useStore } from '@/dex/store/useStore'
import { CurveApi, ChainId } from '@/dex/types/main.types'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { Checkbox } from '@ui/Checkbox'
import { Icon } from '@ui/Icon'
import { t } from '@ui-kit/lib/i18n'
import { WarningBox } from '../components/WarningBox'
import { SelectTokenButton } from './SelectTokenButton'

type Props = {
  curve: CurveApi
  haveSigner: boolean
  chainId: ChainId
  tokenId: TokenId
  token: TokenState
  tokenTitle: string
  disabledTokens: string[]
  selTokens: CreateToken[]
  handleInpChange: (name: keyof SelectTokenFormValues, value: string, tokensInPoolState: TokensInPoolState) => void
  removeToken?: (tokenId: TokenId, tokensInPoolState: TokensInPoolState) => void
}

export const SelectToken = ({
  curve,
  haveSigner,
  chainId,
  tokenId,
  token,
  tokenTitle,
  disabledTokens,
  selTokens,
  handleInpChange,
  removeToken,
}: Props) => {
  const updateNgAssetType = useStore((state) => state.createPool.updateNgAssetType)
  const swapType = useStore((state) => state.createPool.swapType)
  const clearToken = useStore((state) => state.createPool.clearToken)
  const tokensInPool = useStore((state) => state.createPool.tokensInPool)
  const { data: network } = useNetworkByChain({ chainId })
  void useAutoDetectErc4626({
    tokenId,
    address: token.address as Address,
  })

  const getTokenName = (tokenId: TokenId) => {
    if (tokenId === TOKEN_D) return t`Token D`
    if (tokenId === TOKEN_E) return t`Token E`
    if (tokenId === TOKEN_F) return t`Token F`
    if (tokenId === TOKEN_G) return t`Token G`
    if (tokenId === TOKEN_H) return t`Token H`
  }

  return (
    <TokenPickerContainer>
      {(tokenId === TOKEN_A || tokenId === TOKEN_B) && (
        <LabelRow flex flexJustifyContent={'space-between'}>
          <p>{tokenTitle}</p>
          <ClearButton variant="text" onClick={() => clearToken(tokenId)}>{t`Clear`}</ClearButton>
        </LabelRow>
      )}
      {tokenId === TOKEN_C && (
        <LabelRow flex flexJustifyContent={'space-between'}>
          <p>{t`Token C`}</p>
          <Box flex>
            <ClearButton variant="text" onClick={() => clearToken(tokenId)}>{t`Clear`}</ClearButton>
            {((swapType === CRYPTOSWAP && network.twocryptoFactory) || swapType === STABLESWAP) && removeToken && (
              <RemoveButton variant={'text'} onClick={() => removeToken(TOKEN_C, tokensInPool)}>
                <Icon name={'RowDelete'} size={16} aria-label={t`Remove token`} />
              </RemoveButton>
            )}
          </Box>
        </LabelRow>
      )}
      {(tokenId === TOKEN_D ||
        tokenId === TOKEN_E ||
        tokenId === TOKEN_F ||
        tokenId === TOKEN_G ||
        tokenId === TOKEN_H) &&
        removeToken && (
          <LabelRow flex flexJustifyContent={'space-between'}>
            <p>{getTokenName(tokenId)}</p>
            <Box flex>
              <ClearButton variant="text" onClick={() => clearToken(tokenId)}>{t`Clear`}</ClearButton>
              <RemoveButton variant={'text'} onClick={() => removeToken(tokenId, tokensInPool)}>
                <Icon name={'RowDelete'} size={16} aria-label={t`Remove token`} />
              </RemoveButton>
            </Box>
          </LabelRow>
        )}
      <SelectTokenButton
        curve={curve}
        haveSigner={haveSigner}
        disabledKeys={disabledTokens}
        chainId={chainId}
        blockchainId={network?.networkId}
        tokens={selTokens}
        selectedAddress={token.address}
        onSelectionChange={(value: Key) => handleInpChange(tokenId, value as string, tokensInPool)}
      />
      {swapType === STABLESWAP && (network.stableswapFactory || network.stableswapFactoryOld) && !token.basePool && (
        <>
          <StableSwapTogglesRow>
            <StyledCheckbox
              isSelected={token.ngAssetType === NG_ASSET_TYPE.STANDARD}
              onChange={() => updateNgAssetType(tokenId, NG_ASSET_TYPE.STANDARD)}
            >{t`Standard`}</StyledCheckbox>
            <StyledCheckbox
              isSelected={token.ngAssetType === NG_ASSET_TYPE.ORACLE}
              onChange={() => updateNgAssetType(tokenId, NG_ASSET_TYPE.ORACLE)}
            >{t`Oracle`}</StyledCheckbox>
            <StyledCheckbox
              isSelected={token.ngAssetType === NG_ASSET_TYPE.REBASING}
              onChange={() => updateNgAssetType(tokenId, NG_ASSET_TYPE.REBASING)}
            >{t`Rebasing`}</StyledCheckbox>
            <StyledCheckbox
              isSelected={token.ngAssetType === NG_ASSET_TYPE.ERC4626}
              onChange={() => updateNgAssetType(tokenId, NG_ASSET_TYPE.ERC4626)}
            >{t`ERC4626`}</StyledCheckbox>
          </StableSwapTogglesRow>
          {token.erc4626.isErc4626 && token.ngAssetType !== NG_ASSET_TYPE.ERC4626 && (
            <WarningBox
              message={t`${token.symbol} is identified as an ERC4626 token, please select ERC4626 as the asset type.`}
            />
          )}
        </>
      )}
    </TokenPickerContainer>
  )
}

const TokenPickerContainer = styled(Box)`
  margin-bottom: var(--spacing-3);
`

const LabelRow = styled(Box)`
  align-items: center;
  color: var(--box--primary--color);
  p {
    font-size: var(--font-size-2);
    margin-bottom: var(--spacing-1);
    margin-left: var(--spacing-2);
  }
`

const StableSwapTogglesRow = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  margin: var(--spacing-2) auto var(--spacing-3) var(--spacing-2);
`

const StyledCheckbox = styled(Checkbox)`
  color: var(--box--primary--color);
  margin-right: var(--spacing-2);
`

const ClearButton = styled(Button)`
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  color: var(--page--text-color);
  opacity: 0.5;
  margin-bottom: var(--spacing-1);
  &:hover:not(:disabled) {
    opacity: 1;
  }
`

const RemoveButton = styled(Button)`
  color: var(--button--background-color);
  margin-bottom: 0.4375rem;
  display: flex;
  align-items: center;
  &:hover:not(:disabled) {
    color: var(--button_filled-hover-contrast--background-color);
  }
`
