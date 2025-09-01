import type { NetworkEnum } from '@/llamalend/llamalend.types'
import RouteDetails from '@/llamalend/widgets/RouteDetails'
import { t } from '@ui-kit/lib/i18n'
import type { BorrowForm, BorrowFormQueryParams, Token } from '../borrow.types'
import { useBorrowExpectedCollateral } from '../queries/borrow-expected-collateral.query'
import { useBorrowRouteImage } from '../queries/borrow-route-image.query'

export const AdvancedBorrowOptions = ({
  network,
  params,
  values: { debt, userBorrowed, leverage },
  collateralToken,
  borrowToken,
}: {
  network: NetworkEnum
  params: BorrowFormQueryParams
  values: BorrowForm
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}) => {
  const hasLeverage = !!leverage
  const {
    data: routeImage,
    isLoading: routeImageLoading,
    error: routeImageError,
  } = useBorrowRouteImage(params, hasLeverage)
  const {
    data: expectedCollateral,
    isLoading: expectedCollateralLoading,
    error: expectedCollateralError,
  } = useBorrowExpectedCollateral(params, hasLeverage)
  return (
    hasLeverage && (
      <RouteDetails
        network={network}
        $minWidth="260px"
        loading={routeImageLoading || expectedCollateralLoading}
        swapFrom={borrowToken}
        swapTo={collateralToken}
        swapFromAmounts={[
          { value: `${debt ?? 0}`, label: t`Debt` },
          { value: `${userBorrowed ?? 0}`, label: t`Wallet` },
        ]}
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
  )
}
