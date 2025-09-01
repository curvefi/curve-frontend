import type { NetworkEnum } from '@/llamalend/llamalend.types'
import type { BorrowForm, BorrowFormQueryParams, Token } from '@/llamalend/widgets/borrow/borrow.types'
import { useBorrowExpectedCollateral } from '@/llamalend/widgets/borrow/queries/borrow-expected-collateral.query'
import RouteDetails from '@/llamalend/widgets/RouteDetails'
import { t } from '@ui-kit/lib/i18n'
import { useBorrowRouteImage } from '../queries/borrow-route-image.query'

export const AdvancedBorrowOptions = ({
  network,
  params,
  values: { debt, userBorrowed },
  collateralToken,
  borrowToken,
}: {
  network: NetworkEnum
  params: BorrowFormQueryParams
  values: BorrowForm
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}) => {
  const { data: routeImage, isLoading: routeImageLoading, error: routeImageError } = useBorrowRouteImage(params)
  const {
    data: expectedCollateral,
    isLoading: expectedCollateralLoading,
    error: expectedCollateralError,
  } = useBorrowExpectedCollateral(params)
  return (
    <RouteDetails
      network={network}
      $minWidth="260px"
      loading={routeImageLoading || expectedCollateralLoading}
      swapFrom={borrowToken}
      swapFromAmounts={[
        ...(debt ? [{ value: `${debt ?? 0}`, label: t`Debt` }] : []),
        ...(userBorrowed ? [{ value: `${userBorrowed}`, label: t`Wallet` }] : []),
      ]}
      swapTo={collateralToken}
      swapToAmounts={[expectedCollateral?.collateralFromDebt, expectedCollateral?.collateralFromUserBorrowed]}
      nonSwapAmount={{
        value: expectedCollateral?.userCollateral,
        label: '',
      }}
      total={expectedCollateral?.totalCollateral}
      avgPrice={expectedCollateral?.avgPrice}
      type="collateral"
      routeImage={routeImage}
    />
  )
}
