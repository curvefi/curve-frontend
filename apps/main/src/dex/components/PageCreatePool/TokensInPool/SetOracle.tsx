import lodash from 'lodash'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import { isAddress, formatEther } from 'viem'
import { TextInput } from '@/dex/components/PageCreatePool/components/TextInput'
import { WarningBox } from '@/dex/components/PageCreatePool/components/WarningBox'
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
  ORACLE_DECIMALS,
} from '@/dex/components/PageCreatePool/constants'
import { useOracleValidation } from '@/dex/components/PageCreatePool/hooks/useOracleValidation'
import type { TokenState, TokenId } from '@/dex/components/PageCreatePool/types'
import { validateOracleFunction } from '@/dex/components/PageCreatePool/utils'
import { useStore } from '@/dex/store/useStore'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type OracleInputProps = {
  token: TokenState
  tokenId: TokenId
  title: string
}

export const SetOracle = () => {
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

  const oracleFunction = token.oracle.functionName
  const oracleAddress = token.oracle.address

  const { isLoading, isSuccess, error, rate, decimals } = useOracleValidation({ token, tokenId })

  const formattedRate = useMemo(() => {
    if (!isSuccess || !rate) return null
    return formatNumber(Number(formatEther(BigInt(rate))), {
      abbreviate: false,
    })
  }, [rate, isSuccess])

  const unableToValidateDecimals = !isLoading && isSuccess && decimals === undefined

  return (
    <InputContainer>
      <TokenTitle>{t`${title} ${token.symbol !== '' ? `(${token.symbol})` : ''} Oracle`}</TokenTitle>
      <TextInput
        row
        defaultValue={oracleAddress}
        onChange={lodash.debounce((value) => updateOracleAddress(tokenId, value), 300)}
        maxLength={42}
        label={t`Address (e.g 0x123...)`}
      />
      {!isAddress(oracleAddress) && oracleAddress.length > 0 && (
        <WarningBox message={t`Invalid EVM address. Needs to start with '0x', needs to be 42 characters long.`} />
      )}
      <TextInput
        row
        defaultValue={oracleFunction}
        onChange={lodash.debounce((value) => updateOracleFunction(tokenId, value), 300)}
        maxLength={42}
        label={t`Function (e.g exchangeRate())`}
      />
      {oracleFunction !== '' && !validateOracleFunction(oracleFunction) && (
        <WarningBox message={t`Oracle function name needs to end with '()'.`} />
      )}
      {decimals !== ORACLE_DECIMALS && oracleFunction !== '' && !isLoading && !error && !unableToValidateDecimals && (
        <WarningBox message={t`Oracle must have a precision of ${ORACLE_DECIMALS} decimals.`} informational />
      )}
      {isLoading && <WarningBox message={t`Validating oracle...`} informational />}
      {error && <WarningBox message={t`Unable to validate oracle.`} />}
      {unableToValidateDecimals && (
        <WarningBox
          message={t`Unable to verify decimals. Please make sure oracle rate is returned in 18 decimal precision before proceeding.`}
        />
      )}
      {isSuccess && formattedRate !== null && (
        <Alert severity="info" variant="standard" sx={{ marginTop: Spacing.sm }}>
          <Stack gap={Spacing.xs}>
            <Typography variant="bodySRegular">
              {t`Oracle rate:`} {formattedRate}
            </Typography>
            <Typography variant="bodySRegular">
              {t`Decimals:`} {decimals ?? t`Not available`}
            </Typography>
            <Typography variant="bodySRegular">
              {t`Raw rate:`} {rate}
            </Typography>
          </Stack>
        </Alert>
      )}
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
