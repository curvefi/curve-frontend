import lodash from 'lodash'
import { ReactNode, useMemo } from 'react'
import { styled } from 'styled-components'
import { ChipPool } from '@/dex/components/ChipPool'
import { ChipToken } from '@/dex/components/ChipToken'
import { usePoolAlert } from '@/dex/hooks/usePoolAlert'
import { useTokenAlert } from '@/dex/hooks/useTokenAlert'
import { PoolData, PoolDataCache } from '@/dex/types/main.types'
import type { INetworkName } from '@curvefi/api/lib/interfaces'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { TooltipAlert } from '@ui/Tooltip/TooltipAlert'
import { Chip } from '@ui/Typography'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { TokenIcons } from '@ui-kit/shared/ui/TokenIcons'

type Props = {
  className?: string
  blockchainId: INetworkName
  isVisible?: boolean
  poolData: PoolDataCache | PoolData | undefined
  quickViewValue?: ReactNode
  onClick?: (target: EventTarget) => void
}

export const PoolLabel = ({
  className = '',
  blockchainId,
  isVisible = true,
  poolData,
  quickViewValue,
  onClick,
}: Props) => {
  const { pool } = poolData ?? {}
  const tokens = useMemo(
    () =>
      lodash.zip(poolData?.tokens, poolData?.tokenAddresses).map(([symbol, address]) => ({
        symbol: symbol!,
        address: address!,
      })),
    [poolData?.tokens, poolData?.tokenAddresses],
  )

  const poolAlert = usePoolAlert(poolData)
  const tokenAlert = useTokenAlert(poolData?.tokenAddressesAll ?? [])
  const isMobile = useIsMobile()

  const handleClick = (target: EventTarget) => {
    if (typeof onClick === 'function') {
      const { nodeName } = target as HTMLElement
      if (nodeName !== 'A') {
        // prevent click-through link from tooltip
        onClick(target)
      }
    }
  }

  return (
    <div>
      <Wrapper className={className} onClick={({ target }) => handleClick(target)}>
        <IconsWrapper>{isVisible && <TokenIcons blockchainId={blockchainId} tokens={tokens} />}</IconsWrapper>
        <Box fillWidth>
          <Box flex flexAlignItems="center">
            {!isMobile && (
              <>
                {(poolAlert?.isInformationOnly || poolAlert?.isInformationOnlyAndShowInForm) && (
                  <TooltipAlert minWidth="300px" placement="right-start" {...poolAlert}>
                    {poolAlert.message}
                  </TooltipAlert>
                )}
                {tokenAlert && (
                  <TooltipAlert minWidth="300px" placement="right-start" {...tokenAlert}>
                    {tokenAlert.message}
                  </TooltipAlert>
                )}
              </>
            )}
            {/* isHighlightPoolName = default to true now, even if searched text is not same result */}
            {pool && <ChipPool poolId={pool.id} poolAddress={pool.address} poolName={pool.name} />}
          </Box>

          <PoolLabelTokensWrapper>
            {pool && (
              <div>
                {isMobile
                  ? tokens.map(({ symbol }, idx) => <TokenLabel key={`${symbol}-${idx}`}>{symbol} </TokenLabel>)
                  : isVisible &&
                    tokens.map(({ symbol, address }, idx) => (
                      <ChipToken key={`${symbol}${address}${idx}`} tokenName={symbol} tokenAddress={address} />
                    ))}
              </div>
            )}
          </PoolLabelTokensWrapper>
          {quickViewValue && <Chip>{quickViewValue}</Chip>}
        </Box>
      </Wrapper>

      {tokenAlert && isMobile && <StyledAlertBox alertType={tokenAlert.alertType}>{tokenAlert.message}</StyledAlertBox>}
      {poolAlert && !poolAlert.isPoolPageOnly && (
        <>
          {!poolAlert.isInformationOnly && !poolAlert.isInformationOnlyAndShowInForm ? (
            <Box padding="0.5rem 0 0 0">{poolAlert.message}</Box>
          ) : isMobile ? (
            <StyledAlertBox alertType={poolAlert.alertType}>{poolAlert.message}</StyledAlertBox>
          ) : null}
        </>
      )}
    </div>
  )
}

const IconsWrapper = styled.div`
  min-width: 3.3125rem; // 53px
`

const Wrapper = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr;
  grid-column-gap: var(--spacing-2);
  width: 100%;
`

const PoolLabelTokensWrapper = styled.div`
  min-height: 1.5rem; // 24px;
  max-width: 24.375rem; // 390px
`

const TokenLabel = styled.span`
  font-size: var(--font-size-2);
`

const StyledAlertBox = styled(AlertBox)`
  font-size: var(--font-size-2);
  margin: var(--spacing-2) 0;
  max-height: 100px;
  overflow: scroll;
  max-width: 260px;
`
