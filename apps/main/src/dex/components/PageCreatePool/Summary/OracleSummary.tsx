import { styled } from 'styled-components'
import { isAddress } from 'viem'
import { NG_ASSET_TYPE } from '@/dex/components/PageCreatePool/constants'
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
import useStore from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'
import Icon from '@ui/Icon'
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

const OracleSummary = ({ chainId }: Props) => {
  const tokenA = useStore((state) => state.createPool.tokensInPool.tokenA)
  const tokenB = useStore((state) => state.createPool.tokensInPool.tokenB)
  const tokenC = useStore((state) => state.createPool.tokensInPool.tokenC)
  const tokenD = useStore((state) => state.createPool.tokensInPool.tokenD)
  const tokenE = useStore((state) => state.createPool.tokensInPool.tokenE)
  const tokenF = useStore((state) => state.createPool.tokensInPool.tokenF)
  const tokenG = useStore((state) => state.createPool.tokensInPool.tokenG)
  const tokenH = useStore((state) => state.createPool.tokensInPool.tokenH)

  return (
    <OraclesWrapper>
      {tokenA.ngAssetType === NG_ASSET_TYPE.ORACLE && tokenA.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenA} title={t`Token A`} />
      )}
      {tokenB.ngAssetType === NG_ASSET_TYPE.ORACLE && tokenB.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenB} title={t`Token B`} />
      )}
      {tokenC.ngAssetType === NG_ASSET_TYPE.ORACLE && tokenC.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenC} title={t`Token C`} />
      )}
      {tokenD.ngAssetType === NG_ASSET_TYPE.ORACLE && tokenD.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenD} title={t`Token D`} />
      )}
      {tokenD.ngAssetType === NG_ASSET_TYPE.ORACLE && tokenE.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenE} title={t`Token E`} />
      )}
      {tokenD.ngAssetType === NG_ASSET_TYPE.ORACLE && tokenF.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenF} title={t`Token F`} />
      )}
      {tokenD.ngAssetType === NG_ASSET_TYPE.ORACLE && tokenG.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenG} title={t`Token G`} />
      )}
      {tokenD.ngAssetType === NG_ASSET_TYPE.ORACLE && tokenH.address !== '' && (
        <OracleTokenSummary chainId={chainId} token={tokenH} title={t`Token H`} />
      )}
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
        {token.oracleAddress === '' ? (
          <SummaryDataPlaceholder>{t`No address set`}</SummaryDataPlaceholder>
        ) : isAddress(token.oracleAddress) ? (
          <SummaryData>
            <AddressLink href={scanAddressPath(network, token.oracleAddress)}>
              {shortenAddress(token.oracleAddress)}
              <Icon name={'Launch'} size={16} aria-label={t`Link to address`} />
            </AddressLink>
          </SummaryData>
        ) : (
          <SummaryDataPlaceholder>{t`Invalid address`}</SummaryDataPlaceholder>
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
