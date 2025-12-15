import BigNumber from 'bignumber.js'
import lodash from 'lodash'
import { useMemo } from 'react'
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
import { useOracleValidation } from '@/dex/components/PageCreatePool/hooks/useOracleValidation'
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

  const { isLoading, isSuccess, error, rate, decimals } = useOracleValidation({ token, tokenId })

  const formattedRate = useMemo(() => {
    if (!isSuccess || !rate) return null
    const dec = decimals ?? 18
    if (dec === 18) return rate
    return new BigNumber(rate).dividedBy(new BigNumber(10).pow(dec)).toString()
  }, [decimals, rate, isSuccess])

  return (
    <InputContainer>
      <TokenTitle>{t`${title} ${token.symbol !== '' ? `(${token.symbol})` : ''} Oracle`}</TokenTitle>
      <TextInput
        row
        defaultValue={token.oracle.address}
        onChange={lodash.debounce((value) => updateOracleAddress(tokenId, value), 300)}
        maxLength={42}
        label={t`Address (e.g 0x123...)`}
      />
      {token.oracle.address.length !== 0 && !token.oracle.address.startsWith('0x') && (
        <WarningBox message={t`Oracle address needs to start with '0x'.`} />
      )}
      {token.oracle.address.length !== 0 && token.oracle.address.length < 42 && (
        <WarningBox message={t`Oracle address needs to be 42 characters long.`} />
      )}
      {token.oracle.address.length === 42 && !isAddress(token.oracle.address) && (
        <WarningBox message={t`Invalid EVM address.`} />
      )}
      <TextInput
        row
        defaultValue={token.oracle.functionName}
        onChange={lodash.debounce((value) => updateOracleFunction(tokenId, value), 300)}
        maxLength={42}
        label={t`Function (e.g exchangeRate())`}
      />
      {token.oracle.functionName !== '' && !validateOracleFunction(token.oracle.functionName) && (
        <WarningBox message={t`Oracle function name needs to end with '()'.`} />
      )}
      <WarningBox message={t`Oracle must have a precision of 18 decimals.`} informational />
      {isLoading && <WarningBox message={t`Validating oracle...`} informational />}
      {error && <WarningBox message={t`Unable to validate oracle.`} />}
      {isSuccess && formattedRate !== null && (
        <OracleRate>
          <span>
            {t`Oracle rate:`} {formattedRate}
          </span>
          <span>
            {t`Decimals:`} {decimals ?? 18}
          </span>
        </OracleRate>
      )}
    </InputContainer>
  )
}

const InputContainer = styled(Box)`
  margin-bottom: var(--spacing-4);
`

const OracleRate = styled(Box)`
  margin-top: var(--spacing-2);
  color: var(--text-secondary);
  font-size: var(--font-size-1);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
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
