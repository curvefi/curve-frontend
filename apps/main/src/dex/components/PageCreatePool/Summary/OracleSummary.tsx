import styled from 'styled-components'
import { getAddress } from 'viem'
import {
  CategoryDataRow,
  SummaryDataTitle,
  SummarySubTitle,
  SummaryData,
  SummaryDataPlaceholder,
  AddressLink,
} from '@/dex/components/PageCreatePool/Summary/styles'
import type { TokenState } from '@/dex/components/PageCreatePool/types'
import useStore from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'
import Icon from '@ui/Icon'
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

const OracleSummary = ({ chainId }: Props) => {
  const { tokenA, tokenB, tokenC, tokenD, tokenE, tokenF, tokenG, tokenH } = useStore(
    (state) => state.createPool.tokensInPool,
  )

  return (
    <OraclesWrapper>
      {tokenA.ngAssetType === 1 && tokenA.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenA} title={t`Token A`} />
      )}
      {tokenB.ngAssetType === 1 && tokenB.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenB} title={t`Token B`} />
      )}
      {tokenC.ngAssetType === 1 && tokenC.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenC} title={t`Token C`} />
      )}
      {tokenD.ngAssetType === 1 && tokenD.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenD} title={t`Token D`} />
      )}
      {tokenD.ngAssetType === 1 && tokenE.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenE} title={t`Token E`} />
      )}
      {tokenD.ngAssetType === 1 && tokenF.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenF} title={t`Token F`} />
      )}
      {tokenD.ngAssetType === 1 && tokenG.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenG} title={t`Token G`} />
      )}
      {tokenD.ngAssetType === 1 && tokenH.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenH} title={t`Token H`} />
      )}
    </OraclesWrapper>
  )
}

const OracleTokenSummary = ({ chainId, token, title }: OracleTokenSummaryProps) => {
  const network = useStore((state) => state.networks.networks[chainId])
  return (
    <OracleTokenWrapper>
      <CategoryDataRow>
        <SummarySubTitle>{t`${title} ${token.symbol !== '' ? `(${token.symbol})` : ''} Oracle`}</SummarySubTitle>
      </CategoryDataRow>
      <CategoryDataRow>
        <SummaryDataTitle>{t`Address:`}</SummaryDataTitle>
        {token.oracleAddress === '' ? (
          <SummaryDataPlaceholder>{t`No address set`}</SummaryDataPlaceholder>
        ) : (
          <SummaryData>
            {token.oracleAddress.length === 42 ? (
              <AddressLink $noCap href={network.scanAddressPath(token.oracleAddress)}>
                {shortenAddress(token.oracleAddress)}
                <Icon name={'Launch'} size={16} aria-label={t`Link to address`} />
              </AddressLink>
            ) : token.oracleAddress.length > 13 ? (
              shortenAddress(token.oracleAddress)
            ) : (
              getAddress(token.oracleAddress)
            )}
          </SummaryData>
        )}
      </CategoryDataRow>
      <CategoryDataRow>
        <SummaryDataTitle>{t`Function:`}</SummaryDataTitle>
        {token.oracleFunction === '' ? (
          <SummaryDataPlaceholder>{t`No function set`}</SummaryDataPlaceholder>
        ) : (
          <SummaryData>{token.oracleFunction}</SummaryData>
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

export default OracleSummary
