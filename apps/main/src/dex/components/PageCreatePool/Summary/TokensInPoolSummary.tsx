import { styled } from 'styled-components'
import {
  STABLESWAP,
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
import { OracleSummary } from '@/dex/components/PageCreatePool/Summary/OracleSummary'
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
} from '@/dex/components/PageCreatePool/Summary/styles'
import { SwapType, TokenState } from '@/dex/components/PageCreatePool/types'
import { checkTokensInPoolUnset, containsOracle } from '@/dex/components/PageCreatePool/utils'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useStore } from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'
import { Box } from '@ui/Box'
import { Icon } from '@ui/Icon'
import { Chip } from '@ui/Typography'
import { scanAddressPath } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { shortenAddress } from '@ui-kit/utils'

type Props = {
  blockchainId: string
  chainId: ChainId
}

type TokenSummary = {
  blockchainId: string
  token: TokenState
  chainId: ChainId
  swapType: SwapType
}

export const TokensInPoolSummary = ({ blockchainId, chainId }: Props) => {
  const tokensInPool = useStore((state) => state.createPool.tokensInPool)
  const swapType = useStore((state) => state.createPool.swapType)
  const validation = useStore((state) => state.createPool.validation)

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
          tokensInPool[TOKEN_H],
        ) && (
          <Box flex flexAlignItems="center">
            <StyledBWButtonTokenIcon />
            <SummaryDataPlaceholder>{t`No tokens selected`}</SummaryDataPlaceholder>
          </Box>
        )}
        {tokensInPool[TOKEN_A].address === '' ? (
          ''
        ) : (
          <TokenSummary
            blockchainId={blockchainId}
            token={tokensInPool[TOKEN_A]}
            chainId={chainId}
            swapType={swapType}
          />
        )}
        {tokensInPool[TOKEN_B].address === '' ? (
          ''
        ) : (
          <TokenSummary
            blockchainId={blockchainId}
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
              blockchainId={blockchainId}
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
              blockchainId={blockchainId}
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
              blockchainId={blockchainId}
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
              blockchainId={blockchainId}
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
              blockchainId={blockchainId}
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
              blockchainId={blockchainId}
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

const TokenSummary = ({ blockchainId, token, chainId, swapType }: TokenSummary) => {
  const { data: network } = useNetworkByChain({ chainId })
  return (
    <TokenRow>
      <ButtonTokenIcon blockchainId={blockchainId} tooltip={token.symbol} address={token.address} />
      <Box flex flexColumn>
        <TokenSymbol className="token-symbol">
          {token.symbol}
          {token.basePool && swapType === STABLESWAP && <BasepoolLabel>{t`BASE`}</BasepoolLabel>}
        </TokenSymbol>
        {swapType === STABLESWAP && network.stableswapFactory && (
          <TokenType>
            {token.ngAssetType === NG_ASSET_TYPE.STANDARD && t`Standard`}
            {token.ngAssetType === NG_ASSET_TYPE.ORACLE && t`Oracle`}
            {token.ngAssetType === NG_ASSET_TYPE.REBASING && t`Rebasing`}
            {token.ngAssetType === NG_ASSET_TYPE.ERC4626 && t`ERC4626`}
          </TokenType>
        )}
      </Box>
      <AddressLink href={scanAddressPath(network, token.address)}>
        {shortenAddress(token.address)}
        <Icon name={'Launch'} size={16} aria-label={t`Link to address`} />
      </AddressLink>
    </TokenRow>
  )
}

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
