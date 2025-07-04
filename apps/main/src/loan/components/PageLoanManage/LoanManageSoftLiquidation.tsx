import { useCallback, useMemo, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
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
} from '@/llamalend/features/manage-soft-liquidation/helpers'
import { useClosePosition } from '@/llamalend/features/manage-soft-liquidation/mutations/useClosePosition'
import { useRepay } from '@/llamalend/features/manage-soft-liquidation/mutations/useRepay'
import { getLlamaMarket, getTokens } from '@/llamalend/llama.utils'
import { useUserBalances } from '@/llamalend/queries/user-balances.query'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import useStore from '@/loan/store/useStore'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

type LoanManageSoftLiquidationProps = {
  marketId: string | undefined
}

/** Main component hooking up the manage soft liquidation card. Preferably only this parent component uses loan app specific imports. */
export const LoanManageSoftLiquidation = ({ marketId }: LoanManageSoftLiquidationProps) => {
  // Internal state
  const [repayBalance, setRepayBalance] = useState(0)

  // User data
  const llammaId = marketId || ''
  const market = getLlamaMarket(llammaId)
  const userLoanDetails = useUserLoanDetails(llammaId)

  const chainId = useChainId()
  const { address } = useAccount()
  const { data: userBalances } = useUserBalances({
    chainId,
    poolId: llammaId,
    userAddress: address,
  })
  const { userState } = userLoanDetails ?? {}

  // Loan data
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const { parameters: loanParameters } = loanDetails ?? {}

  // Tokens with usd rates
  const tokens = market && getTokens(market)
  const { data: stablecoinUsdRate } = useTokenUsdRate(
    { chainId, tokenAddress: tokens?.borrowToken?.address },
    !!tokens?.borrowToken?.address,
  )

  const { data: collateralTokenUsdRate } = useTokenUsdRate(
    { chainId, tokenAddress: tokens?.collateralToken?.address },
    !!tokens?.collateralToken?.address,
  )

  const stablecoinToken = useMemo(
    () => tokens?.borrowToken && { ...tokens.borrowToken, usdRate: stablecoinUsdRate },
    [tokens?.borrowToken, stablecoinUsdRate],
  )

  const collateralToken = useMemo(
    () => tokens?.collateralToken && { ...tokens.collateralToken, usdRate: collateralTokenUsdRate },
    [tokens?.collateralToken, collateralTokenUsdRate],
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
  const repay = useRepay({ market })
  const onRepay = useCallback(() => {
    repay.mutate({ debt: repayBalance.toString() })
  }, [repay, repayBalance])

  const improveHealthTab: ImproveHealthProps = {
    debtToken,
    userBalance: userBalances?.borrowed ?? 0,
    status: repay.isPending ? 'repay' : 'idle',
    onDebtBalance: setRepayBalance,
    onRepay,
    onApproveLimited: () => {},
    onApproveInfinite: () => {},
  }

  // Close position tab
  const closePosition = useClosePosition({ market })
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
