import { SwapType, TokenState } from '@/components/PageCreatePool/types'
import { STABLESWAP } from '@/components/PageCreatePool/constants'

import { t } from '@lingui/macro'
import { shortenTokenAddress } from '@/utils'
import networks from '@/networks'
import styled from 'styled-components'

import useStore from '@/store/useStore'

import { checkTokensInPoolUnset, containsOracle } from '@/components/PageCreatePool/utils'
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

import {
  CategoryColumn,
  CategoryDataColumn,
  SummaryCategoryTitle,
  SummaryDataPlaceholder,
  StyledCheckmark,
  TokenRow,
  TokenSymbol,
  AddressLink,
  ButtonTokenIcon,
  TokenType,
} from '@/components/PageCreatePool/Summary/styles'
import OracleSummary from '@/components/PageCreatePool/Summary/OracleSummary'
import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import { Chip } from '@/ui/Typography'

type Props = {
  imageBaseUrl: string
  chainId: ChainId
}

type TokenSummary = {
  imageBaseUrl: string
  token: TokenState
  chainId: ChainId
  swapType: SwapType
}

const TokensInPoolSummary = ({ imageBaseUrl, chainId }: Props) => {
  const { tokensInPool, swapType, validation } = useStore((state) => state.createPool)

  return (
    <CategoryColumn>
      <Box flex>
        {validation.tokensInPool && (
          <StyledCheckmark name={'CheckmarkFilled'} size={16} aria-label={t`Checkmark filled`} />
        )}
        <SummaryCategoryTitle>{t`Tokens In Pool:`}</SummaryCategoryTitle>
      </Box>
      <CategoryDataColumn>
        {!checkTokensInPoolUnset(
          tokensInPool[TOKEN_A],
          tokensInPool[TOKEN_B],
          tokensInPool[TOKEN_C],
          tokensInPool[TOKEN_D],
          tokensInPool[TOKEN_E],
          tokensInPool[TOKEN_F],
          tokensInPool[TOKEN_G],
          tokensInPool[TOKEN_H]
        ) && (
          <Box flex flexAlignItems="center">
            <StyledBWButtonTokenIcon imageBaseUrl={''} token={''} address={''} />
            <SummaryDataPlaceholder>{t`No tokens selected`}</SummaryDataPlaceholder>
          </Box>
        )}
        {tokensInPool[TOKEN_A].address === '' ? (
          ''
        ) : (
          <TokenSummary
            imageBaseUrl={imageBaseUrl}
            token={tokensInPool[TOKEN_A]}
            chainId={chainId}
            swapType={swapType}
          />
        )}
        {tokensInPool[TOKEN_B].address === '' ? (
          ''
        ) : (
          <TokenSummary
            imageBaseUrl={imageBaseUrl}
            token={tokensInPool[TOKEN_B]}
            chainId={chainId}
            swapType={swapType}
          />
        )}
        {tokensInPool.tokenAmount > 2 ? (
          tokensInPool[TOKEN_C].address === '' ? (
            ''
          ) : (
            <TokenSummary
              imageBaseUrl={imageBaseUrl}
              token={tokensInPool[TOKEN_C]}
              chainId={chainId}
              swapType={swapType}
            />
          )
        ) : (
          ''
        )}
        {tokensInPool.tokenAmount > 3 ? (
          tokensInPool[TOKEN_D].address === '' ? (
            ''
          ) : (
            <TokenSummary
              imageBaseUrl={imageBaseUrl}
              token={tokensInPool[TOKEN_D]}
              chainId={chainId}
              swapType={swapType}
            />
          )
        ) : (
          ''
        )}
        {tokensInPool.tokenAmount > 4 ? (
          tokensInPool[TOKEN_E].address === '' ? (
            ''
          ) : (
            <TokenSummary
              imageBaseUrl={imageBaseUrl}
              token={tokensInPool[TOKEN_E]}
              chainId={chainId}
              swapType={swapType}
            />
          )
        ) : (
          ''
        )}
        {tokensInPool.tokenAmount > 5 ? (
          tokensInPool[TOKEN_F].address === '' ? (
            ''
          ) : (
            <TokenSummary
              imageBaseUrl={imageBaseUrl}
              token={tokensInPool[TOKEN_F]}
              chainId={chainId}
              swapType={swapType}
            />
          )
        ) : (
          ''
        )}
        {tokensInPool.tokenAmount > 6 ? (
          tokensInPool[TOKEN_G].address === '' ? (
            ''
          ) : (
            <TokenSummary
              imageBaseUrl={imageBaseUrl}
              token={tokensInPool[TOKEN_G]}
              chainId={chainId}
              swapType={swapType}
            />
          )
        ) : (
          ''
        )}
        {tokensInPool.tokenAmount > 7 ? (
          tokensInPool[TOKEN_H].address === '' ? (
            ''
          ) : (
            <TokenSummary
              imageBaseUrl={imageBaseUrl}
              token={tokensInPool[TOKEN_H]}
              chainId={chainId}
              swapType={swapType}
            />
          )
        ) : (
          ''
        )}
      </CategoryDataColumn>
      {swapType === STABLESWAP &&
        containsOracle([
          tokensInPool[TOKEN_A],
          tokensInPool[TOKEN_B],
          tokensInPool[TOKEN_C],
          tokensInPool[TOKEN_D],
          tokensInPool[TOKEN_E],
          tokensInPool[TOKEN_F],
          tokensInPool[TOKEN_G],
          tokensInPool[TOKEN_H],
        ]) && <OracleSummary chainId={chainId} />}
    </CategoryColumn>
  )
}

const TokenSummary = ({ imageBaseUrl, token, chainId, swapType }: TokenSummary) => (
  <TokenRow>
    <ButtonTokenIcon imageBaseUrl={imageBaseUrl} token={token.symbol} address={token.address} />
    <Box flex flexColumn>
      <TokenSymbol className="token-symbol">
        {token.symbol}
        {token.basePool && swapType === STABLESWAP && <BasepoolLabel>{t`BASE`}</BasepoolLabel>}
      </TokenSymbol>
      {swapType === STABLESWAP && networks[chainId].stableswapFactory && (
        <TokenType>
          {token.ngAssetType === 0 && t`Standard`}
          {token.ngAssetType === 1 && t`Oracle`}
          {token.ngAssetType === 2 && t`Rebasing`}
          {token.ngAssetType === 3 && t`ERC4626`}
        </TokenType>
      )}
    </Box>
    <AddressLink href={networks[chainId].scanAddressPath(token.address)}>
      {shortenTokenAddress(token.address)}
      <Icon name={'Launch'} size={16} aria-label={t`Link to address`} />
    </AddressLink>
  </TokenRow>
)

const StyledBWButtonTokenIcon = styled(ButtonTokenIcon)`
  filter: grayscale(100%);
  opacity: 0.5;
`

const BasepoolLabel = styled(Chip)`
  margin: auto 0 auto var(--spacing-1);
  font-weight: var(--bold);
  font-size: var(--font-size-1);
  padding: 0 2px;
  background-color: var(--warning-400);
  color: var(--black);
  letter-spacing: 0;
`

export default TokensInPoolSummary
