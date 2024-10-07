import type { TokenState, TokenId } from '@/components/PageCreatePool/types'

import styled from 'styled-components'
import { t } from '@lingui/macro'
import { debounce } from 'lodash'

import useStore from '@/store/useStore'

import TextInput from '@/components/PageCreatePool/components/TextInput'
import Box from '@/ui/Box'
import WarningBox from '@/components/PageCreatePool/components/WarningBox'
import {
  TOKEN_A,
  TOKEN_B,
  TOKEN_C,
  TOKEN_D,
  TOKEN_E,
  TOKEN_F,
  TOKEN_G,
  TOKEN_H,
} from '@/components/PageCreatePool/constants'
import { validateOracleFunction } from '@/components/PageCreatePool/utils'

type OracleInputProps = {
  token: TokenState
  tokenId: TokenId
  title: string
}

const SetOracle = () => {
  const { tokenA, tokenB, tokenC, tokenD, tokenE, tokenF, tokenG, tokenH } = useStore(
    (state) => state.createPool.tokensInPool
  )

  return (
    <OracleWrapper>
      {tokenA.ngAssetType === 1 && tokenA.address !== '' && (
        <OracleInputs token={tokenA} tokenId={TOKEN_A} title={t`Token A`} />
      )}
      {tokenB.ngAssetType === 1 && tokenB.address !== '' && (
        <OracleInputs token={tokenB} tokenId={TOKEN_B} title={t`Token B`} />
      )}
      {tokenC.ngAssetType === 1 && tokenC.address !== '' && (
        <OracleInputs token={tokenC} tokenId={TOKEN_C} title={t`Token C`} />
      )}
      {tokenD.ngAssetType === 1 && tokenD.address !== '' && (
        <OracleInputs token={tokenD} tokenId={TOKEN_D} title={t`Token D`} />
      )}
      {tokenD.ngAssetType === 1 && tokenD.address !== '' && (
        <OracleInputs token={tokenE} tokenId={TOKEN_E} title={t`Token E`} />
      )}
      {tokenD.ngAssetType === 1 && tokenD.address !== '' && (
        <OracleInputs token={tokenF} tokenId={TOKEN_F} title={t`Token F`} />
      )}
      {tokenD.ngAssetType === 1 && tokenD.address !== '' && (
        <OracleInputs token={tokenG} tokenId={TOKEN_G} title={t`Token G`} />
      )}
      {tokenD.ngAssetType === 1 && tokenD.address !== '' && (
        <OracleInputs token={tokenH} tokenId={TOKEN_H} title={t`Token H`} />
      )}
    </OracleWrapper>
  )
}

const OracleInputs = ({ token, tokenId, title }: OracleInputProps) => {
  const updateOracleAddress = useStore((state) => state.createPool.updateOracleAddress)
  const updateOracleFunction = useStore((state) => state.createPool.updateOracleFunction)

  return (
    <InputContainer>
      <TokenTitle>{t`${title} ${token.symbol !== '' ? `(${token.symbol})` : ''} Oracle`}</TokenTitle>
      <TextInput
        row
        defaultValue={token.oracleAddress}
        onChange={debounce((value) => updateOracleAddress(tokenId, value), 300)}
        maxLength={42}
        label={t`Address (e.g 0x123...)`}
      />
      {token.oracleAddress.length !== 0 && !token.oracleAddress.startsWith('0x') && (
        <WarningBox message={t`Oracle address needs to start with '0x'.`} />
      )}
      {token.oracleAddress.length !== 0 && token.oracleAddress.length < 42 && (
        <WarningBox message={t`Oracle address needs to be 42 characters long.`} />
      )}
      <TextInput
        row
        defaultValue={token.oracleFunction}
        onChange={debounce((value) => updateOracleFunction(tokenId, value), 300)}
        maxLength={42}
        label={t`Function (e.g exchangeRate())`}
      />
      {token.oracleFunction !== '' && !validateOracleFunction(token.oracleFunction) && (
        <WarningBox message={t`Oracle function name needs to end with '()'.`} />
      )}
      <WarningBox message={t`Oracle must have a precision of 18 decimals.`} informational />
    </InputContainer>
  )
}

const InputContainer = styled(Box)`
  margin-bottom: var(--spacing-4);
`

const TokenTitle = styled.h4`
  color: var(--box--primary--color);
  font-size: var(--font-size-2);
  margin-bottom: var(--spacing-2);
  margin-left: var(--spacing-2);
`

const OracleWrapper = styled(Box)`
  padding-top: var(--spacing-4);
  margin: var(--spacing-wide) 0;
`

export default SetOracle
