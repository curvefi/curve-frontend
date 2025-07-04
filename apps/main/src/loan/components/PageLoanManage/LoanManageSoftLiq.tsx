import { useCallback, useMemo, useState } from 'react'
import { useChainId } from 'wagmi'
import {
  ManageSoftLiquidation,
  type ActionInfosProps,
  type ClosePositionProps,
  type ImproveHealthProps,
} from '@/llamalend/features/manage-soft-liquidation'
import {
  checkCanClose,
  getCollateralInfo,
  getCollateralToRecover,
  getDebtToken,
  getHealthInfo,
  getLoanInfo,
  getTokens,
  parseFloatOptional,
} from '@/llamalend/features/manage-soft-liquidation/helpers'
import { useClosePositionMint } from '@/llamalend/features/manage-soft-liquidation/hooks/mutations/useClosePosition'
import { useRepayMint } from '@/llamalend/features/manage-soft-liquidation/hooks/mutations/useRepay'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import useStore from '@/loan/store/useStore'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

type Props = {
  market: MintMarketTemplate | undefined
}

/** Main component hooking up the manage soft liquidation card. Preferably only this parent component uses loan app specific imports. */
export const LoanManageSoftLiq = ({ market }: Props) => {
  // Internal state
  const [repayBalance, setRepayBalance] = useState(0)

  // User data
  const llammaId = market?.id || ''
  const userLoanDetails = useUserLoanDetails(llammaId)
  const userBalancesRaw = useStore((state) => state.loans.userWalletBalancesMapper[llammaId])
  const userBalances = useMemo(() => userBalancesRaw ?? {}, [userBalancesRaw])
  const { userState } = userLoanDetails ?? {}

  // Loan data
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const { parameters: loanParameters } = loanDetails ?? {}

  // Tokens with usd rates
  const chainId = useChainId()
  const tokens = market && getTokens(market)
  const { data: stablecoinUsdRate } = useTokenUsdRate(
    { chainId, tokenAddress: tokens?.stablecoin?.address },
    !!tokens?.stablecoin?.address,
  )

  const { data: collateralTokenUsdRate } = useTokenUsdRate(
    { chainId, tokenAddress: tokens?.collateral?.address },
    !!tokens?.collateral?.address,
  )

  const stablecoinToken = useMemo(
    () => tokens?.stablecoin && { ...tokens.stablecoin, usdRate: stablecoinUsdRate },
    [tokens?.stablecoin, stablecoinUsdRate],
  )

  const collateralToken = useMemo(
    () => tokens?.collateral && { ...tokens.collateral, usdRate: collateralTokenUsdRate },
    [tokens?.collateral, collateralTokenUsdRate],
  )

  // Properties
  const debtToken = useMemo(() => getDebtToken({ market, userState }), [market, userState])
  const collateralToRecover = useMemo(
    () =>
      getCollateralToRecover({
        userState,
        stablecoinToken,
        collateralToken,
      }),
    [collateralToken, stablecoinToken, userState],
  )
  const canClose = useMemo(() => checkCanClose({ userState, userBalances }), [userBalances, userState])

  // Improve health tab
  const repay = useRepayMint({ market })
  const onRepay = useCallback(() => {
    repay.mutate({ debt: repayBalance.toString() })
  }, [repay, repayBalance])

  const improveHealthTab: ImproveHealthProps = {
    debtToken,
    userBalance: parseFloatOptional(userBalances?.stablecoin),
    status: repay.isPending ? 'repay' : 'idle',
    onDebtBalance: setRepayBalance,
    onRepay,
    onApproveLimited: () => {},
    onApproveInfinite: () => {},
  }

  // Close position tab
  const closePosition = useClosePositionMint({ market })
  const onClose = useCallback(() => {
    closePosition.mutate()
  }, [closePosition])

  const closePositionTab: ClosePositionProps = {
    debtToken,
    collateralToRecover,
    canClose,
    status: closePosition.isPending ? 'close' : 'idle',
    onClose,
  }

  // Action infos
  const health = getHealthInfo({ userLoanDetails })
  const loan = getLoanInfo({
    market,
    loanParameters,
    userState,
    collateralToRecover,
  })
  const collateral = getCollateralInfo({ market, userState })

  const actionInfos: ActionInfosProps = {
    health,
    loan,
    collateral,
    transaction: {
      estimatedTxCost: { eth: 0.0024, gwei: 0.72, dollars: 0.48 },
    },
  }

  return (
    <ManageSoftLiquidation
      actionInfos={actionInfos}
      improveHealth={improveHealthTab}
      closePosition={closePositionTab}
    />
  )
}
