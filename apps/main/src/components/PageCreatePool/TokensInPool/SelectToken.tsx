import { CreateToken, TokenState, TokenId, SelectTokenFormValues } from '@/components/PageCreatePool/types'

import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import networks from '@/networks'

import { STABLESWAP, CRYPTOSWAP, TOKEN_A, TOKEN_B, TOKEN_C, TOKEN_D } from '@/components/PageCreatePool/constants'

import ComboBoxTokenPicker from '@/components/PageCreatePool/SelectTokenModal/ComboBoxTokenPicker'
import Box from '@/ui/Box'
import Checkbox from '@/ui/Checkbox'
import Icon from '@/ui/Icon'
import Button from '@/ui/Button'

type Props = {
  curve: CurveApi
  haveSigner: boolean
  chainId: ChainId
  tokenId: TokenId
  token: TokenState
  tokenTitle: string
  disabledTokens: string[]
  selTokens: CreateToken[]
  handleInpChange: (name: keyof SelectTokenFormValues, value: string) => void
  removeToken?: (tokenId: TokenId) => void
}

const SelectToken = ({
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
  const { updateNgAssetType, swapType } = useStore((state) => state.createPool)

  return (
    <TokenPickerContainer>
      {(tokenId === TOKEN_A || tokenId === TOKEN_B) && (
        <LabelRow>
          <p className="extra-margin">{tokenTitle}</p>
        </LabelRow>
      )}
      {tokenId === TOKEN_C && (
        <LabelRow flex flexJustifyContent={'space-between'}>
          <p>{t`Token C`}</p>
          {((swapType === CRYPTOSWAP && networks[chainId].cryptoSwapFactory) || swapType === STABLESWAP) &&
            removeToken && (
              <RemoveButton variant={'text'} onClick={() => removeToken(TOKEN_C)}>
                <Icon name={'RowDelete'} size={16} aria-label={t`Remove token`} />
              </RemoveButton>
            )}
        </LabelRow>
      )}
      {tokenId === TOKEN_D && removeToken && (
        <LabelRow flex flexJustifyContent={'space-between'}>
          <p>{t`Token D`}</p>
          <RemoveButton variant={'text'} onClick={() => removeToken(TOKEN_D)}>
            <Icon name={'RowDelete'} size={16} aria-label={t`Remove token`} />
          </RemoveButton>
        </LabelRow>
      )}
      <ComboBoxTokenPicker
        curve={curve}
        haveSigner={haveSigner}
        disabledKeys={disabledTokens}
        chainId={chainId}
        imageBaseUrl={networks[chainId]?.imageBaseUrl || ''}
        tokens={selTokens}
        selectedAddress={token.address}
        onSelectionChange={(value: React.Key) => handleInpChange(tokenId, value as string)}
      />
      {swapType === STABLESWAP && networks[chainId].stableSwapNg && !token.basePool && (
        <StableSwapTogglesRow>
          <StyledCheckbox
            isSelected={token.ngAssetType === 0}
            onChange={() => updateNgAssetType(tokenId, 0)}
            isDisabled={false}
          >{t`Standard`}</StyledCheckbox>
          <StyledCheckbox
            isSelected={token.ngAssetType === 1}
            isDisabled={false}
            onChange={() => updateNgAssetType(tokenId, 1)}
          >{t`Oracle`}</StyledCheckbox>
          <StyledCheckbox
            isSelected={token.ngAssetType === 2}
            onChange={() => updateNgAssetType(tokenId, 2)}
            isDisabled={false}
          >{t`Rebasing`}</StyledCheckbox>
          <StyledCheckbox
            isSelected={token.ngAssetType === 3}
            isDisabled={false}
            onChange={() => updateNgAssetType(tokenId, 3)}
          >{t`ERC4626`}</StyledCheckbox>
        </StableSwapTogglesRow>
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
    margin-bottom: var(--spacing-2);
    margin-left: var(--spacing-2);
  }
  .extra-margin {
    margin-bottom: var(--spacing-narrow);
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

const RemoveButton = styled(Button)`
  color: var(--button--background-color);
  margin-bottom: var(--spacing-1);
  display: flex;
  align-items: center;
  &:hover:not(:disabled) {
    color: var(--button_filled-hover-contrast--background-color);
  }
`

export default SelectToken
