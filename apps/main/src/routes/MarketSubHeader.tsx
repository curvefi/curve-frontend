import { useOneWayMarket } from '@/lend/entities/chain'
import { useMarketDetails as useLendMarketDetails } from '@/lend/hooks/useMarketDetails'
import { networksIdMapper, networks as lendNetworks } from '@/lend/networks'
import type { MarketUrlParams } from '@/lend/types/lend.types'
import { PageHeader } from '@/llamalend/widgets/page-header'
import { useMintMarket } from '@/loan/entities/mint-markets'
import { useMarketDetails as useMintMarketDetails } from '@/loan/hooks/useMarketDetails'
import type { CollateralUrlParams } from '@/loan/types/loan.types'
import { useChainId } from '@/loan/utils/utilsRouter'
import type { Chain } from '@curvefi/prices-api'
import Box from '@mui/material/Box'
import { useParams } from '@ui-kit/hooks/router'

type AllMarketParams = Partial<MarketUrlParams & CollateralUrlParams>

export const MarketSubHeader = () => {
  const { network, market, collateralId } = useParams<AllMarketParams>()
  if (!network) return null
  if (market) return <LendMarketSubHeader network={network} market={market} />
  if (collateralId) return <MintMarketSubHeader network={network} collateralId={collateralId} />
  return null
}

const LendMarketSubHeader = ({ network, market }: MarketUrlParams) => {
  const chainId = networksIdMapper[network]
  const rMarket = market.toLowerCase()
  const { data: marketData, isSuccess } = useOneWayMarket(chainId, rMarket)
  const marketId = marketData?.id ?? ''
  const { borrowRate, supplyRate, availableLiquidity } = useLendMarketDetails({
    chainId,
    market: marketData,
    marketId,
  })
  const blockchainId = lendNetworks[chainId]?.id as Chain

  return (
    <SubHeaderWrapper>
      <PageHeader
        isLoading={!isSuccess || !marketData}
        market={marketData}
        blockchainId={blockchainId}
        borrowRate={borrowRate}
        supplyRate={supplyRate}
        availableLiquidity={availableLiquidity}
      />
    </SubHeaderWrapper>
  )
}

const MintMarketSubHeader = ({ network, collateralId }: CollateralUrlParams) => {
  const chainId = useChainId({ network })
  const rCollateralId = collateralId.toLowerCase()
  const market = useMintMarket({ chainId, marketId: rCollateralId })
  const marketId = market?.id ?? ''
  const { blockchainId, borrowRate, availableLiquidity } = useMintMarketDetails({
    chainId,
    llamma: market,
    llammaId: marketId,
  })

  return (
    <SubHeaderWrapper>
      <PageHeader
        isLoading={!market}
        market={market ?? undefined}
        blockchainId={blockchainId as Chain}
        borrowRate={borrowRate}
        availableLiquidity={availableLiquidity}
      />
    </SubHeaderWrapper>
  )
}

const SubHeaderWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box
    display="flex"
    justifyContent="center"
    width="100%"
    sx={{
      borderBottom: (t) => `1px solid ${t.design.Layer[1].Outline}`,
    }}
  >
    <Box sx={{ maxWidth: `var(--width)`, width: '100%' }}>{children}</Box>
  </Box>
)
