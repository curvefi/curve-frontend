import { styled } from 'styled-components'
import { isAddress } from 'viem'
import {
  NG_ASSET_TYPE,
  TOKEN_A,
  TOKEN_B,
  TOKEN_C,
  TOKEN_D,
  TOKEN_E,
  TOKEN_F,
  TOKEN_G,
  TOKEN_H,
} from '@/dex/components/PageCreatePool/constants'
import {
  CategoryDataRow,
  SummaryDataTitle,
  SummarySubTitle,
  SummaryData,
  SummaryDataPlaceholder,
  AddressLink,
} from '@/dex/components/PageCreatePool/Summary/styles'
import type { TokenState } from '@/dex/components/PageCreatePool/types'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useStore } from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'
import { Icon } from '@ui/Icon'
import { scanAddressPath } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { shortenAddress } from '@ui-kit/utils'

type Props = {
  chainId: ChainId
}

type OracleTokenSummaryProps = {
  chainId: ChainId
  token: TokenState
  title: string
}

export const OracleSummary = ({ chainId }: Props) => {
  const tokens = useStore((state) => state.createPool.tokensInPool)

  const oracleTokens = [
    { token: tokens.tokenA, title: t`Token A`, tokenId: TOKEN_A },
    { token: tokens.tokenB, title: t`Token B`, tokenId: TOKEN_B },
    { token: tokens.tokenC, title: t`Token C`, tokenId: TOKEN_C },
    { token: tokens.tokenD, title: t`Token D`, tokenId: TOKEN_D },
    { token: tokens.tokenE, title: t`Token E`, tokenId: TOKEN_E },
    { token: tokens.tokenF, title: t`Token F`, tokenId: TOKEN_F },
    { token: tokens.tokenG, title: t`Token G`, tokenId: TOKEN_G },
    { token: tokens.tokenH, title: t`Token H`, tokenId: TOKEN_H },
  ].filter(({ token }) => token.ngAssetType === NG_ASSET_TYPE.ORACLE && token.address !== '')

  return (
    <OraclesWrapper>
      {oracleTokens.map(({ token, title, tokenId }) => (
        <OracleTokenSummary key={tokenId} chainId={chainId} token={token} title={title} />
      ))}
    </OraclesWrapper>
  )
}

const OracleTokenSummary = ({ chainId, token, title }: OracleTokenSummaryProps) => {
  const { data: network } = useNetworkByChain({ chainId })
  return (
    <OracleTokenWrapper>
      <CategoryDataRow>
        <SummarySubTitle>{t`${title} ${token.symbol !== '' ? `(${token.symbol})` : ''} Oracle`}</SummarySubTitle>
      </CategoryDataRow>
      <CategoryDataRow>
        <SummaryDataTitle>{t`Address:`}</SummaryDataTitle>
        {token.oracle.address === '' ? (
          <SummaryDataPlaceholder>{t`No address set`}</SummaryDataPlaceholder>
        ) : isAddress(token.oracle.address) ? (
          <SummaryData>
            <AddressLink href={scanAddressPath(network, token.oracle.address)}>
              {shortenAddress(token.oracle.address)}
              <Icon name={'Launch'} size={16} aria-label={t`Link to address`} />
            </AddressLink>
          </SummaryData>
        ) : (
          <SummaryDataPlaceholder>{t`Invalid address`}</SummaryDataPlaceholder>
        )}
      </CategoryDataRow>
      <CategoryDataRow>
        <SummaryDataTitle>{t`Function:`}</SummaryDataTitle>
        {token.oracle.functionName === '' ? (
          <SummaryDataPlaceholder>{t`No function set`}</SummaryDataPlaceholder>
        ) : (
          <SummaryData>{token.oracle.functionName}</SummaryData>
        )}
      </CategoryDataRow>
    </OracleTokenWrapper>
  )
}

const OraclesWrapper = styled.div`
  margin-top: var(--spacing-2);
`

const OracleTokenWrapper = styled.div`
  margin-bottom: var(--spacing-3);
  &:last-child {
    margin-bottom: 0;
  }
`
