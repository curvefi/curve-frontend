import lodash from 'lodash'
import { styled } from 'styled-components'
import { isAddress } from 'viem'
import TextInput from '@/dex/components/PageCreatePool/components/TextInput'
import WarningBox from '@/dex/components/PageCreatePool/components/WarningBox'
import {
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
import type { TokenState, TokenId } from '@/dex/components/PageCreatePool/types'
import { validateOracleFunction } from '@/dex/components/PageCreatePool/utils'
import useStore from '@/dex/store/useStore'
import Box from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'

type OracleInputProps = {
  token: TokenState
  tokenId: TokenId
  title: string
}

const SetOracle = () => {
  const tokens = useStore((state) => state.createPool.tokensInPool)

  const oracleTokens: { token: TokenState; tokenId: TokenId; title: string }[] = [
    { token: tokens.tokenA, tokenId: TOKEN_A as TokenId, title: t`Token A` },
    { token: tokens.tokenB, tokenId: TOKEN_B as TokenId, title: t`Token B` },
    { token: tokens.tokenC, tokenId: TOKEN_C as TokenId, title: t`Token C` },
    { token: tokens.tokenD, tokenId: TOKEN_D as TokenId, title: t`Token D` },
    { token: tokens.tokenE, tokenId: TOKEN_E as TokenId, title: t`Token E` },
    { token: tokens.tokenF, tokenId: TOKEN_F as TokenId, title: t`Token F` },
    { token: tokens.tokenG, tokenId: TOKEN_G as TokenId, title: t`Token G` },
    { token: tokens.tokenH, tokenId: TOKEN_H as TokenId, title: t`Token H` },
  ].filter(({ token }) => token.ngAssetType === NG_ASSET_TYPE.ORACLE && token.address !== '')

  return (
    <OracleWrapper>
      {oracleTokens.map(({ token, tokenId, title }) => (
        <OracleInputs key={tokenId} token={token} tokenId={tokenId} title={title} />
      ))}
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
        onChange={lodash.debounce((value) => updateOracleAddress(tokenId, value), 300)}
        maxLength={42}
        label={t`Address (e.g 0x123...)`}
      />
      {token.oracleAddress.length !== 0 && !token.oracleAddress.startsWith('0x') && (
        <WarningBox message={t`Oracle address needs to start with '0x'.`} />
      )}
      {token.oracleAddress.length !== 0 && token.oracleAddress.length < 42 && (
        <WarningBox message={t`Oracle address needs to be 42 characters long.`} />
      )}
      {token.oracleAddress.length === 42 && !isAddress(token.oracleAddress) && (
        <WarningBox message={t`Invalid EVM address.`} />
      )}
      <TextInput
        row
        defaultValue={token.oracleFunction}
        onChange={lodash.debounce((value) => updateOracleFunction(tokenId, value), 300)}
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
